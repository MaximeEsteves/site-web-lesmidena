// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// 1) Webhook Stripe (RAW)
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentWebhookController")
);

// 2) CORS + parsers
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/produits", require("./routes/produits"));
app.use("/api/payment", require("./routes/payment"));

// 4) Static Front‑end
app.use(express.static(path.join(__dirname, "../FrontEnd")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../FrontEnd/index.html"));
});

// 5) Connect DB & start
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
