const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*"
}));
const PORT = 3000;

// 🧠 SIMPLE MEMORY DATABASE
let users = {};
let payments = {};

// 🟢 HOME
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});
// 🤖 AI (DEMO)
app.post("/ask", (req, res) => {
  const { userId, question } = req.body;

  if (!userId) return res.json({ error: "No userId" });

  if (!users[userId]) {
    users[userId] = {
      premium: false,
      free: 3
    };
  }

  if (!users[userId].premium && users[userId].free <= 0) {
    return res.json({ answer: "Upgrade to premium 💰" });
  }

  if (!users[userId].premium) {
    users[userId].free--;
  }

  res.json({
    answer: "AI Answer: " + question
  });
});

// 💰 CREATE PAYMENT
app.post("/create-payment", (req, res) => {
  const { userId } = req.body;

  const paymentId = "PAY" + Date.now();

  payments[paymentId] = {
    userId,
    status: "pending"
  };

  res.json({
    upi: "9989066730-3@ybl",
    paymentId
  });
});

// 📤 SUBMIT PAYMENT
app.post("/submit-payment", (req, res) => {
  const { paymentId, utr } = req.body;

  if (!payments[paymentId]) {
    return res.json({ error: "Invalid payment" });
  }

  payments[paymentId].utr = utr;
  payments[paymentId].status = "submitted";

  res.json({ message: "Payment submitted" });
});

// ✅ APPROVE PAYMENT
app.post("/approve-payment", (req, res) => {
  const { paymentId } = req.body;

  const payment = payments[paymentId];

  if (!payment) {
    return res.json({ error: "Not found" });
  }

  users[payment.userId].premium = true;
  payment.status = "approved";

  res.json({ message: "User upgraded 🚀" });
});

// 📊 ANALYTICS
app.get("/analytics", (req, res) => {
  const totalUsers = Object.keys(users).length;
  const premiumUsers = Object.values(users).filter(u => u.premium).length;

  const revenue =
    Object.values(payments).filter(p => p.status === "approved").length * 49;

  res.json({
    totalUsers,
    premiumUsers,
    revenue
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
