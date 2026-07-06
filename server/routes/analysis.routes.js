'use strict';
const { Router } = require('express');
const { getAnalysisByContractId, listAnalyses } = require('../controllers/analysis.controller');

const router = Router();

// ─── GET /api/analysis ────────────────────────────────────────────────────────
router.get('/', listAnalyses);

// ─── GET /api/analysis/:contractId ───────────────────────────────────────────
router.get('/:contractId', getAnalysisByContractId);

module.exports = router;
