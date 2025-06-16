// controllers/paymentController.js
const Produit = require("../models/Product");
const Order = require("../models/Order");       // on va l'utiliser plus tard
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { lignes, customer } = req.body;
    // lignes : [{ id: ..., quantite: ... }, ...]
    // customer : { nom, adresse, ville, cp, email, telephone }
    if (!Array.isArray(lignes) || !customer) {
      return res.status(400).json({ message: "Données du panier ou du client manquantes." });
    }

    // 1) Calculer les line_items Stripe
    const line_items = [];
    let totalOrder = 0;

    for (const ligne of lignes) {
      const produitId = ligne.id;
      const quantite = ligne.quantite || 1;
      const produit = await Produit.findById(produitId);
      if (!produit) {
        return res.status(400).json({ message: `Produit non trouvé (${produitId})` });
      }

      const prixCentimes = Math.round(produit.prix * 100);
      totalOrder += produit.prix * quantite;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: produit.nom,
            description: produit.description || "",
          },
          unit_amount: prixCentimes,
        },
        quantity: quantite,
      });
    }
    const produitsJSON = JSON.stringify(lignes); 
    // 2) Création de la session Stripe avec metadata
    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items,
  metadata: {
    // infos client
    nom:       customer.nom,
    adresse:   customer.adresse,
    ville:     customer.ville,
    cp:        customer.cp,
    email:     customer.email,
    telephone: customer.telephone,
    // liste des produits en JSON
    products: produitsJSON,
  },
  success_url: `${process.env.FRONTEND_URL}/success.html`,
  cancel_url:  `${process.env.FRONTEND_URL}/cancel.html`,
});

    // 3) Répondre au front-end avec l’URL de redirection Stripe
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return res.status(500).json({ message: "Erreur lors de la création de la session Stripe" });
  }
};
