require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/index');

// Initialize Express app
const app = express();

// Establish MongoDB Connection
connectDB();

// Global Middlewares & Production CORS Security
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Server-to-Server requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} not allowed.`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // Supports large Fabric.js JSON state payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Core API Routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Port listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Express Server] Running on http://localhost:${PORT}`);
});

module.exports = app;
