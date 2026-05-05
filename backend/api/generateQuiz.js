import admin from 'firebase-admin';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import moment from 'moment';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { MATH_QUIZZ } from '../lib/collections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(backendRoot, '.env') });
  dotenv.config({ path: path.join(projectRoot, '.env.local'), override: false });
}

let db;
let messaging;
let openAi;

const OPENAI_MAX_RETRIES = 10;
const RETRY_DELAY_MS = 1200;

const normalizeServiceAccountEnv = (value) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env');
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Empty FIREBASE_SERVICE_ACCOUNT env');
  }

  if (trimmed.startsWith('{')) {
    return trimmed.replace(
      /"private_key"\s*:\s*"([\s\S]*?)"/,
      (_, privateKey) => `"private_key":"${privateKey.replace(/\r?\n/g, '\\n')}"`
    );
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return normalizeServiceAccountEnv(trimmed.slice(1, -1));
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8').trim();
    if (decoded.startsWith('{')) {
      return normalizeServiceAccountEnv(decoded);
    }
  } catch (error) {
    console.warn('FIREBASE_SERVICE_ACCOUNT base64 decode failed:', error?.message ?? error);
  }

  throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64 JSON');
};

const getFirebaseServiceAccount = () => {
  const normalizedValue = normalizeServiceAccountEnv(process.env.FIREBASE_SERVICE_ACCOUNT);
  const serviceAccount = JSON.parse(normalizedValue);

  if (typeof serviceAccount?.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
};

// ✅ Firebase init
const ensureFirebase = () => {
  if (!db || !messaging) {
    if (!admin.apps.length) {
      const serviceAccount = getFirebaseServiceAccount();

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    db = admin.firestore();
    messaging = admin.messaging();
  }
};

// ✅ OpenAI init
const ensureOpenAi = () => {
  if (!openAi && process.env.OPENAI_API_KEY) {
    openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJsonSafely = (text, label) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (nestedError) {
        console.error(`${label} JSON parse failed after extraction:`, nestedError?.message ?? nestedError);
      }
    }

    console.error(`${label} JSON parse failed:`, typeof text === 'string' ? text.slice(0, 800) : text);
    return null;
  }
};

const getQuestionCount = (quizData) => {
  if (!quizData || typeof quizData !== 'object') {
    return 0;
  }

  return Array.isArray(quizData?.English) ? quizData.English.length : 0;
};

const hasValidQuizData = (quizData) => getQuestionCount(quizData) > 0;

const getQuizLanguageCounts = (quizData) => ({
  English: Array.isArray(quizData?.English) ? quizData.English.length : 0,
  Hindi: Array.isArray(quizData?.Hindi) ? quizData.Hindi.length : 0,
  Punjabi: Array.isArray(quizData?.Punjabi) ? quizData.Punjabi.length : 0,
});

const normalizeQuestion = (question) => {
  if (!question || typeof question !== 'object') {
    return null;
  }

  const normalizedQuestionText = typeof question?.question === 'string'
    ? question.question.trim()
    : '';

  const normalizedOptions = Array.isArray(question?.options)
    ? question.options
      .map((option) => typeof option === 'string' ? option.trim() : '')
      .filter(Boolean)
    : [];

  const rawCorrectAnswer = typeof question?.correctAnswer === 'string'
    ? question.correctAnswer.trim()
    : '';

  if (!normalizedQuestionText || normalizedOptions.length !== 4 || !rawCorrectAnswer) {
    return null;
  }

  const uniqueOptions = new Set(normalizedOptions.map((option) => option.toLowerCase()));
  if (uniqueOptions.size !== 4) {
    return null;
  }

  const matchedCorrectAnswer = normalizedOptions.find(
    (option) => option === rawCorrectAnswer || option.toLowerCase() === rawCorrectAnswer.toLowerCase()
  );

  if (!matchedCorrectAnswer) {
    return null;
  }

  return {
    question: normalizedQuestionText,
    options: normalizedOptions,
    correctAnswer: matchedCorrectAnswer,
  };
};

const getStoredQuiz = async (key) => {
  const snapshot = await db?.collection(key)?.doc('LISTINGDOC')?.get();

  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();
  return hasValidQuizData(data?.questions) ? data.questions : null;
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeReadingEntry = (entry, fields = []) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const normalized = {};

  for (const field of fields) {
    if (!isNonEmptyString(entry?.[field])) {
      return null;
    }

    normalized[field] = entry[field].trim();
  }

  return normalized;
};

const normalizeReadingPayload = (payload, schemaByLanguage) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const normalized = {};

  for (const [language, fields] of Object.entries(schemaByLanguage)) {
    const normalizedEntry = normalizeReadingEntry(payload?.[language], fields);

    if (!normalizedEntry) {
      return null;
    }

    normalized[language] = normalizedEntry;
  }

  return normalized;
};

const hasValidReadingContent = (content, schemaByLanguage) =>
  Boolean(normalizeReadingPayload(content, schemaByLanguage));

