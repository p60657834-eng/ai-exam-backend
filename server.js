const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// ====== TEST ROUTE ======
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ====== MEMORY DATABASE (temporary) ======
let payments = [];

// ====== AI ROUTE ======
app.post("/ask", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        const API_KEY = "sk-proj-" + "DVAjR_WEzyhPilv95pyK1XF3kASdmVaAFsnb0_Zr6puYjEK...";

headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + API_KEY
}
}
"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are a helpful study assistant." },
          { role: "user", content: req.body.message }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.json({ reply: "❌ AI error: " + JSON.stringify(data) });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    res.json({ reply: "❌ Server error" });
  }
});

// ====== SAVE PAYMENT ======
app.post("/pay", (req, res) => {
  const { utr, user } = req.body;

  payments.push({
    id: Date.now(),
    utr,
    user,
    approved: false
  });

  res.json({ success: true });
});

// ====== GET ALL PAYMENTS (ADMIN) ======
app.get("/payments", (req, res) => {
  res.json(payments);
});

// ====== APPROVE PAYMENT ======
app.post("/approve", (req, res) => {
  const { id } = req.body;

  payments = payments.map(p =>
    p.id === id ? { ...p, approved: true } : p
  );

  res.json({ success: true });
});

// ====== CHECK PREMIUM ======
app.get("/check/:user", (req, res) => {
  const user = req.params.user;

  const isPremium = payments.some(
    p => p.user == user && p.approved
  );

  res.json({ premium: isPremium });
});

// ====== START SERVER ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
