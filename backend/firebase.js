const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebaseServiceKey.json');
let db;
let serviceAccount;

// 1. Try loading from Environment Variable (Best for Render/Production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase credentials found in environment variable.');
  } catch (err) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', err.message);
  }
} 

// 2. Try loading from file (Best for Local Dev)
if (!serviceAccount && fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
  console.log('Firebase credentials found in local file.');
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firestore initialized successfully.');
  } catch (err) {
    console.error('Firebase initialization failed:', err.message);
  }
}

// 3. Fallback to Mock Database if nothing else works
if (!db) {
  console.log('Using mock JSON database fallback.');
  const mockDbPath = path.join(__dirname, 'mockDb.json');
  
  if (!fs.existsSync(mockDbPath)) {
    const initialData = { 
      clients: [
        { id: "c1", company_name: "Acme Corp", country: "USA", entity_type: "LLC" },
        { id: "c2", company_name: "Global Tech", country: "UK", entity_type: "Corp" }
      ], 
      tasks: [
        { id: "t1", client_id: "c1", title: "Annual Tax Filing", description: "File 2024 taxes", category: "Tax", due_date: "2024-04-15", status: "Pending", priority: "High" }
      ] 
    };
    fs.writeFileSync(mockDbPath, JSON.stringify(initialData, null, 2));
  }

  const readMockDb = () => JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
  const writeMockDb = (data) => fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2));

  db = {
    isMock: true,
    collection: (collName) => ({
      get: async () => {
        const data = readMockDb();
        const docs = data[collName] || [];
        const mappedDocs = docs.map(doc => ({ id: doc.id, data: () => doc }));
        return { docs: mappedDocs, empty: mappedDocs.length === 0 };
      },
      where: (field, op, value) => ({
        get: async () => {
          const data = readMockDb();
          const docs = data[collName] || [];
          const filtered = docs.filter(doc => (op === '==' ? doc[field] === value : false));
          const mappedDocs = filtered.map(doc => ({ id: doc.id, data: () => doc }));
          return { docs: mappedDocs, empty: mappedDocs.length === 0 };
        }
      }),
      add: async (docData) => {
        const data = readMockDb();
        if (!data[collName]) data[collName] = [];
        const newDoc = { id: Date.now().toString(), ...docData };
        data[collName].push(newDoc);
        writeMockDb(data);
        return { id: newDoc.id };
      },
      doc: (docId) => ({
        update: async (updateData) => {
          const data = readMockDb();
          const index = (data[collName] || []).findIndex(d => d.id === docId);
          if (index !== -1) {
            data[collName][index] = { ...data[collName][index], ...updateData };
            writeMockDb(data);
          } else throw new Error("Document not found");
        },
        delete: async () => {
          const data = readMockDb();
          const index = (data[collName] || []).findIndex(d => d.id === docId);
          if (index !== -1) {
            data[collName].splice(index, 1);
            writeMockDb(data);
          }
        }
      })
    })
  };
}

module.exports = { db };
