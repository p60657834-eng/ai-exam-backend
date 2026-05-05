require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// TEMP DATABASE (for now)
let users = {};

// TEST
app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!users[email]) {
    users[email] = { email, password, premium: false };
  }

  res.json({ message: "Login successful", user: users[email] });
});

// AI (simple for now)
app.post("/ask", (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.json({ answer: "Ask something!" });
  }

  // simple fake AI (works without API key)
  res.json({
    answer: "AI says: " + question + " (demo response)"
  });
});

// PAYMENT
app.post("/payment-success", (req, res) => {
  const { userId } = req.body;

  if (!users[userId]) {
    return res.json({ error: "User not found" });
  }

  users[userId].premium = true;

  res.json({ message: "User upgraded to PRO 🚀" });
});

app.listen(3000, () => {
  console.log("✅ Server running on port 3000");
});
