// controllers/paymentWebhookController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Produit = require("../models/Product");
const Order = require("../models/Order");
const nodemailer = require("nodemailer");

// 1) Configuration de Nodemailer (exemple via SMTP Gmail, mais vous pouvez utiliser un autre service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // ex: smtp.gmail.com
  port: process.env.SMTP_PORT,       // ex: 587
  secure: process.env.SMTP_SECURE === "true", // true si port 465, sinon false
  auth: {
    user: process.env.SMTP_USER,     // ex: votre-adresse@gmail.com
    pass: process.env.SMTP_PASS,     // mot de passe ou app password
  },
});

module.exports = async (req, res) => {
    console.log("→ [WEBHOOK] Requête reçue :", req.headers["stripe-signature"]);
  const sig = req.headers["stripe-signature"];
  let event;

  // 2) Vérification de la signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("→ [WEBHOOK] Signature vérifiée. Type d'événement :", event.type);
  } catch (err) {
    console.error("⚠️  Signature Webhook invalide :", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3) On traite uniquement l'événement checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // 3.1) Récupérer les détails des line_items (produits + quantités)
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      // 3.2) Récupérer les informations client depuis metadata
      const metadata = session.metadata || {};
      const customerInfo = {
        nom:       metadata.nom,
        adresse:   metadata.adresse,
        ville:     metadata.ville,
        cp:        metadata.cp,
        email:     metadata.email,
        telephone: metadata.telephone,
      };

      // 3.3) Construire la liste des produits pour l'Order
      let totalCalc = 0;
      const orderLines = [];

      for (const item of lineItems.data) {
        // item : { price: { unit_amount, product_data: { name, ... } }, quantity, description, etc. }
        // Mais nous n'avons pas directement l’ID Mongoose du produit dans item
        // Nous pouvons, par exemple, stocker l’ID du produit Stripe dans metadata lors de createCheckoutSession.
        // Variante simple : on recherche le produit en BD par nom ou référence, 
        // mais l’idéal est d’avoir dans metadata un tableau d’IDs de produits.
        //
        // Par exemple, si vous aviez mis dans metadata : metadata.produits = JSON.stringify([{ id: "...", quantite: 2 }, ...])
        // Alors ici, vous feriez JSON.parse(metadata.produits) pour relier à votre base.
        //
        // Pour cette démonstration, je pars du principe que l’on a stocké dans metadata un JSON "products": 
        //   { products: "[{\"id\":\"61234...\",\"quantite\":2},...]" }
        //
        // => On récupère ce JSON :
        let produitsInfo = [];
        if (metadata.products) {
          produitsInfo = JSON.parse(metadata.products);
        }

        // 3.3.1) Pour chaque ligne metadata, on retrouve le produit Mongoose
        // (On boucle sur produitsInfo plutôt que sur lineItems, pour s’assurer qu’on a bien l’ID)
        // Remarque : il faut adapter exactement la façon dont vous avez serialisé metadata.products.
      }

      // Si vous n'avez pas sérialisé les IDs dans metadata, il faut ABSOLUMENT le faire lors de createCheckoutSession.
      // Je vous présente donc une version complète en supposant que createCheckoutSession 
      // envoie metadata.products = JSON.stringify(lignes).
      // ------------------------------------------------------------------------------------
      // Exemple complet de traitement en fonction d'un metadata.products :
      const produitsOrdered = JSON.parse(metadata.products || "[]");
      totalCalc = 0;
      orderLines.length = 0; // réinitialise

      for (const prodInfo of produitsOrdered) {
        const produitId = prodInfo.id;
        const quantite = prodInfo.quantite || 1;
        // On récupère le produit en BD pour prendre nom, prix, et vérifier le stock
        const produit = await Produit.findById(produitId);
        if (!produit) {
          console.warn(`Produit introuvable lors du webhook : ${produitId}`);
          continue; 
        }
        const prixUnitaire = produit.prix; // en euros
        totalCalc += prixUnitaire * quantite;

        orderLines.push({
          product: produit._id,
          nom: produit.nom,
          prixUnitaire,
          quantite,
        });

        // 3.4) Mise à jour du stock du produit (en DB)
        // On soustrait la quantité commandée, sans descendre en dessous de 0
        produit.stock = Math.max(produit.stock - quantite, 0);
        await produit.save();
      }

      // 3.5) Créer le document Order en base
      const nouvelleCommande = new Order({
        customer:       customerInfo,
        lignes:         orderLines,
        total:          totalCalc,
        statut:         "paid",
        stripeSessionId: session.id,
      });
      await nouvelleCommande.save();

      // 3.6) Envoi d'email de confirmation
      // On prépare un email simple avec les détails de la commande
      const emailSubject = `Confirmation de votre commande ${nouvelleCommande._id}`;
      let emailHtml = `
        <h2>Bonjour ${customerInfo.nom},</h2>
        <p>Votre commande a bien été reçue et payée.</p>
        <h3>Détails de la commande :</h3>
        <ul>
      `;
      for (const line of nouvelleCommande.lignes) {
        emailHtml += `<li>${line.nom} x ${line.quantite} @ ${line.prixUnitaire} € chacun</li>`;
      }
      emailHtml += `
        </ul>
        <p>Total : ${nouvelleCommande.total} €</p>
        <p>Adresse de livraison : ${customerInfo.adresse}, ${customerInfo.cp} ${customerInfo.ville}</p>
        <p>Si vous avez des questions, répondez à cet email ; nous y répondrons dès que possible.</p>
        <p>Merci pour votre confiance !</p>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM,      // ex: '"Boutique XYZ" <no-reply@votredomaine.com>'
        to: customerInfo.email,
        subject: emailSubject,
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmation envoyé à ${customerInfo.email}`);

      // 3.6 bis) Envoi d'une notification au propriétaire
const notificationHtml = `
  <h2>Nouvelle commande reçue</h2>
  <p><strong>Client :</strong> ${customerInfo.nom} (${customerInfo.email})</p>
  <p><strong>Téléphone :</strong> ${customerInfo.telephone || "Non fourni"}</p>
  <p><strong>Adresse :</strong> ${customerInfo.adresse}, ${customerInfo.cp} ${customerInfo.ville}</p>
  <h3>Détails de la commande :</h3>
  <ul>
`;

for (const line of nouvelleCommande.lignes) {
  notificationHtml += `<li>${line.nom} x ${line.quantite} @ ${line.prixUnitaire} €</li>`;
}
notificationHtml += `
  </ul>
  <p><strong>Total payé :</strong> ${nouvelleCommande.total} €</p>
  <p><strong>Commande ID :</strong> ${nouvelleCommande._id}</p>
`;

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: process.env.NOTIFICATION_EMAIL, // voir ci-dessous pour .env
  subject: "💰 Nouvelle commande reçue",
  html: notificationHtml,
});

console.log("✅ Notification envoyée au propriétaire.");

      // 3.7) Répondre à Stripe pour dire que tout s'est bien passé
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("❌ Erreur dans le traitement du webhook :", err);
      // En cas d’erreur, renvoyer 400 afin que Stripe réessaie plus tard
      return res.status(400).send(`Webhook Handler Error: ${err.message}`);
    }
  }

  // Pour les autres événements Stripe, on renvoie simplement 200
  return res.status(200).json({ received: true });
};
