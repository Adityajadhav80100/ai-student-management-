require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.cjs');

const app = express();

// Middleware
const studentRoutes = require('./routes/students.js');
const attendanceRoutes = require('./routes/attendance.js');
const marksRoutes = require('./routes/marks.js');
const analyticsRoutes = require('./routes/analytics.js');
const errorHandler = require('./middleware/errorHandler.js');
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });