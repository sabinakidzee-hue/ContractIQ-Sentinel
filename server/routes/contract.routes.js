'use strict';
const { Router }  = require('express');
const { body }    = require('express-validator');

const {
  uploadContract,
  analyzeContract,
  getContractById,
  listContracts,
  deleteContract,
} = require('../controllers/contract.controller');

const { upload, multerErrorHandler } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

// ─── POST /api/contracts/upload ───────────────────────────────────────────────
router.post(
  '/upload',
  upload.single('file'),
  multerErrorHandler,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Title must not exceed 300 characters.'),
    body('contractType')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Contract type must not exceed 100 characters.'),
  ],
  validate,
  uploadContract
);

// ─── POST /api/contracts/analyze ─────────────────────────────────────────────
router.post(
  '/analyze',
  [
    body('contractId')
      .notEmpty()
      .withMessage('contractId is required.')
      .isMongoId()
      .withMessage('contractId must be a valid MongoDB ObjectId.'),
  ],
  validate,
  analyzeContract
);

// ─── GET /api/contracts ───────────────────────────────────────────────────────
router.get('/', listContracts);

// ─── GET /api/contracts/:id ───────────────────────────────────────────────────
router.get('/:id', getContractById);

// ─── DELETE /api/contracts/:id ────────────────────────────────────────────────
router.delete('/:id', deleteContract);

module.exports = router;
