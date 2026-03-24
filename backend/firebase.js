const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'firebaseServiceKey.json');

let db;

if (fs.existsSync(serviceAccountPath)) {
  console.log('Firebase credentials found, initializing Firestore...');
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
} else {
  console.log('Firebase credentials NOT found. Using mock JSON database.');
  const mockDbPath = path.join(__dirname, 'mockDb.json');
  
  // Initialize mock DB with some seed data if it doesn't exist
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
    collection: (collName) => {
      return {
        get: async () => {
          const data = readMockDb();
          const docs = data[collName] || [];
          return { docs: docs.map(doc => ({ id: doc.id, data: () => doc })) };
        },
        where: function(field, op, value) {
            return {
                get: async () => {
                    const data = readMockDb();
                    const docs = data[collName] || [];
                    const filtered = docs.filter(doc => {
                        if (op === '==') return doc[field] === value;
                        return false;
                    });
                    return { docs: filtered.map(doc => ({ id: doc.id, data: () => doc })) };
                }
            }
        },
        add: async (docData) => {
          const data = readMockDb();
          if (!data[collName]) data[collName] = [];
          const newDoc = { id: Date.now().toString(), ...docData };
          data[collName].push(newDoc);
          writeMockDb(data);
          return { id: newDoc.id };
        },
        doc: (docId) => {
          return {
            update: async (updateData) => {
              const data = readMockDb();
              if (!data[collName]) return;
              const index = data[collName].findIndex(d => d.id === docId);
              if (index !== -1) {
                const updatedDoc = { ...data[collName][index], ...updateData };
                data[collName][index] = updatedDoc;
                writeMockDb(data);
              } else {
                  throw new Error("Document not found");
              }
            },
            delete: async () => {
              const data = readMockDb();
              if (!data[collName]) return;
              const index = data[collName].findIndex(d => d.id === docId);
              if (index !== -1) {
                data[collName].splice(index, 1);
                writeMockDb(data);
              }
            }
          };
        }
      };
    }
  };
}

module.exports = { db };
