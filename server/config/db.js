const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Reads connection URI from environment variables or falls back to local instance.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certgen_db'
    );

    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Warning]: ${error.message}`);
    console.warn('[MongoDB Notice]: Ensure MongoDB daemon (mongod) is running or check MONGO_URI.');
  }
};

module.exports = connectDB;
