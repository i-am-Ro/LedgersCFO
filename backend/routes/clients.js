const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Get all clients
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('clients').get();
    const clients = snapshot.docs.map(doc => ({
      id: doc.id, // For Firebase, id is usually separate. Our mock handles it too.
      ...doc.data()
    }));
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Create a client
router.post('/', async (req, res) => {
  try {
    const { company_name, country, entity_type } = req.body;
    if (!company_name) return res.status(400).json({ error: 'Company name is required' });
    
    const newClient = {
      company_name,
      country: country || 'Unknown',
      entity_type: entity_type || 'Corporation',
      created_at: new Date().toISOString()
    };
    
    const docRef = await db.collection('clients').add(newClient);
    res.status(201).json({ id: docRef.id, ...newClient });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    const clientRef = db.collection('clients').doc(id);
    await clientRef.update(updateData);
    
    res.json({ message: 'Client updated successfully', id, ...updateData });
  } catch (error) {
    console.error('Error updating client:', error);
    if (error.message === 'Document not found') {
        return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('clients').doc(id).delete();
    res.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;
