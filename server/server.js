'use strict';
require('dotenv').config();

const app                   = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ─── Uncaught exception guard ─────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
(async () => {
  // Connect to MongoDB (skip if MONGO_URI is absent — useful for syntax checks)
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn('[Server] MONGO_URI not set — skipping MongoDB connection (development mode).');
  }

  const server = app.listen(PORT, HOST, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║       ContractIQ Sentinel — API Server           ║');
    console.log('  ║       IBM SkillsBuild Internship Project          ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🟢  Server  : http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`  🔵  Health  : http://localhost:${PORT}/api/health`);
    console.log(`  📄  Docs    : POST /api/contracts/upload  |  POST /api/contracts/analyze`);
    console.log(`  🤖  AI      : ${process.env.WATSONX_API_KEY ? 'IBM watsonx configured ✓' : 'IBM watsonx NOT configured (Module 3 pending)'}`);
    console.log(`  📦  DB      : ${process.env.MONGO_URI ? 'MongoDB URI configured ✓' : 'MongoDB URI not set'}`);
    console.log(`  ⚙️   Env     : ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully…`);
    server.close(async () => {
      await disconnectDB();
      console.log('[Server] Shutdown complete. Bye.');
      process.exit(0);
    });

    // Force-kill after 10 seconds if graceful shutdown stalls
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
})();
