const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 OpenAI API Key (SAFE)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔥 Firebase Admin Setup
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("🚀 SaaS Backend Running");
});


// 🔥 AI ENDPOINT (WITH PREMIUM CHECK)
app.post("/ask", async (req, res) => {
  try {
    const { question, userId } = req.body;

    if (!question || !userId) {
      return res.status(400).json({ error: "Missing data" });
    }

    // 🔐 Check user premium
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists || !userDoc.data().premium) {
      return res.json({ answer: "❌ Buy premium to use AI" });
    }

    // 🤖 Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI tutor." },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    res.json({
      answer: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});


// 💰 PAYMENT SUBMIT API
app.post("/payment", async (req, res) => {
  try {
    const { userId, txnId } = req.body;

    if (!userId || !txnId) {
      return res.status(400).json({ error: "Missing data" });
    }

    await db.collection("payments").add({
      userId,
      txnId,
      status: "pending",
      time: new Date()
    });

    res.json({ message: "Payment submitted" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error saving payment" });
  }
});


// 🔓 ADMIN APPROVE PAYMENT
app.post("/approve", async (req, res) => {
  try {
    const { userId } = req.body;

    await db.collection("users").doc(userId).set({
      premium: true
    }, { merge: true });

    res.json({ message: "User upgraded to premium" });

  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});
// PAYMENT SUCCESS (SIMULATED / READY FOR RAZORPAY)
app.post("/payment-success", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing user" });
    }

    // upgrade user
    await db.collection("users").doc(userId).set({
      premium: true,
      plan: "pro",
      paidAt: new Date()
    }, { merge: true });

    res.json({ message: "Payment verified & user upgraded" });

  } catch (err) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
