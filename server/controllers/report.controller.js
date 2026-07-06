'use strict';
const path         = require('path');
const fs           = require('fs');
const Report       = require('../models/Report.model');
const Contract     = require('../models/Contract.model');
const Analysis     = require('../models/Analysis.model');
const asyncHandler = require('../utils/asyncHandler');
const res_         = require('../utils/responseHelper');
const { generateExcelReport } = require('../services/excel.service');

// ─── POST /api/reports/export ─────────────────────────────────────────────────
/**
 * Generates an Excel deviation report for a given contract + analysis.
 *
 * Body: { contractId: string }
 */
const exportReport = asyncHandler(async (req, res) => {
  const { contractId } = req.body;

  if (!contractId) {
    return res_.badRequest(res, 'contractId is required in the request body.');
  }

  // ── Load contract ──────────────────────────────────────────────────────────
  const contract = await Contract.findById(contractId);
  if (!contract) {
    return res_.notFound(res, `Contract not found: ${contractId}`);
  }

  if (contract.status !== 'analysed') {
    return res_.unprocessable(res, `Contract must be in "analysed" status before a report can be generated. Current status: "${contract.status}".`);
  }

  // ── Load analysis ──────────────────────────────────────────────────────────
  const analysis = await Analysis.findOne({ contractId }).sort({ createdAt: -1 });
  if (!analysis) {
    return res_.notFound(res, `No analysis found for contract: ${contractId}.`);
  }

  // ── Generate Excel workbook ────────────────────────────────────────────────
  let fileName, filePath;
  try {
    ({ fileName, filePath } = await generateExcelReport(contract, analysis));
  } catch (err) {
    return res_.error(res, `Excel generation failed: ${err.message}`, 500, 'REPORT_GENERATION_ERROR');
  }

  // ── Persist report record ─────────────────────────────────────────────────
  const report = await Report.create({
    contractId:     contract._id,
    analysisId:     analysis._id,
    fileName,
    filePath,
    contractTitle:  contract.title,
    riskScore:      analysis.riskScore,
    riskLevel:      analysis.riskLevel,
    deviationCount: analysis.deviations?.length || 0,
    reportStatus:   'ready',
    generatedAt:    new Date(),
  });

  return res_.created(res, {
    reportId:  report._id,
    fileName:  report.fileName,
    riskScore: report.riskScore,
    riskLevel: report.riskLevel,
    downloadUrl: `/api/reports/${report._id}/download`,
  }, 'Excel report generated successfully.');
});

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
/**
 * Returns report metadata by report ID.
 */
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('contractId', 'title contractType status')
    .populate('analysisId', 'riskScore riskLevel deviations analyzedAt');

  if (!report) {
    return res_.notFound(res, `Report not found: ${req.params.id}`);
  }

  return res_.success(res, report, 'Report retrieved successfully.');
});

// ─── GET /api/reports/:id/download ───────────────────────────────────────────
/**
 * Streams the generated .xlsx file to the client as a file download.
 */
const downloadReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res_.notFound(res, `Report not found: ${req.params.id}`);
  }

  if (report.reportStatus !== 'ready') {
    return res_.unprocessable(res, `Report is not ready for download. Status: "${report.reportStatus}".`);
  }

  if (!report.filePath || !fs.existsSync(report.filePath)) {
    return res_.error(res, 'Report file not found on server. It may have expired.', 404, 'FILE_NOT_FOUND');
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
  res.setHeader('Content-Length', fs.statSync(report.filePath).size);

  const stream = fs.createReadStream(report.filePath);
  stream.pipe(res);
});

// ─── GET /api/reports ─────────────────────────────────────────────────────────
/**
 * Returns a paginated list of all generated reports (newest first).
 */
const listReports = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip  = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find()
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('contractId', 'title contractType'),
    Report.countDocuments(),
  ]);

  return res_.success(res, {
    reports,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  }, 'Reports retrieved successfully.');
});

module.exports = { exportReport, getReportById, downloadReport, listReports };
