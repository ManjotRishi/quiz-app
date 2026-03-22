import fetch from "node-fetch";
import admin from "firebase-admin";
import { parseStringPromise } from "xml2js";

// 🔐 Firebase init
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
});

const db = admin.firestore();

// 📰 Fetch latest news
const getNews = async () => {
  const res = await fetch(
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
  );

  const xml = await res.text();
  const parsed = await parseStringPromise(xml);

  const items = parsed.rss.channel[0].item;

  return items
    .slice(0, 10)
    .map((item) => item.title[0])
    .join("\n");
};

// 🤖 Generate quiz using Gemini
const generateQuiz = async (news) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`,
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
Generate 50 current affairs MCQs.

STRICT RULES:
- Return ONLY JSON
- No explanation
- Format EXACTLY like this:

[
  {
    "question": "",
    "options": ["A", "B", "C", "D"],
    "answer": ""
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

  const data = await res.json();

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("❌ JSON parse failed");
    return [];
  }
};

// 🚀 Main function
(async () => {
  try {
    console.log("📰 Fetching news...");
    const news = await getNews();

    console.log("🤖 Generating quiz...");
    const quiz = await generateQuiz(news);

    console.log("📄 Saving to Firestore...");
    await db.collection("quizzes").doc("latest").set({
      createdAt: new Date().toISOString(),
      questions: quiz,
    });

    console.log("✅ Quiz updated successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
})();