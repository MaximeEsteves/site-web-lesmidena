// models/Order.js
const mongoose = require("mongoose");

const orderLineSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  nom: { type: String, required: true },             // nom du produit (pour archive)
  prixUnitaire: { type: Number, required: true },     // prix au moment de la commande
  quantite: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  customer: {
    nom:      { type: String, required: true },
    adresse:  { type: String, required: true },
    ville:    { type: String, required: true },
    cp:       { type: String, required: true },
    email:    { type: String, required: true },
    telephone:{ type: String, required: true },
  },
  lignes: [orderLineSchema],        // détails des produits commandés
  total: { type: Number, required: true },  // total calculé au backend (en euros)
  statut: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  stripeSessionId: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