const getStoredReadingContent = async (key, schemaByLanguage) => {
  const snapshot = await db?.collection(key)?.doc('LISTINGDOC')?.get();

  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();
  return hasValidReadingContent(data?.content, schemaByLanguage) ? data.content : null;
};

const callOpenAiJson = async (input, label) => {
  ensureOpenAi();

  if (!openAi) {
    console.warn('OpenAI not configured');
    return null;
  }

  for (let attempt = 1; attempt <= OPENAI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await openAi.responses.create({
        model: 'gpt-5-mini',
        input,
      });

      const text = response?.output_text;
      const parsed = parseJsonSafely(text, label);

      if (parsed) {
        return parsed;
      }
    } catch (error) {
      console.error(`${label} attempt ${attempt} failed:`, error?.message ?? error);
    }

    if (attempt < OPENAI_MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  return null;
};

const callOpenAiJsonWithOptions = async ({ input, label, model = 'gpt-5-mini' }) => {
  ensureOpenAi();

  if (!openAi) {
    console.warn('OpenAI not configured');
    return null;
  }

  for (let attempt = 1; attempt <= OPENAI_MAX_RETRIES; attempt += 1) {
    try {
      const response = await openAi.responses.create({
        model,
        input,
      });

      const text = response?.output_text;
      const parsed = parseJsonSafely(text, label);

      console.log(text,"><<<===========238",parsed)

      if (parsed) {
        return parsed;
      }
    } catch (error) {
      console.error(`${label} attempt ${attempt} failed:`, error?.message ?? error);
    }

    if (attempt < OPENAI_MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  return null;
};

// ✅ Shuffle + map to A/B/C/D
const shuffleAndFormatQuiz = (questions) => {
  const letters = ["A", "B", "C", "D"];

  return questions?.map((rawQuestion) => {
    const q = normalizeQuestion(rawQuestion);
    if (!q) return null;

    const options = [...q.options];

    // Fisher-Yates shuffle
    for (let i = options?.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options?.findIndex(
      (opt) => opt === q.correctAnswer
    );

    if (correctIndex === -1) return null;

    return {
      question: q.question,
      options,
      answer: letters[correctIndex],
    };
  })?.filter(Boolean);
};

const fetchNews = async () => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.warn('NEWS_API_KEY missing in environment');
    return '';
  }

  const newsTopics = [
    'india', 'world', 'politics', 'economy',
    'technology', 'science', 'health',
    'entertainment', 'sports'
  ];

  const startDate = moment('2025-01-01');
  const today = moment();
  const daysSinceStart = today?.diff(startDate, 'days');
  const topicIndex = daysSinceStart % newsTopics?.length;
  const topicOfTheDay = newsTopics[topicIndex];
  const queryTopic = topicOfTheDay === 'india' ? 'India' : topicOfTheDay;
  const countryCode = 'in';
  const languageCode = 'en';
  const encodedApiKey = encodeURIComponent(apiKey);

  const fetchGNews = async (url) => {
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.errors?.[0] || data?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  };

  try {
    const searchAttempts = [
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(queryTopic)}&lang=${languageCode}&country=${countryCode}&max=10&apikey=${encodedApiKey}`,
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(`${queryTopic} news`)}&lang=${languageCode}&country=${countryCode}&max=10&apikey=${encodedApiKey}`,
      `https://gnews.io/api/v4/top-headlines?category=general&lang=${languageCode}&country=${countryCode}&max=10&apikey=${encodedApiKey}`,
      `https://gnews.io/api/v4/top-headlines?category=world&lang=${languageCode}&country=${countryCode}&max=10&apikey=${encodedApiKey}`,
    ];

    for (const url of searchAttempts) {
      try {
        const responseData = await fetchGNews(url);
        const articles = responseData?.articles ?? [];

        if (articles.length) {
          return articles
            ?.slice(0, 8)
            ?.map((a, i) => `${i + 1}. ${a?.title} - ${a?.description ?? ''}`)
            ?.join('\n');
        }
      } catch (error) {
        console.warn(`News search failed for "${url}":`, error?.message ?? error);
      }
    }

    console.warn('No news articles found after fallback searches');
    return '';

  } catch (err) {
    console.error('News fetch failed:', err);
    return '';
  }
};

const generateQuizFromNews = async (news) => {
  const parsed = await callOpenAiJson(`
You are an Expert Current Affairs Quiz Generator.

TASK:
Generate exactly 25 multiple-choice questions based ONLY on the NEWS provided.

LANGUAGE RULE:
- Each question must exist in THREE languages: English, Hindi, and Punjabi.
- English[i], Hindi[i], and Punjabi[i] MUST represent the SAME question and answers.
- Hindi and Punjabi must be accurate translations of English (question, options, correctAnswer).
- Keep EXACT SAME ORDER in all three arrays.

STRICT RULES:
- Return ONLY valid JSON object.
- Do NOT include any explanation or extra text.
- Do NOT use markdown or backticks.
- Each question must have exactly 4 unique options.
- Do NOT label A/B/C/D.
- "correctAnswer" must EXACTLY match one option.
- Questions must be NEW and based ONLY on the NEWS provided.
- Do NOT generate generic or repeated questions.
- Wrong options should be close to correct answer.

RANDOMIZATION RULE:
- Shuffle categories internally
- Shuffle answer order
- Use different topics each time
- Use different difficulty distribution order
- Use different years and statistics

OUTPUT FORMAT (STRICT):

{
  "English": [
    {
      "category": "India | World | Politics | Economy | Technology | Science | Health | Entertainment | Sports",
      "question": "string",
      "options": ["option1","option2","option3","option4"],
      "correctAnswer": "exact option text"
    }
  ],
  "Hindi": [
    {
      "category": "same as English[i]",
      "question": "translated question",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ],
  "Punjabi": [
    {
      "category": "same as English[i]",
      "question": "Punjabi translation (Gurmukhi script)",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ]
}

IMPORTANT:
- Total = 25 questions in EACH language (English, Hindi, Punjabi)
- English[i], Hindi[i], Punjabi[i] MUST exactly match
- Maintain SAME order across all arrays
- Punjabi MUST be in proper Gurmukhi script (not Hindi/romanized)
- Maintain category distribution across all questions
- If output is invalid JSON, regenerate

NEWS:
${news}
`, 'Current Affairs');

  if (!parsed) {
    return null;
  }

  const englishQuestions = parsed?.English;
  const hindiQuestions = parsed?.Hindi;
  const punjabiQuestions = parsed?.Punjabi;

  return {
    English: shuffleAndFormatQuiz(englishQuestions),
    Hindi: shuffleAndFormatQuiz(hindiQuestions),
    Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
  };
};

const saveQuiz = async (data, key, title) => {
  const payload = {
    questions: data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db?.collection(key)?.doc("LISTINGDOC")?.set({
    ...payload,
    title: `${title}`,
  });

  console.log(`[saveQuiz] ${key} saved`, getQuizLanguageCounts(data));
};

const saveReadingContent = async (content, key, title) => {
  const payload = {
    content,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db?.collection(key)?.doc('LISTINGDOC')?.set({
    ...payload,
    title,
  });

  console.log(`[saveReadingContent] ${key} saved`);
};

// ✅ Send Notifications
export const sendNotifications = async () => {
  ensureFirebase();

  const snapshot = await db.collection('USER_DEV_TOKENS').get();

  const tokenRecords = [];
  const tokenSet = new Set();

  snapshot.forEach((doc) => {
    const token = typeof doc.data()?.token === 'string' ? doc.data().token.trim() : '';

    if (!token || tokenSet.has(token)) {
      return;
    }

    tokenSet.add(token);
    tokenRecords.push({
      docId: doc.id,
      token,
      platform: doc.data()?.platform ?? null,
      updatedAt: doc.data()?.updatedAt ?? null,
    });
  });

  const tokens = tokenRecords.map((record) => record.token);

  if (!tokens.length) {
    console.warn('No tokens found');
    return {
      sentAt: new Date().toISOString(),
      successCount: 0,
      failureCount: 0,
      invalidTokenCount: 0,
      duplicateTokenCount: 0,
      failureReasons: [],
    };
  }

  const notificationMessage = getNotificationMessageForToday();
  const notificationMeta = notificationMessage?.meta ?? null;
  const notificationPayload = {
    ...notificationMessage,
  };
  const sentAt = new Date().toISOString();

  delete notificationPayload.meta;

  console.log('[sendNotifications] Sending notification', {
    sentAt,
    dayKey: notificationMeta?.dayKey,
    dayName: notificationMeta?.dayName,
    title: notificationPayload?.notification?.title,
    body: notificationPayload?.notification?.body,
    tokenCount: tokens.length,
  });

  const res = await messaging.sendEachForMulticast({
    ...notificationPayload,
    tokens,
  });

  const failureDetails = [];
  const invalidTokenDocIds = [];

  res.responses.forEach((response, index) => {
    if (response.success) {
      return;
    }

    const tokenRecord = tokenRecords[index];
    const errorCode = response.error?.code ?? 'unknown';
    const errorMessage = response.error?.message ?? 'Unknown error';

    failureDetails.push({
      docId: tokenRecord?.docId ?? null,
      token: tokenRecord?.token ?? null,
      platform: tokenRecord?.platform ?? null,
      errorCode,
      errorMessage,
    });

    if (
      errorCode === 'messaging/registration-token-not-registered' ||
      errorCode === 'messaging/invalid-registration-token'
    ) {
      invalidTokenDocIds.push(tokenRecord?.docId);
    }
  });

  const uniqueInvalidTokenDocIds = [...new Set(invalidTokenDocIds.filter(Boolean))];

  if (uniqueInvalidTokenDocIds.length) {
    await Promise.all(
      uniqueInvalidTokenDocIds.map((docId) =>
        db.collection('USER_DEV_TOKENS').doc(docId).delete().catch((error) => {
          console.warn('[sendNotifications] Failed to delete invalid token doc', {
            docId,
            message: error?.message ?? error,
          });
        })
      )
    );
  }

  console.log('[sendNotifications] Delivery summary', {
    sentAt,
    successCount: res.successCount,
    failureCount: res.failureCount,
    invalidTokenCount: uniqueInvalidTokenDocIds.length,
    failureReasons: failureDetails,
  });

  return {
    sentAt,
    successCount: res.successCount,
    failureCount: res.failureCount,
    invalidTokenCount: uniqueInvalidTokenDocIds.length,
    duplicateTokenCount: snapshot.size - tokenRecords.length,
    notification: notificationPayload.notification,
    notificationMeta,
    failureReasons: failureDetails,
  };
};

const generateTrickyQuestion = async () => {
  const parsed = await callOpenAiJson(trickyQuestionPrompt, 'Tricky Questions');

  if (!parsed) {
    return null;
  }

  const englishQuestions = Array.isArray(parsed?.English) ? parsed?.English : [];
  const hindiQuestions = Array.isArray(parsed?.Hindi) ? parsed?.Hindi : [];
  const punjabiQuestions = Array.isArray(parsed?.Punjabi) ? parsed?.Punjabi : [];

  return {
    English: shuffleAndFormatQuiz(englishQuestions),
    Hindi: shuffleAndFormatQuiz(hindiQuestions),
    Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
  };
};

const generateMathQuestion = async () => {
  const parsed = await callOpenAiJson(mathPrompt, 'Math Questions');

  if (!parsed) {
    return null;
  }

  const englishQuestions = Array.isArray(parsed?.English) ? parsed?.English : [];
  const hindiQuestions = Array.isArray(parsed?.Hindi) ? parsed?.Hindi : [];
  const punjabiQuestions = Array.isArray(parsed?.Punjabi) ? parsed?.Punjabi : [];

  return {
    English: shuffleAndFormatQuiz(englishQuestions),
    Hindi: shuffleAndFormatQuiz(hindiQuestions),
    Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
  };
};



const generateGeneralKnowledgeQuestion = async () => {
  const parsed = await callOpenAiJson(generalKnowledgePrompt, 'General Knowledge');

  if (!parsed) {
    return null;
  }

  const englishQuestions = parsed?.English;
  const hindiQuestions = parsed?.Hindi;
  const punjabiQuestions = parsed?.Punjabi;
  return {
    English: shuffleAndFormatQuiz(englishQuestions),
    Hindi: shuffleAndFormatQuiz(hindiQuestions),
    Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
  };
};

const generateEnglishQuestion = async () => {
  const parsed = await callOpenAiJson(generateEnglishQuestionPrompt, 'English Quiz');

  if (!parsed) {
    return null;
  }

  const englishQuestions = Array.isArray(parsed?.Questions) ? parsed?.Questions : [];

  return {
    English: shuffleAndFormatQuiz(englishQuestions),
  };
}

const generateChildQuizz = async () => {
  const parsed = await callOpenAiJsonWithOptions({
    label: 'Kids Quiz',
    model: 'gpt-5-mini',
    input: kidsKnowledgePrompt,
  });

  if (!parsed) {
    console.error('[Kids Quiz] OpenAI returned no parsed JSON');
    return null;
  }

  const englishQuestions = Array.isArray(parsed?.English) ? parsed?.English : [];
  const hindiQuestions = Array.isArray(parsed?.Hindi) ? parsed?.Hindi : [];

  console.log('[Kids Quiz] Parsed counts', {
    English: englishQuestions.length,
    Hindi: hindiQuestions.length,
  });

  const formattedQuiz = {
    English: shuffleAndFormatQuiz(englishQuestions),
    Hindi: shuffleAndFormatQuiz(hindiQuestions),
  };

  console.log('[Kids Quiz] Formatted counts', getQuizLanguageCounts(formattedQuiz));

  return formattedQuiz;
}

const STORY_SCHEMA = {
  English: ['title', 'story', 'moral'],
  Hindi: ['title', 'story', 'moral'],
};

const POEM_SCHEMA = {
  English: ['title', 'poem'],
  Hindi: ['title', 'poem'],
};

const generateKidsStory = async () => {
  const parsed = await callOpenAiJsonWithOptions({
    label: 'Kids Story',
    model: 'gpt-5-mini',
    input: kidsStoryPrompt,
  });

  if (!parsed) {
    console.error('[Kids Story] OpenAI returned no parsed JSON');
    return null;
  }

  const normalizedStory = normalizeReadingPayload(parsed, STORY_SCHEMA);

  if (!normalizedStory) {
    console.error('[Kids Story] Invalid story payload shape', parsed);
    return null;
  }

  return normalizedStory;
};

const generateKidsPoem = async () => {
  const parsed = await callOpenAiJsonWithOptions({
    label: 'Kids Poem',
    model: 'gpt-5-mini',
    input: kidsPoemPrompt,
  });

  if (!parsed) {
    console.error('[Kids Poem] OpenAI returned no parsed JSON');
    return null;
  }

  const normalizedPoem = normalizeReadingPayload(parsed, POEM_SCHEMA);

  if (!normalizedPoem) {
    console.error('[Kids Poem] Invalid poem payload shape', parsed);
    return null;
  }

  return normalizedPoem;
};

const runReadingContentProcess = async ({
  key,
  title,
  label,
  schemaByLanguage,
  run,
} = {}) => {
  try {
    ensureFirebase();

    let content = null;
    let source = 'generated';

    try {
      content = await run();
    } catch (error) {
      console.error(`${label} generation crashed:`, error?.message ?? error);
    }

    if (hasValidReadingContent(content, schemaByLanguage)) {
      await saveReadingContent(content, key, title);
    } else {
      const storedContent = await getStoredReadingContent(key, schemaByLanguage);

      if (!hasValidReadingContent(storedContent, schemaByLanguage)) {
        throw new Error(`${label} failed and no cached content exists`);
      }

      content = storedContent;
      source = 'fallback';
      console.warn(`${label} reused cached content`);
    }

    return {
      success: true,
      label,
      title,
      source,
      content,
    };
  } catch (error) {
    console.error(`${label} process failed:`, error?.message ?? error);
    return {
      success: false,
      label,
      title,
      message: error?.message ?? 'Internal error',
    };
  }
};

export const runKidsStoryProcess = async () =>
  runReadingContentProcess({
    key: 'KIDS_STORY',
    title: 'Kids Story',
    label: 'Kids Story',
    schemaByLanguage: STORY_SCHEMA,
    run: () => generateKidsStory(),
  });

const QUIZ_GENERATION_JOBS = [
  {
    key: 'CURRENT_AFFAIRS',
    title: 'Current Affairs',
    label: 'Current Affairs',
    needsNews: true,
    run: ({ news }) => (news ? generateQuizFromNews(news) : null),
  },
  {
    key: 'PUZZLES',
    title: 'Tricky Quiz',
    label: 'Tricky Questions',
    run: () => generateTrickyQuestion(),
  },
  {
    key: 'GK_QUESTIONS',
    title: 'General Knowledge',
    label: 'General Knowledge',
    run: () => generateGeneralKnowledgeQuestion(),
  },
  {
    key: 'KIDS_QUESTIONS',
    title: 'Kids Quiz',
    label: 'Kids Quiz',
    run: () => generateChildQuizz(),
  },
  {
    key: 'ENG_QUESTIONS',
    title: 'English Quiz',
    label: 'English Quiz',
    run: () => generateEnglishQuestion(),
  },


  {
    key: MATH_QUIZZ,
    title: 'Math Quiz',
    label: 'Math Quiz',
    run: () => generateMathQuestion(),
  },


];


const runQuizGenerationJobs = async ({
  jobs = QUIZ_GENERATION_JOBS,
  label = 'manual',
  sendNotification = false,
} = {}) => {
  ensureFirebase();
  const processStartedAt = Date.now();
  const needsNews = jobs.some((job) => job.needsNews);
  const news = needsNews ? await fetchNews() : '';
  const generationResults = [];

  for (const job of jobs) {
    const jobStartedAt = Date.now();
    let quizData = null;
    let source = 'generated';

    try {
      quizData = await job.run({ news });
    } catch (error) {
      console.error(`${job.label} generation crashed:`, error?.message ?? error);
    }

    console.log(`[${job.label}] Generated counts`, getQuizLanguageCounts(quizData));

    if (hasValidQuizData(quizData)) {
      await saveQuiz(quizData, job.key, job.title);
    } else {
      const storedQuiz = await getStoredQuiz(job.key);

      if (!hasValidQuizData(storedQuiz)) {
        throw new Error(`${job.label} failed and no cached quiz exists`);
      }

      quizData = storedQuiz;
      source = 'fallback';
      console.warn(`${job.label} reused cached quiz data`);
      console.log(`[${job.label}] Fallback counts`, getQuizLanguageCounts(quizData));
    }

    generationResults.push({
      label: job.label,
      count: getQuestionCount(quizData),
      source,
      durationMs: Date.now() - jobStartedAt,
    });

    console.log(
      `[${job.label}] Completed in ${Date.now() - jobStartedAt}ms via ${source}`
    );
  }

  console.log('Generated quizzes:', generationResults);

  const fallbackCount = generationResults.filter((result) => result.source === 'fallback')?.length;

  if (sendNotification) {
    await sendNotifications();
  }

  return {
    success: true,
    message: fallbackCount
      ? `Quiz created (${label}) with ${fallbackCount} cached fallback(s)`
      : `Quiz created (${label})`,
    notificationsSent: Boolean(sendNotification),
    durationMs: Date.now() - processStartedAt,
    results: generationResults,
  };
};

export const runMainQuizProcess = async ({ label = 'main-only', sendNotification = false } = {}) =>
  runQuizGenerationJobs({
    jobs: QUIZ_GENERATION_JOBS.filter((job) => job.key !== 'KIDS_QUESTIONS'),
    label,
    sendNotification,
  });

export const runChildQuizProcess = async ({ label = 'child-quiz-only' } = {}) =>
  runQuizGenerationJobs({
    jobs: QUIZ_GENERATION_JOBS.filter((job) => job.key === 'KIDS_QUESTIONS'),
    label,
    sendNotification: false,
  });



export const runQuizProcess = async ({ label = 'manual', sendNotification = false } = {}) => {

  try {
    return await runQuizGenerationJobs({
      jobs: QUIZ_GENERATION_JOBS,
      label,
      sendNotification,
    });
  } catch (err) {
    console.error('Process error:', err);
    return { success: false, message: 'Internal error' };
  }
};

const message = {
  notification: {
    title: '📖 New Quiz, Puzzle, Tricky Questions Available!..',
    body: '🧠 Try today’s quiz now! 💡💡💡',
  },

  data: {
    screen: 'QuizScreen',
    quizId: 'daily_quiz',
    type: 'DAILY_QUIZ'
  },

  android: {
    priority: 'high',
    ttl: 3600 * 1000,
    collapseKey: 'daily_quiz',
    notification: {
      channelId: 'quiz_channel_heads_up_v6',
      sound: 'default',
      priority: 'high',
      visibility: 'public',
    },
  },

  apns: {
    headers: {
      'apns-priority': '10',
    },
    payload: {
      aps: {
        sound: 'default',
        badge: 1,
        contentAvailable: true,
        category: 'QUIZ_CATEGORY',
      },
    },
  },

  topic: 'daily-quiz',
};

const trickyQuestionPrompt = `
You are a High-Entropy Tricky Quiz Generator.

UNIQUENESS MODE: ENABLED
Each request MUST generate completely new questions.

Generate using:
- different numbers
- different names
- different objects
- different logic traps
- different reasoning patterns
- different domains emphasis

Never use classic puzzles:
bat and ball
clock angle
train crossing
coin toss
water jug
age puzzle
percentage trick classics

TASK:
Generate exactly 10 tricky MCQs.

LANGUAGE RULE:
Each question must exist in English, Hindi, Punjabi.
All three must match exactly.
Same order required.

DIFFICULTY:
5 medium
5 hard

DOMAINS:
Math
Science
Logic
Everyday Life

STRICT RULES:
Return JSON only
No explanation
4 options
correctAnswer exact match
No repetition

RANDOMIZATION:
Use new numbers each time
Use new scenarios each time
Shuffle option order
Shuffle domains
Use new reasoning traps

OUTPUT:
{
"English":[...],
"Hindi":[...],
"Punjabi":[...]
}

If similar to common quizzes regenerate.
`;



const generateEnglishQuestionPrompt = `
You are an Advanced English Grammar Quiz Generator.

UNIQUENESS MODE: STRICT

Generate completely NEW grammar questions.

Avoid common examples:
If I were you
She has been working
Neither of the boys
He did not went

TASK:
Generate exactly 25 MCQs.

DIFFICULTY:
easy → medium → hard → expert

TOPICS:
tenses
articles
prepositions
voice
speech
conditionals
modals
error correction
sentence improvement
vocabulary
idioms
advanced grammar
agreement
parallelism
punctuation

RANDOMIZATION:
different sentence structures
different verbs
different subjects
different contexts
different grammar traps

STRICT:
JSON only
4 options
correctAnswer exact match
no explanation

OUTPUT:
{
"Questions":[]
}

If similar regenerate.
`;

const kidsKnowledgePrompt = `
You are a Kids Quiz Generator (Class 1-5).

UNIQUENESS MODE: STRICT
Generate completely NEW fun questions each request.

TASK:
Generate exactly 25 MCQs.

TOPICS:
Geography
Math
English
Hindi
Sports
Animals
Cartoons
Computer
Science

DIFFICULTY:
easy to medium

LANGUAGE OUTPUT FORMAT:
English Hindi 
same order
same mapping

LANGUAGE RULES (VERY IMPORTANT):
- English subject question MUST be in English
- Hindi subject question MUST be in Hindi
- Math questions can be in English
- Science questions can be in English
- Computer questions can be in English
- Geography questions can be in English
- DO NOT mix languages inside one question
- Options must match the question language
- correctAnswer must match option text exactly

STYLE:
fun
visual imagination
odd one out
simple logic
everyday life

RANDOMIZATION:
different animals
different sports
different objects
different numbers
different examples

STRICT:
JSON only
4 options
no explanation
correctAnswer exact match

OUTPUT:
{
"English": [],
"Hindi": [],
}

If similar regenerate.
`;

const kidsStoryPrompt = `
You are a Kids Story Generator (Class 1-5).

UNIQUENESS MODE: STRICT
Generate a completely NEW story every request.
DO NOT repeat themes, characters, or plots from previous outputs.

TASK:
Generate exactly 1 short story.

STORY RULES:
- Length: 120–180 words per language (token-friendly)
- Simple vocabulary (easy to read for kids)
- Clear beginning, middle, end
- Engaging and imaginative
- Include a clear moral

TOPICS (randomize):
Animals
Friendship
Honesty
Kindness
Sharing
Courage
School life
Nature
Family
Adventure

CHARACTERS:
Use different names, animals, or objects every time.

LANGUAGE OUTPUT FORMAT:
English Hindi
same order
same mapping

LANGUAGE RULES (VERY IMPORTANT):
- English story must be fully in English
- Hindi story must be fully in Hindi
- DO NOT mix languages in one story
- Moral must be in the same language as the story

STYLE:
Fun
Imaginative
Positive
Easy to understand
Emotionally warm

RANDOMIZATION:
Different characters
Different setting
Different lesson
Different situation

STRICT:
JSON only
No explanation outside JSON
No repetition

OUTPUT:
{
  "English": {
    "title": "",
    "story": "",
    "moral": ""
  },
  "Hindi": {
    "title": "",
    "story": "",
    "moral": ""
  }
}

If similar to previous stories, regenerate completely.
`;
const kidsPoemPrompt = `
You are a Kids Poem Generator (Class 1-5).

UNIQUENESS MODE: STRICT
Generate a completely NEW poem every request.
DO NOT repeat themes, rhymes, or patterns from previous outputs.

TASK:
Generate exactly 1 short poem.

POEM RULES:
- Length: 8–12 lines per language (token-friendly)
- Each line short and simple
- Easy vocabulary for kids
- Use rhyming (AABB or ABAB preferred)
- Fun and rhythmic
- Imaginative and engaging
- Include a light message or learning

TOPICS (randomize):
Animals
Nature
School
Friendship
Family
Seasons
Rain
Sun
Playtime
Dreams
Kindness
Adventure

CHARACTERS:
Use different animals, kids, or objects every time.

LANGUAGE OUTPUT FORMAT:
English Hindi
same order
same mapping

LANGUAGE RULES (VERY IMPORTANT):
- English poem must be fully in English
- Hindi poem must be fully in Hindi
- DO NOT mix languages in one poem
- Keep rhyme natural in each language (not direct translation)

STYLE:
Fun
Playful
Rhythmic
Simple
Colorful imagery

RANDOMIZATION:
Different rhyme scheme
Different theme
Different characters
Different setting

STRICT:
JSON only
No explanation outside JSON
No repetition

OUTPUT:
{
  "English": {
    "title": "",
    "poem": ""
  },
  "Hindi": {
    "title": "",
    "poem": ""
  }
}

If similar to previous poems, regenerate completely.
`;

const mathPrompt = `
You are a High-Entropy Math Quiz Generator.

UNIQUENESS MODE: ENABLED
Each request MUST generate completely new questions.

Generate using:
- different numbers
- different variables
- different equations
- different graphs
- different theorems
- different word problems
- different reasoning patterns
- different difficulty scaling

Never use overused textbook examples or classic repeated problems.

TASK:
Generate exactly 25 tricky Math MCQs.

LANGUAGE RULE:
Each question must exist in:
- English
- Hindi
- Punjabi

All three must match exactly in meaning.
Same order required.

DIFFICULTY DISTRIBUTION:
- 5 Easy (Class 5–7 level)
- 10 Medium (Class 8–12 level)
- 10 Hard (JEE / Graduation level)

DOMAINS (MUST COVER MIX):
- Arithmetic
- Number System
- Algebra
- Geometry
- Mensuration
- Trigonometry
- Probability
- Statistics
- Coordinate Geometry
- Graphs & Functions
- Calculus (basic to moderate)
- Theorems & Applications

STRICT RULES:
- Return JSON only
- No explanations
- Each question must have 4 options
- Only one correct answer
- correctAnswer must EXACTLY match one option
- No repetition of concept or pattern
- Shuffle options
- Shuffle domains

RANDOMIZATION:
- Use new numbers each time
- Use new scenarios each time
- Mix conceptual + calculation questions
- Include real-life based math problems
- Include equation solving, graph interpretation, theorem application

OUTPUT FORMAT:
{
  "English":[...],
  "Hindi":[...],
  "Punjabi":[...]
}

If any question feels standard/common, regenerate it.
`;

const generalKnowledgePrompt = `
You are a High-Entropy General Knowledge Generator.

UNIQUENESS MODE: STRICT
Generate completely NEW questions every request.

Avoid:
common GK
textbook facts
capital-city basics
founder questions
simple history facts

Prefer:
rare facts
recent developments
lesser-known info
analytical GK

TASK:
Generate exactly 25 MCQs.

LANGUAGE RULE:
English Hindi Punjabi
must match 1-to-1
same order

DATE RULE:
Use today's current date as reference.
Exactly 5 out of 25 questions must be based on events from the last 6 months.
Remaining 20 questions must be from mixed older years such as 2024, 2023, 2022, 2021, 2020, 2019 or earlier.
Ensure a natural mix of years (do not cluster in one year).
Do not make all questions recent.
Do not make all questions old.
Mention the year/month inside the question when it is based on a time-specific event.

DIFFICULTY:
medium to hard

CATEGORIES:
India (4)
World (4)
Politics (4)
Economy (3)
Technology (3)
Science (3)
Health (2)
Entertainment (1)
Sports (1)

RANDOMIZATION:
shuffle categories
different years
different rankings
different reports
different phrasing
different entities

STRICT:
JSON only
4 options
no explanation
correctAnswer exact match

OUTPUT:
{
"English":[],
"Hindi":[],
"Punjabi":[]
}

If duplicate patterns regenerate.
`;



if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = String(process.argv[2] ?? 'all').trim().toLowerCase();

  const cliMap = {
    all: () => runQuizProcess({ label: 'cli-all' }),
    main: () => runMainQuizProcess({ label: 'cli-main' }),
    'child-quiz': () => runChildQuizProcess({ label: 'cli-child-quiz' }),
    story: () => runKidsStoryProcess(),
  };

  const selectedRunner = cliMap[mode];

  if (!selectedRunner) {
    console.error(`Unknown mode "${mode}". Use one of: ${Object.keys(cliMap).join(', ')}`);
    process.exit(1);
  }

  selectedRunner()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result?.success === false ? 1 : 0);
    })
    .catch((error) => {
      console.error('CLI process failed:', error);
      process.exit(1);
    });
}

