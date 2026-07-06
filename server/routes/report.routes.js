'use strict';
const { Router } = require('express');
const { body }   = require('express-validator');
const {
  exportReport,
  getReportById,
  downloadReport,
  listReports,
} = require('../controllers/report.controller');
const validate = require('../middleware/validate.middleware');

const router = Router();

// ─── GET /api/reports ─────────────────────────────────────────────────────────
router.get('/', listReports);

// ─── POST /api/reports/export ─────────────────────────────────────────────────
router.post(
  '/export',
  [
    body('contractId')
      .notEmpty()
      .withMessage('contractId is required.')
      .isMongoId()
      .withMessage('contractId must be a valid MongoDB ObjectId.'),
  ],
  validate,
  exportReport
);

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
router.get('/:id', getReportById);

// ─── GET /api/reports/:id/download ───────────────────────────────────────────
router.get('/:id/download', downloadReport);

module.exports = router;
