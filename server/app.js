'use strict';
require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const path           = require('path');

// ─── Route modules ────────────────────────────────────────────────────────────
const healthRoutes   = require('./routes/health.routes');
const contractRoutes = require('./routes/contract.routes');
const analysisRoutes = require('./routes/analysis.routes');
const reportRoutes   = require('./routes/report.routes');

// ─── Centralised error handler (must be imported last) ───────────────────────
const errorHandler   = require('./middleware/errorHandler');

const app = express();

// ─── Security & transport middleware ─────────────────────────────────────────
app.use(helmet());

// CORS — allow the Vite dev server, the Vercel production URL,
// and any Vercel preview deployment URL (*.vercel.app).


// ─── CORS ────────────────────────────────────────────────────────────────────
const isAllowedOrigin = (origin) => {
  // Allow requests without an Origin header
  // (Render health checks, curl, Postman)
  if (!origin) return true;

  // Local development
  if (origin === 'http://localhost:3000') return true;

  // Explicit production frontend (optional)
  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;

  // Allow all Vercel deployments
  if (origin.endsWith('.vercel.app')) return true;

  return false;
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));
// ─── Logging ──────────────────────────────────────────────────────────────────
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Static file serving (generated Excel reports) ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/health',    healthRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/analysis',  analysisRoutes);
app.use('/api/reports',   reportRoutes);

// ─── 404 handler — any unmatched route ───────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: 'The requested API endpoint does not exist.',
    },
  });
});

// ─── Centralised error handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
