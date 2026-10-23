const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Enforces strict environment variable usage in production environments (Render, Atlas).
 */
const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const mongoUri = process.env.MONGO_URI;

  // Strict check: crash with a clear diagnostic message if MONGO_URI is missing in production
  if (!mongoUri) {
    if (isProduction) {
      console.error('================================================================');
      console.error('[CRITICAL DATABASE CONFIG ERROR]: MONGO_URI is undefined!');
      console.error('Running in production mode requires a valid MONGO_URI environment variable.');
      console.error('Please configure MONGO_URI in your Render environment variables dashboard.');
      console.error('================================================================');
      process.exit(1);
    } else {
      console.warn('[MongoDB Notice]: No MONGO_URI defined. Using local development database: mongodb://127.0.0.1:27017/certgen_db');
    }
  }

  const connectionString = mongoUri || 'mongodb://127.0.0.1:27017/certgen_db';

  try {
    const conn = await mongoose.connect(connectionString);
    console.log(`[MongoDB Connected]: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (isProduction) {
      console.error('[CRITICAL]: Terminating process due to failed production MongoDB connection.');
      process.exit(1);
    } else {
      console.warn('[MongoDB Notice]: Ensure MongoDB daemon (mongod) is running or check your connection string.');
    }
  }
};

module.exports = connectDB;

