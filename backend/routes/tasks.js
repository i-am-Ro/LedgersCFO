const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Get tasks (optionally for a client)
router.get('/', async (req, res) => {
  try {
    const { clientId } = req.query;
    let snapshot;
    if (clientId) {
      snapshot = await db.collection('tasks').where('client_id', '==', clientId).get();
    } else {
      snapshot = await db.collection('tasks').get();
    }
    
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a task
router.post('/', async (req, res) => {
  try {
    const { client_id, title, description, category, due_date, status, priority, payment_date } = req.body;
    
    if (!client_id || !title || !due_date) {
      return res.status(400).json({ error: 'client_id, title, and due_date are required' });
    }

    const newTask = {
      client_id,
      title,
      description: description || '',
      category: category || 'General',
      due_date,
      status: status || 'Pending',
      priority: priority || 'Medium',
      payment_date: payment_date || '',
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Generate a random transaction ID
const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TXN-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Update task details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    // Auto-generate transaction ID when marking as Completed,
    // OR for already-completed tasks that were saved before this feature was added
    const taskSnap = await db.collection('tasks').doc(id).get();
    const existingData = taskSnap.data() || {};

    const isBeingCompleted = updateData.status === 'Completed';
    const isAlreadyCompleted = existingData.status === 'Completed';
    const missingTransactionId = !existingData.transaction_id && !updateData.transaction_id;

    if ((isBeingCompleted || isAlreadyCompleted) && missingTransactionId) {
      updateData.transaction_id = generateTransactionId();
      updateData.completed_at = updateData.completed_at || existingData.completed_at || new Date().toISOString();
    }

    const taskRef = db.collection('tasks').doc(id);
    await taskRef.update(updateData);
    
    res.json({ message: 'Task updated successfully', id, ...updateData });
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.message === 'Document not found') {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('tasks').doc(id).delete();
    res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
