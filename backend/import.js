// import.js
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');  // Importer ObjectId
const fs = require('fs');

async function importCollection() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("boutique");
  const col = db.collection("products");

  // Optionnel : vider la collection avant
  await col.deleteMany({});

  // Lire les données JSON
  const docs = JSON.parse(fs.readFileSync("produits.json", "utf-8"));

  // Convertir chaque _id en ObjectId
 const docsWithObjectId = docs.map(doc => {
  if (doc._id && typeof doc._id === 'string' && doc._id.match(/^[0-9a-fA-F]{24}$/)) {
    return { ...doc, _id: new ObjectId(doc._id) };
  }
  return doc;  // Pas de conversion si pas d'ID ou ID invalide
});


  // Insérer les docs corrigés
  await col.insertMany(docsWithObjectId);

  console.log("Import terminé depuis produits.json");
  await client.close();
}

importCollection().catch(console.error);
