// controllers/paymentController.js
const Produit = require('../models/Product');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const lignes = req.body.lignes;

    if (!Array.isArray(lignes)) {
      return res.status(400).json({ message: "Le panier est invalide." });
    }

    // 1) Initialise bien line_items avant la boucle
    const line_items = [];

    // 2) Parcours chaque ligne pour construire line_items
    for (const ligne of lignes) {
      // si tu envoies _id depuis le front, récupère ligne._id
      const produitId = ligne.id || ligne._id;
      const quantite   = ligne.quantite || 1;

      const produit = await Produit.findById(produitId);
      if (!produit) {
        return res.status(400).json({ message: `Produit non trouvé (${produitId})` });
      }

      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: produit.nom,
            description: produit.description || '',
          },
          unit_amount: Math.round(produit.prix * 100), // prix en centimes
        },
        quantity: quantite,
      });
    }

    // 3) Crée la session Stripe avec line_items bien initialisé
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `./FrontEnd/success.html`,
      cancel_url:  `./FrontEnd/cancel.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe:", err);
    return res.status(500).json({ message: "Erreur lors de la création de la session Stripe" });
  }
};
