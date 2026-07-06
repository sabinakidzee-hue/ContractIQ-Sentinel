'use strict';
const { Router }   = require('express');
const mongoose     = require('mongoose');
const { version }  = require('../package.json');

const router = Router();

/**
 * GET /api/health
 * Lightweight liveness probe — returns server status and MongoDB connection state.
 * Used by Render health-check, CI pipelines, and the frontend status widget.
 */
router.get('/', (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState  = dbStates[mongoose.connection.readyState] || 'unknown';

  const payload = {
    status:    'ok',
    service:   'ContractIQ Sentinel API',
    version,
    timestamp: new Date().toISOString(),
    database:  {
      state:    dbState,
      name:     mongoose.connection.name || 'N/A',
    },
    ai: {
      provider: 'IBM watsonx Orchestrate',
      model:    process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-instruct-v2',
      status:   process.env.WATSONX_API_KEY ? 'configured' : 'not-configured (Module 3 pending)',
    },
    environment: process.env.NODE_ENV || 'development',
  };

  const httpStatus = dbState === 'connected' ? 200 : 503;
  return res.status(httpStatus).json({ success: true, data: payload });
});

module.exports = router;
