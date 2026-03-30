import admin from 'firebase-admin';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import moment from 'moment';
import { pathToFileURL } from 'url';



const generateEnglishQuestionPrompt = `You are an Expert English Grammar Quiz Generator.

TASK:
Generate exactly 25 multiple-choice questions to improve English grammar skills, ranging from Class 8 level to PhD level difficulty.

CONTENT RULES:

* Cover a mix of topics: tenses, articles, prepositions, voice, speech, conditionals, modals, error correction, sentence improvement, vocabulary, idioms, and advanced grammar.
* Questions must gradually increase in difficulty (easy → medium → hard → expert).
* Each question must be clear, practical, and useful for real-life English usage.
* Avoid repetition. Every question must be unique.

STRICT RULES:

* Return ONLY a valid JSON object.
* Do NOT include any explanation or extra text.
* Do NOT use markdown or backticks.
* Each question must have exactly 4 unique options.
* Do NOT label options as A/B/C/D.
* "correctAnswer" must EXACTLY match one option.
* Wrong options should be grammatically close or commonly confused choices.

RANDOMIZATION RULE:
- Shuffle categories internally
- Shuffle answer order
- Use different topics each time
- Use different difficulty distribution order
- Use different years and statistics

OUTPUT FORMAT:

{
"Questions": [
{
"category": "Grammar",
"question": "string",
"options": ["option1","option2","option3","option4"],
"correctAnswer": "exact option text"
}
]
}
`



if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

let db;
let messaging;
let openAi;

