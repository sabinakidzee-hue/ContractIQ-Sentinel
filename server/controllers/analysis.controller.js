'use strict';
const Analysis     = require('../models/Analysis.model');
const Contract     = require('../models/Contract.model');
const asyncHandler = require('../utils/asyncHandler');
const res_         = require('../utils/responseHelper');

// ─── GET /api/analysis/:contractId ───────────────────────────────────────────
/**
 * Returns the full analysis result for a given contract.
 */
const getAnalysisByContractId = asyncHandler(async (req, res) => {
  const { contractId } = req.params;

  // Verify contract exists
  const contract = await Contract.findById(contractId).select('title status contractType parties effectiveDate expiryDate contractValue fileType fileSizeBytes originalFileName createdAt analysisId');
  if (!contract) {
    return res_.notFound(res, `Contract not found: ${contractId}`);
  }

  // Load analysis
  const analysis = await Analysis.findOne({ contractId }).sort({ createdAt: -1 });
  if (!analysis) {
    return res_.notFound(res, `No analysis found for contract: ${contractId}. Please run the analysis first via POST /api/contracts/analyze`);
  }

  return res_.success(res, {
    contract,
    analysis,
  }, 'Analysis retrieved successfully.');
});

// ─── GET /api/analysis (list — latest per contract) ──────────────────────────
/**
 * Returns the most recent analysis per contract for the dashboard.
 * Query: page, limit, riskLevel filter
 */
const listAnalyses = asyncHandler(async (req, res) => {
  const page     = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit    = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip     = (page - 1) * limit;
  const filter   = {};

  if (req.query.riskLevel) {
    filter.riskLevel = req.query.riskLevel;
  }

  const [analyses, total] = await Promise.all([
    Analysis.find(filter)
      .sort({ analyzedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('contractId riskScore riskLevel deviations missingClauses responseSource analyzedAt aiProvider')
      .populate('contractId', 'title contractType status originalFileName'),
    Analysis.countDocuments(filter),
  ]);

  return res_.success(res, {
    analyses,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }, 'Analyses retrieved successfully.');
});

module.exports = { getAnalysisByContractId, listAnalyses };
