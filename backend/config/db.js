const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

    if (attempt >= MAX_RETRIES) {
      logger.error('MongoDB max connection attempts reached. Server will continue running without a database connection.');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s
    const delay = Math.min(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1), 30000);
    logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`);
    setTimeout(() => connectDB(attempt + 1), delay);
  }
};

module.exports = connectDB;