// ✅ Firebase init
const ensureFirebase = () => {
  if (!db || !messaging) {
    if (!admin.apps.length) {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT env');
      }

      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

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

// ✅ Shuffle + map to A/B/C/D
const shuffleAndFormatQuiz = (questions) => {
  const letters = ["A", "B", "C", "D"];

  return questions?.map((q) => {
    if (!q?.options || q?.options?.length !== 4) return null;

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
    throw new Error('NEWS_API_KEY missing in environment');
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

  ensureOpenAi();

  if (!openAi) {
    console.warn('OpenAI not configured');
    return [];
  }

  try {
    const res = await openAi.responses.create({
      model: "gpt-5-mini",
      input: `
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
`
    });

    const text = res?.output_text;
    let parsed;
    // console.log("RAW AI RESPONSE:\n", text,JSON.stringify(res));
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return [];
    }

    console.log("Parsed GK Questions:\n", parsed?.English, "======>>>", parsed);


    // if (!Array.isArray(parsed)) {
    //   console.error("Invalid format");
    //   return [];
    // }

    // 🔥 MAIN FIX
    const englishQuestions = parsed?.English;
    const hindiQuestions = parsed?.Hindi;
    const punjabiQuestions = parsed?.Punjabi;
    return {
      English: shuffleAndFormatQuiz(englishQuestions),
      Hindi: shuffleAndFormatQuiz(hindiQuestions),
      Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
    }
    // return shuffleAndFormatQuiz(parsed);

  } catch (err) {
    console.error('OpenAI error:', err);
    return [];
  }
};

const saveQuiz = async (data, key, title) => {

  const todayId = new Date()?.toISOString()?.split('T')[0];
  const payload = {
    questions: data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db?.collection(key)?.doc("LISTINGDOC")?.set({
    ...payload,
    title: `${title}`,
  });
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

  console.log(`${res.successCount} notifications sent`);
  return {
    successCount: res.successCount,
    failureCount: res.failureCount,
  };
};

const generateTrickyQuestion = async () => {
  ensureOpenAi();
  if (!openAi) {
    console.warn('OpenAI not configured');
    return [];
  }

  try {
    const res = await openAi.responses.create({
      model: "gpt-5-mini",
      input: trickyQuestionPrompt
    });
    const text = res?.output_text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return [];
    }

    const englishQuestions = Array.isArray(parsed?.English) ? parsed?.English : [];
    const hindiQuestions = Array.isArray(parsed?.Hindi) ? parsed?.Hindi : [];
    const punjabiQuestions = Array.isArray(parsed?.Punjabi) ? parsed?.Punjabi : [];

    return {
      English: shuffleAndFormatQuiz(englishQuestions),
      Hindi: shuffleAndFormatQuiz(hindiQuestions),
      Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
    }


    // return shuffleAndFormatQuiz(parsed);

  } catch (err) {
    console.error('OpenAI error:', err);
    return [];
  }
};


const generateGeneralKnowledgeQuestion = async () => {

  ensureOpenAi();

  if (!openAi) {
    console.warn('OpenAI not configured');
    return [];
  }

  try {
    const res = await openAi.responses.create({
      model: "gpt-5-mini",
      input: generalKnowledgePrompt
    });
    const text = res?.output_text;
    console.log("RAW AI Tricky RESPONSE:\n", text);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return [];
    }

    // if (!Array.isArray(parsed)) {
    //   console.error("Invalid format");
    //   return [];
    // }
    const englishQuestions = parsed?.English;
    const hindiQuestions = parsed?.Hindi;
    const punjabiQuestions = parsed?.Punjabi;
    return {
      English: shuffleAndFormatQuiz(englishQuestions),
      Hindi: shuffleAndFormatQuiz(hindiQuestions),
      Punjabi: shuffleAndFormatQuiz(punjabiQuestions)
    }

    // shuffleAndFormatQuiz(parsed?.English);


    return

  } catch (err) {
    console.error('OpenAI error:', err);
    return [];
  }
};

const generateEnglishQuestion = async () => {
  ensureOpenAi();
  if (!openAi) {
    console.warn('OpenAI not configured');
    return [];
  }

  try {
    const res = await openAi.responses.create({
      model: "gpt-5-mini",
      input: generateEnglishQuestionPrompt
    });
    const text = res?.output_text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return [];
    }

    const englishQuestions = Array.isArray(parsed?.Questions) ? parsed?.Questions : [];

    return {
      English: shuffleAndFormatQuiz(englishQuestions),
    }


    // return shuffleAndFormatQuiz(parsed);

  } catch (err) {
    console.error('OpenAI error:', err);
    return [];
  }
}










export const runQuizProcess = async ({ label = 'manual', sendNotification = false } = {}) => {

  try {
    ensureFirebase();

    const news = await fetchNews();
    if (!news) {
      return {
        success: false,
        message: 'No news articles found',
      };
    }

    const generationJobs = [
      {
        key: 'CURRENT_AFFAIRS',
        title: 'Current Affairs',
        label: 'Current Affairs',
        run: () => generateQuizFromNews(news),
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
        key: 'ENG_QUESTIONS',
        title: 'English Quiz',
        label: 'English Quiz',
        run: () => generateEnglishQuestion(),
      },
    ];

    const generationResults = await Promise.all(
      generationJobs.map(async (job) => {
        const quizData = await job.run();
        const englishCount = quizData?.English?.length ?? 0;

        if (!englishCount) {
          throw new Error(`${job.label} failed`);
        }

        await saveQuiz(quizData, job.key, job.title);

        return {
          label: job.label,
          count: englishCount,
        };
      })
    );

    console.log('Generated quizzes:', generationResults);

    if (sendNotification) {
      await sendNotifications();
    }
    return {
      success: true,
      message: `Quiz created (${label})`,
      notificationsSent: Boolean(sendNotification),
    };

  } catch (err) {
    console.error('Process error:', err);
    return { success: false, message: 'Internal error' };
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runQuizProcess({ label: 'api-call' });
}

// export default async function handler(req, res) {
//   try {
//     // const secret = req.query?.secret; // must get from query param
//     // if (!secret || secret !== process.env.CRON_SECRET) {
//     //   return res.status(401).json({ success: false, message: 'Unauthorized' });
//     // }

//     console.log("Cron job triggered");

//     const result = await runQuizProcess({ label: 'vercel-cron' });

//     return res.status(200).json(result);

//   } catch (error) {
//     console.error("Cron error:", error);
//     return res.status(500).json({ success: false, message: 'Internal error' });
//   }
// }


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
You are an Expert Generator of Tricky Quiz Questions.

TASK:
Generate exactly 10 tricky multiple-choice questions.

LANGUAGE RULE:
- Each question must exist in THREE languages: English, Hindi, and Punjabi.
- English[i], Hindi[i], and Punjabi[i] MUST represent the SAME question and answers.
- Hindi and Punjabi must be accurate translations of English (question, options, correctAnswer).
- Keep EXACT SAME ORDER in all three arrays.

DIFFICULTY RULE (VERY IMPORTANT):
- Questions must be MEDIUM to HARD difficulty ONLY.
- Avoid simple or obvious questions.
- Focus on:
  - Logical traps
  - Multi-step reasoning
  - Misconceptions
  - Numerical tricks
  - Real-life tricky cases
- 5 questions = Medium
- 5 questions = Hard

DOMAINS (must cover at least 3):
- Math
- Science
- Everyday Life
- Logic / Brain Teasers

STRICT RULES:
- Return ONLY valid JSON object.
- Do NOT include explanation or extra text.
- Do NOT use markdown or backticks.
- Each question must have exactly 4 unique options.
- Do NOT label A/B/C/D.
- "correctAnswer" must EXACTLY match one option.
- Questions must NOT be commonly repeated.
- Wrong options should be very close to correct answer.

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
      "difficulty": "medium | hard",
      "question": "string",
      "options": ["option1","option2","option3","option4"],
      "correctAnswer": "exact option text"
    }
  ],
  "Hindi": [
    {
      "difficulty": "same as English[i]",
      "question": "translated question",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ],
  "Punjabi": [
    {
      "difficulty": "same as English[i]",
      "question": "Punjabi translation (Gurmukhi script)",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ]
}

IMPORTANT:
- Total = 10 questions in each language (English, Hindi, Punjabi)
- English[i], Hindi[i], Punjabi[i] MUST exactly match
- Maintain SAME order across all arrays
- Maintain difficulty split (5 medium, 5 hard)
- Ensure Punjabi uses proper Gurmukhi script (not Hindi/romanized)
- If output is not valid JSON, regenerate
`;

const generalKnowledgePrompt = `
You are an Expert in Generating General Knowledge Questions.

TASK:
Generate exactly 25 multiple-choice questions.

LANGUAGE RULE:
- Each question must exist in THREE languages: English, Hindi, and Punjabi.
- English[i], Hindi[i], and Punjabi[i] MUST represent the SAME question and answers (1-to-1 mapping).
- Hindi and Punjabi must be accurate translations of English (question, options, correctAnswer).
- Keep EXACT SAME ORDER in all three arrays.

DIFFICULTY RULE:
- Questions must be MEDIUM to HARD only.
- Avoid simple or common questions.
- Focus on tricky facts, reasoning, and close-answer confusion.
- 12 questions = Medium
- 13 questions = Hard

CATEGORIES (TOTAL 25 QUESTIONS):
- India (4)
- World (4)
- Politics (4)
- Economy (3)
- Technology (3)
- Science (3)
- Health (2)
- Entertainment (1)
- Sports (1)

STRICT RULES:
- Return ONLY valid JSON object.
- Do NOT add explanation or text.
- Do NOT use markdown or backticks.
- Each question must have exactly 4 unique options.
- Do NOT label A/B/C/D.
- "correctAnswer" must EXACTLY match one option.
- Questions must NOT be commonly repeated.
- Wrong options should be very close to correct answer.

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
      "difficulty": "medium | hard",
      "question": "string",
      "options": ["option1","option2","option3","option4"],
      "correctAnswer": "exact option text"
    }
  ],
  "Hindi": [
    {
      "category": "same as English[i]",
      "difficulty": "same as English[i]",
      "question": "translated question",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ],
  "Punjabi": [
    {
      "category": "same as English[i]",
      "difficulty": "same as English[i]",
      "question": "Punjabi translation (Gurmukhi script)",
      "options": ["translated option1","translated option2","translated option3","translated option4"],
      "correctAnswer": "exact translated correct option text"
    }
  ]
}

IMPORTANT:
- Total = 25 questions in each language
- English[i], Hindi[i], Punjabi[i] MUST exactly match
- Keep SAME order across all arrays
- Maintain category + difficulty distribution
- Punjabi MUST be in proper Gurmukhi script (not Hindi/romanized)
- If output is invalid JSON, regenerate
`;
