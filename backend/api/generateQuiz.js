import admin from 'firebase-admin';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import moment from 'moment';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

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

// ✅ Send Notifications
export const sendNotifications = async () => {
  ensureFirebase();

  const snapshot = await db.collection('USER_DEV_TOKENS').get();

  const tokens = [];

  snapshot.forEach((doc) => {
    const t = doc.data()?.token;
    if (t) tokens.push(t);
  });

  if (!tokens.length) {
    console.warn('No tokens found');
    return {
      successCount: 0,
      failureCount: 0,
    };
  }


  const res = await messaging.sendEachForMulticast({
    ...message,
    tokens,
  });

  console.log(`${res?.successCount} notifications sent`);
  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
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



export const runQuizProcess = async ({ label = 'manual', sendNotification = false } = {}) => {

  try {
    ensureFirebase();
    const processStartedAt = Date.now();

    const news = await fetchNews();

    const generationJobs = [
      {
        key: 'CURRENT_AFFAIRS',
        title: 'Current Affairs',
        label: 'Current Affairs',
        run: () => (news ? generateQuizFromNews(news) : null),
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

    ];

    const generationResults = [];

    for (const job of generationJobs) {
      const jobStartedAt = Date.now();
      let quizData = null;
      let source = 'generated';

      try {
        quizData = await job.run();
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

  } catch (err) {
    console.error('Process error:', err);
    return { success: false, message: 'Internal error' };
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runQuizProcess({ label: 'api-call' });
}


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
