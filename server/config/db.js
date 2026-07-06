'use strict';
const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the MONGO_URI environment variable.
 *
 * Connection options follow current Mongoose 8.x / MongoDB Driver 6.x
 * best practices for Atlas:
 *   - serverSelectionTimeoutMS: abort connection attempt after 10 s
 *   - socketTimeoutMS: close idle sockets after 45 s
 *   - maxPoolSize: maximum 10 concurrent connections
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] MONGO_URI is not defined. Add it to server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS:          45_000,
      maxPoolSize:              10,
    });
    const { host, port, name } = mongoose.connection;
    console.log(`[DB] Connected  →  ${host}:${port || '(srv)'}/${name}`);
  } catch (err) {
    console.error(`[DB] Connection failed: ${err.message}`);
    process.exit(1);
  }

  // ── Runtime event listeners ────────────────────────────────────────────────
  mongoose.connection.on('disconnected', () =>
    console.warn('[DB] Disconnected from MongoDB.')
  );

  mongoose.connection.on('reconnected', () =>
    console.log('[DB] Reconnected to MongoDB.')
  );

  mongoose.connection.on('error', (err) =>
    console.error(`[DB] Runtime error: ${err.message}`)
  );
}

/**
 * Gracefully closes the MongoDB connection.
 * Called by the SIGTERM / SIGINT handlers in server.js.
 */
async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('[DB] Connection closed gracefully.');
  } catch (err) {
    console.error(`[DB] Error closing connection: ${err.message}`);
  }
}

module.exports = { connectDB, disconnectDB };