const dayWiseMessages = {
  0: [ // Sunday
    "Aaj Sunday hai... par dimaag bhi holiday pe hai kya? 😜",
    "Chill mat karo itna… thoda quiz bhi kar lo 🧠",
  ],
  1: [ // Monday
    "Monday blues? Quiz se mood boost karo 💡",
    "Naya week, naya dimaag test 😏",
  ],
  2: [ // Tuesday
    "Tuesday ko bhi serious le lo thoda 😅",
    "Aaj ka quiz try kiya ya bas scroll hi kar rahe ho? 📱",
  ],
  3: [ // Wednesday
    "Half week ho gaya… dimaag ka half use mat karo 🤓",
    "Midweek challenge ready hai 🔥",
  ],
  4: [ // Thursday
    "Almost weekend… par pehle quiz complete karo 😎",
    "Thoda dimaag lagao… impress ho jaoge khud se 😏",
  ],
  5: [ // Friday
    "Friday hai boss… par brain off mat karo 😜",
    "Weekend se pehle ek smart move – quiz 💡",
  ],
  6: [ // Saturday
    "Saturday chill + thoda skill 😎",
    "Party baad mein… pehle quiz kar lo 🎯",
  ],
};

const getRandomArrayItem = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

const notificationMessagesByDay = {
  0: {
    dayName: 'Sunday',
    title: '☀️ Sunday mode on, but brain mode off mat karo 🧠',
    body: 'Aaj ka quiz khol lo 📚 aur weekend ko thoda productive bhi banao ✅',
  },
  1: {
    dayName: 'Monday',
    title: '💼 Monday blues ka best cure: ek quick quiz ⚡',
    body: 'Week ki starting smart honi chahiye 🚀 Aaj ka quiz try karo 📝',
  },
  2: {
    dayName: 'Tuesday',
    title: '🎯 Tuesday ko thoda serious lete hain 📖',
    body: 'GK, Math, English ya News Quiz 🧠 tumhara wait kar rahe hain ⏳',
  },
  3: {
    dayName: 'Wednesday',
    title: '🔥 Midweek mein dimaag ko bhi warm-up chahiye 🧠',
    body: 'Half week ho gaya 📅 ab half effort mat do 💪',
  },
  4: {
    dayName: 'Thursday',
    title: '🚀 Weekend ke pehle ek smart push 🎯',
    body: 'Quiz complete karo 📝 aur khud ko surprise karo 🌟',
  },
  5: {
    dayName: 'Friday',
    title: '🎉 Friday hai, par focus abhi baaki hai 🎯',
    body: 'Aaj ka quiz complete karke ✅ week strong finish karo 🏁',
  },
  6: {
    dayName: 'Saturday',
    title: '😎 Saturday chill + Saturday skill 🧠',
    body: 'Aaj ka smart move simple hai 💡 ek quiz attempt karo 📝',
  },
};

const getNotificationMessageForToday = (date = new Date()) => {
  const indiaDate = new Date(
    date.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })
  );

  const dayKey = indiaDate.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayMessages = notificationMessagesByDay[dayKey] ?? null;
  const selectedTitle = todayMessages?.title ?? null;
  const selectedBody = todayMessages?.body ?? null;

  if (!selectedTitle || !selectedBody) {
    return {
      ...message,
      meta: {
        dayKey,
        dayName: todayMessages?.dayName ?? dayNames[dayKey] ?? 'Unknown',
        source: 'fallback-static',
      },
    };
  }

  return {
    ...message,
    notification: {
      ...message.notification,
      title: selectedTitle,
      body: selectedBody,
    },
    data: {
      ...message.data,
      dayKey: String(dayKey),
      dayName: todayMessages?.dayName ?? dayNames[dayKey] ?? 'Unknown',
      selectedTitle,
      selectedBody,
    },
    meta: {
      dayKey,
      dayName: todayMessages?.dayName ?? dayNames[dayKey] ?? 'Unknown',
      source: 'day-wise-dynamic',
    },
  };
};
