'use strict';
const path         = require('path');
const { v4: uuidv4 }        = require('uuid');
const Contract     = require('../models/Contract.model');
const Analysis     = require('../models/Analysis.model');
const asyncHandler = require('../utils/asyncHandler');
const res_         = require('../utils/responseHelper');
const { extractText, wordCount } = require('../services/parser.service');
const { safeUnlink, formatBytes, getExtension } = require('../utils/fileUtils');

// ─── POST /api/contracts/upload ───────────────────────────────────────────────
/**
 * Accepts a single PDF or DOCX file via multipart/form-data.
 * Validates the upload, stores metadata in MongoDB, and returns the contract ID.
 *
 * Body fields (optional):
 *   title         — custom contract title
 *   contractType  — e.g. "Master Vendor Agreement"
 */
const uploadContract = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res_.badRequest(res, 'No file uploaded. Please attach a PDF or DOCX file.');
  }

  const { originalname, filename: storedFileName, path: filePath, size, mimetype } = req.file;
  const ext      = getExtension(originalname);            // 'pdf' | 'docx'
  const title    = req.body.title?.trim() || path.basename(originalname, path.extname(originalname));
  const cType    = req.body.contractType?.trim() || 'Unknown';

  // Persist metadata to MongoDB
  const contract = await Contract.create({
    title,
    originalFileName: originalname,
    storedFileName,
    filePath,
    fileType:         ext,
    fileSizeBytes:    size,
    contractType:     cType,
    status:           'uploaded',
  });

  return res_.created(res, {
    contractId:       contract._id,
    title:            contract.title,
    originalFileName: contract.originalFileName,
    fileType:         contract.fileType,
    fileSize:         formatBytes(size),
    status:           contract.status,
    uploadedAt:       contract.createdAt,
  }, 'Contract uploaded successfully.');
});

// ─── POST /api/contracts/analyze ─────────────────────────────────────────────
/**
 * Extracts text from the stored file, invokes the deviation analysis service,
 * and persists the analysis result linked to the contract.
 *
 * Body: { contractId: string }
 */
const analyzeContract = asyncHandler(async (req, res) => {
  const { contractId } = req.body;

  if (!contractId) {
    return res_.badRequest(res, 'contractId is required in the request body.');
  }

  // ── 1. Load contract ───────────────────────────────────────────────────────
  const contract = await Contract.findById(contractId);
  if (!contract) {
    return res_.notFound(res, `Contract not found: ${contractId}`);
  }

  if (['analysing', 'analysed'].includes(contract.status)) {
    return res_.conflict(res, 'This contract has already been analysed or is currently being analysed.');
  }

  // ── 2. Extract text ────────────────────────────────────────────────────────
  await Contract.findByIdAndUpdate(contractId, { status: 'extracting' });

  let extractedText = '';
  try {
    extractedText = await extractText(contract.filePath, contract.fileType);
  } catch (err) {
    await Contract.findByIdAndUpdate(contractId, { status: 'failed' });
    return res_.error(res, `Text extraction failed: ${err.message}`, 500, 'EXTRACTION_ERROR');
  }

  if (!extractedText || extractedText.length < 50) {
    await Contract.findByIdAndUpdate(contractId, { status: 'failed' });
    return res_.unprocessable(res, 'The uploaded file produced no readable text. Please upload a text-selectable PDF or DOCX.');
  }

  await Contract.findByIdAndUpdate(contractId, {
    extractedText,
    status: 'analysing',
  });

  // ── 3. Run AI analysis (mock in Module 2, live in Module 3) ───────────────
  const { analyzeContract: runAnalysis } = require('../services/deviation.service');

  let analysisResult;
  try {
    analysisResult = await runAnalysis(extractedText, {
      contractType: contract.contractType,
      title:        contract.title,
    });
  } catch (err) {
    await Contract.findByIdAndUpdate(contractId, { status: 'failed' });
    return res_.error(res, `Analysis failed: ${err.message}`, 500, 'ANALYSIS_ERROR');
  }

  // ── 4. Persist analysis ────────────────────────────────────────────────────
  const analysis = await Analysis.create({
    contractId:         contract._id,
    riskScore:          analysisResult.riskScore,
    riskLevel:          analysisResult.riskLevel,
    executiveSummary:   analysisResult.executiveSummary,
    deviations:         analysisResult.deviations,
    missingClauses:     analysisResult.missingClauses,
    recommendedActions: analysisResult.recommendedActions,
    riskBreakdown:      analysisResult.riskBreakdown,
    aiModel:            analysisResult.aiModel,
    aiProvider:         analysisResult.aiProvider,
    responseSource:     analysisResult.responseSource,
    analyzedAt:         new Date(),
  });

  // ── 5. Update contract status ─────────────────────────────────────────────
  await Contract.findByIdAndUpdate(contractId, {
    status:     'analysed',
    analysisId: analysis._id,
  });

  return res_.success(res, {
    contractId:       contract._id,
    analysisId:       analysis._id,
    riskScore:        analysis.riskScore,
    riskLevel:        analysis.riskLevel,
    deviationCount:   analysis.deviations.length,
    responseSource:   analysis.responseSource,
    message:          analysis.responseSource === 'mock'
      ? 'Analysis complete (MOCK — IBM watsonx integration pending Module 3).'
      : 'Analysis complete via IBM watsonx Orchestrate.',
  }, 'Contract analysis completed successfully.');
});

// ─── GET /api/contracts/:id ───────────────────────────────────────────────────
/**
 * Returns full contract metadata + linked analysis (if available).
 */
const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id).populate('analysisId');

  if (!contract) {
    return res_.notFound(res, `Contract not found: ${req.params.id}`);
  }

  return res_.success(res, contract, 'Contract retrieved successfully.');
});

// ─── GET /api/contracts ───────────────────────────────────────────────────────
/**
 * Returns a paginated list of all contracts (newest first).
 * Query params: page (default 1), limit (default 20)
 */
const listContracts = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip  = (page - 1) * limit;

  const [contracts, total] = await Promise.all([
    Contract.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-extractedText -filePath'),
    Contract.countDocuments(),
  ]);

  return res_.success(res, {
    contracts,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }, 'Contracts retrieved successfully.');
});

// ─── DELETE /api/contracts/:id ────────────────────────────────────────────────
/**
 * Deletes a contract and its associated analysis.
 * Also removes the uploaded file from disk.
 */
const deleteContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    return res_.notFound(res, `Contract not found: ${req.params.id}`);
  }

  // Remove uploaded file from disk
  safeUnlink(contract.filePath);

  // Remove linked analysis
  if (contract.analysisId) {
    await Analysis.findByIdAndDelete(contract.analysisId);
  }

  await Contract.findByIdAndDelete(req.params.id);

  return res_.success(res, { deleted: req.params.id }, 'Contract deleted successfully.');
});

module.exports = {
  uploadContract,
  analyzeContract,
  getContractById,
  listContracts,
  deleteContract,
};
