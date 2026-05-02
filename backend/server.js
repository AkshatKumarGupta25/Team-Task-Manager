require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
// const socketConfig = require('./config/socket');

const server = http.createServer(app);

// Setup Socket.io
// socketConfig.init(server);

const PORT = process.env.PORT || 5000;

// Start the HTTP server first so healthchecks can succeed immediately,
// then attempt the MongoDB connection asynchronously in the background.
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Kick off the DB connection after the server is already listening.
  // connectDB retries with exponential backoff and never calls process.exit,
  // so a temporary MongoDB outage will not bring the server down.
  connectDB();
});

process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});
