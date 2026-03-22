import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

admin.initializeApp();

// 🔔 Send Notification
const sendNotification = async () => {
  const snapshot = await admin.firestore().collection("users").get();

  const tokens = snapshot.docs
    .map(doc => doc.data().token)
    .filter(Boolean);

  if (tokens.length === 0) return;

  await admin.messaging().sendMulticast({
    tokens,
    notification: {
      title: "🧠 New Quiz Ready!",
      body: "50 fresh current affairs questions 🚀",
    },
  });
};

const getNews = async () => {
  const res = await fetch(
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
  );

  const xml = await res.text();
  const parsed = await parseStringPromise(xml);

  const items = parsed.rss.channel[0].item;

  const news = items
    ?.slice(0, 10)
    ?.map((item) => item?.title[0])
    ?.join("\n");

  return news;
};

// 🤖 Generate quiz using Gemini
const generateQuiz = async (news) => {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyBMkChKbPPDFwMk79lKF71F43lhiJjSc4A",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
Generate 50 current affairs MCQs based on the news below.

STRICT RULES:
- Return ONLY JSON array
- No explanation
- Format EXACTLY like this:

[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "correct option"
  }
]

NEWS:
${news}
                `,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await res?.json();

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  let quiz;
  try {
    quiz = JSON.parse(text);
  } catch (e) {
    console.log("⚠️ JSON parse failed, fallback empty");
    quiz = [];
  }

  return quiz;
};

// ⏰ Cron Job
export const scheduledQuiz = functions.pubsub
  .schedule("every 2 minutes") // change to 2 min for testing
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    try {
      console.log("🚀 Fetching news...");
      const news = await getNews();

      console.log("🤖 Generating quiz...");
      const quiz = await generateQuiz(news);

      console.log("📄 Saving to Firestore...");
      await admin.firestore().collection("quizzes").doc("latest").set({
        createdAt: new Date().toISOString(),
        questions: quiz, // ✅ EXACT structure you want
      });

      await sendNotification();

      console.log("✅ Done!");
      return null;
    } catch (error) {
      console.error("❌ Error:", error);
      return null;
    }
  });