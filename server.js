import app from './app.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shutdown function
const shutdown = async (signal) => {
  console.log(`${signal} received: closing MongoDB connection & server...`);
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
    }
  } catch (err) {
    console.error('Error closing MongoDB connection', err);
  }

  server.close(() => {
    console.log('Server gracefully shut down.');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  shutdown('UNHANDLED_REJECTION');
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle SIGTERM (Docker/Heroku/Render termination)
process.on('SIGTERM', () => shutdown('SIGTERM'));
