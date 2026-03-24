const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebaseServiceKey.json');

let db;

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log('Firebase credentials found, initializing Firestore...');
db = admin.firestore();

module.exports = { db };
