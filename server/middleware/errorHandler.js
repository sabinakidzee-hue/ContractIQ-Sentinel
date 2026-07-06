'use strict';

/**
 * Centralised Express error handler.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 *   - Mongoose CastError        → 400
 *   - Mongoose ValidationError  → 422
 *   - Mongoose Duplicate Key    → 409
 *   - JWT errors                → 401
 *   - Everything else           → 500
 */
function errorHandler(err, req, res, _next) {
  // Log full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  // Mongoose — bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ID', message: `Invalid ${err.path}: ${err.value}` },
    });
  }

  // Mongoose — schema validation
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Mongoose validation failed.', details },
    });
  }

  // Mongoose — duplicate key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: `Duplicate value for ${field}.` },
    });
  }

  // JWT — invalid token
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or missing token.' },
    });
  }

  // Default — 500
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code:    'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Internal server error.',
    },
  });
}

module.exports = errorHandler;
