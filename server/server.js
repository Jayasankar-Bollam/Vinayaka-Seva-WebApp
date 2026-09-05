// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const cors = require('cors');
// ...
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is alive' });
});


const authRoutes = require('./routes/authRoutes');
// ... after app.use(express.json()) — add this:
app.use(express.json()); // needed to parse JSON request bodies — add this if not already there
app.use('/api/auth', authRoutes);

const { requireAuth } = require('./middleware/auth');

app.get('/api/protected-test', requireAuth, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

const chandaRoutes = require('./routes/chandaRoutes');
app.use('/api/chandas', chandaRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

const videoRoutes = require('./routes/videoRoutes');
app.use('/api/videos', videoRoutes);

const publicRoutes = require('./routes/publicRoutes');
app.use('/api/public', publicRoutes);

const dailyEventRoutes = require('./routes/dailyEventRoutes');
app.use('/api/daily-events', dailyEventRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

app.use('/uploads', express.static('uploads'));

// Error handler — must be defined AFTER all routes, and must take exactly 4 parameters
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message }); // e.g. "File too large"
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const overviewRoutes = require('./routes/overviewRoutes');
app.use('/api/overview', overviewRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

