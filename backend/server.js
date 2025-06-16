const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// 1) Pour les webhooks, il faut récupérer le corps en RAW
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }), // important : Stripe nécessite le corps brut
  require("./controllers/paymentWebhookController")   // on va créer ce fichier
);

// 2) Puis le reste des middlewares normaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Vos routes existantes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/produits", require("./routes/produits"));
app.use("/api/payment", require("./routes/payment"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4) Frontend static et fallback
app.use(express.static(path.join(__dirname, "../FrontEnd")));
app.get("/produit/:ref", (req, res) => {
  res.sendFile(path.join(__dirname, "../FrontEnd/produit.html"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../FrontEnd/index.html"));
});

// 5) Connexion MongoDB, lancement du serveur…
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
