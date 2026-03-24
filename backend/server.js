require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const clientsRouter = require('./routes/clients');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRouter);
app.use('/api/clients', authMiddleware, clientsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
