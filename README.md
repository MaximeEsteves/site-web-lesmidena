# Mignonneries de Nathalie

Projet fullstack (Frontend + Backend) d’une boutique artisanale en ligne.

---

## 🖼️ Déploiement

**Frontend** : Netlify (HTML / CSS / Javascript)
**Backend** : Node.js / MongoDB Atlas

### Stack & dépendances

- **HTML5**, **CSS3**, **JavaScript **
- Librairies : [Swiper](https://swiperjs.com/), [FontAwesome](https://fontawesome.com/)
- Hébergement statique : **Netlify**
- API REST légère pour la gestion des produits, du panier et des paiements.
- Stockage MongoDB via **Mongoose**.
- Paiement sécurisé avec **Stripe** + webhook.
- Envoi d’emails via **Nodemailer**.

### Fonctionnalités

- Interface responsive.
- Navigation produit + recherche côté client.
- Galerie produit avec zoom, navigation (chevrons + Swiper).
- Connexion admin avec possibilité d'ajout/modification/suppression de produit.

### Architecture & fichiers clés

- `index.html`
- `api/` — appels API.
- `global/` — styles et scripts partagés.
- `pages/` — toutes les pages spécifiques du site.
- `assets/` — images, icônes et logos.

### Démarrage

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Créer un fichier .env avec les variables suivantes :
   **PORT=3000**
   **MONGO_URI=...**
   **JWT_SECRET=...**
   **STRIPE_SECRET_KEY=...**
   **STRIPE_WEBHOOK_SECRET=...**
   **EMAIL_USER=...**
   **EMAIL_PASS=...**
   **ADMIN_EMAIL=...**
   **ADMIN_PASSWORD=...**
   **FRONTEND_URL=...**

3. Lancer le serveur :

- Développement : npm run dev

- Production : npm start

### Prochaines améliorations

- Modale d’ajout de produit avec transformation automatique des images :
  - `.webp` (900x600 pour les images)
  - `.webp` (1920x600 pour les couvertures)
- Calcul du prix d'envoi selon la catégorie du produit (poids, taille ect..)
- Amélioration du score **Lighthouse**.
- Gestion des avis clients dans la base MongoDB.
- Refactorisation de certain fichier.
- Passage de Stripe en mode production.
- nom de domaine
