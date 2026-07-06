'use strict';
const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

// ─── Ensure reports output directory exists ───────────────────────────────────
const REPORTS_DIR = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  IBM_BLUE:     'FF0F62FE',
  IBM_BLUE_MID: 'FF4589FF',
  IBM_DARK:     'FF161616',
  IBM_GRAY90:   'FF262626',
  IBM_GRAY10:   'FFF4F4F4',
  IBM_GRAY20:   'FFE0E0E0',
  WHITE:        'FFFFFFFF',

  // Severity — background / font / accent border
  CRITICAL: { bg: 'FFFDE8E8', font: 'FFDA1E28', border: 'FFDA1E28', label: 'CRITICAL' },
  HIGH:     { bg: 'FFFFF3E0', font: 'FFB45309', border: 'FFFFB784', label: 'HIGH'     },
  MEDIUM:   { bg: 'FFFEF9C3', font: 'FF854D0E', border: 'FFFDE68A', label: 'MEDIUM'   },
  LOW:      { bg: 'FFF0FDF4', font: 'FF15803D', border: 'FF86EFAC', label: 'LOW'      },

  // Recommendation status
  URGENT:      { bg: 'FFFDE8E8', font: 'FFDA1E28' },
  REQUIRED:    { bg: 'FFFFF3E0', font: 'FFB45309' },
  RECOMMENDED: { bg: 'FFEFF6FF', font: 'FF1D4ED8' },
};

function severityPalette(sev) {
  return C[(sev || '').toUpperCase()] || C.LOW;
}
function statusPalette(status) {
  return C[(status || '').toUpperCase()] || C.RECOMMENDED;
}

// ─── Shared border definition (all four sides, thin) ─────────────────────────
function cellBorder(color = 'FFD1D5DB') {
  const side = { style: 'thin', color: { argb: color } };
  return { top: side, left: side, bottom: side, right: side };
}

// ─── Apply header row formatting ──────────────────────────────────────────────
function styleHeader(row, bgArgb = C.IBM_DARK) {
  row.height = 24;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font      = { bold: true, color: { argb: C.WHITE }, size: 10, name: 'Calibri' };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
    cell.border    = cellBorder(C.IBM_BLUE_MID);
  });
  // Blue bottom accent on header
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top:    { style: 'thin',   color: { argb: bgArgb } },
      left:   { style: 'thin',   color: { argb: bgArgb } },
      right:  { style: 'thin',   color: { argb: bgArgb } },
      bottom: { style: 'medium', color: { argb: C.IBM_BLUE } },
    };
  });
}

// ─── Apply data row borders + alternating row fill ────────────────────────────
function styleDataRow(row, isAlt = false) {
  const rowBg = isAlt ? C.IBM_GRAY10 : C.WHITE;
  row.eachCell({ includeEmpty: true }, (cell) => {
    if (!cell.fill || cell.fill.fgColor?.argb === C.WHITE || !cell.fill.fgColor) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
    }
    cell.border = cellBorder();
    if (!cell.font?.bold) {
      cell.font = { ...(cell.font || {}), size: 10, name: 'Calibri' };
    }
  });
}

// ─── Title block at top of each sheet ────────────────────────────────────────
function addSheetTitle(ws, title, subtitle, colCount) {
  // Row 1 — sheet title
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell(1, 1);
  titleCell.value     = title;
  titleCell.font      = { bold: true, size: 14, color: { argb: C.WHITE }, name: 'Calibri' };
  titleCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.IBM_DARK } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  titleCell.border    = cellBorder(C.IBM_DARK);
  ws.getRow(1).height = 28;

  // Row 2 — subtitle / meta
  ws.mergeCells(2, 1, 2, colCount);
  const subCell = ws.getCell(2, 1);
  subCell.value     = subtitle;
  subCell.font      = { italic: true, size: 9, color: { argb: 'FF525252' }, name: 'Calibri' };
  subCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F8FA' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  subCell.border    = cellBorder(C.IBM_GRAY20);
  ws.getRow(2).height = 16;

  // Row 3 — spacer
  ws.getRow(3).height = 4;
}

// ─── Helper: write a key-value info row ──────────────────────────────────────
function kvRow(ws, key, value, isAlt = false) {
  const row = ws.addRow({ field: key, value });
  row.getCell('field').font      = { bold: true, size: 10, name: 'Calibri', color: { argb: C.IBM_GRAY90 } };
  row.getCell('field').fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C.IBM_GRAY10 : C.WHITE } };
  row.getCell('value').fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? C.IBM_GRAY10 : C.WHITE } };
  row.getCell('value').alignment = { wrapText: true, vertical: 'top' };
  row.getCell('value').font      = { size: 10, name: 'Calibri' };
  row.eachCell({ includeEmpty: true }, (cell) => { cell.border = cellBorder(); });
  return row;
}

// ─── Main export function ─────────────────────────────────────────────────────
/**
 * Generates a production-quality 4-worksheet .xlsx deviation report.
 *
 * Worksheets:
 *   1. Executive Summary  — contract metadata + AI-generated summary
 *   2. Clause Deviations  — full clause comparison with colour-coded severity
 *   3. Risk Assessment    — category scores with colour-coded severity bars
 *   4. Recommendations    — prioritised actions with colour-coded status
 *
 * @param {Object} contract  Mongoose Contract document
 * @param {Object} analysis  Mongoose Analysis document
 * @returns {Promise<{fileName: string, filePath: string}>}
 */
async function generateExcelReport(contract, analysis) {
  const wb = new ExcelJS.Workbook();

  // ── Workbook metadata ──────────────────────────────────────────────────────
  wb.creator       = 'ContractIQ Sentinel';
  wb.lastModifiedBy = 'IBM Granite · watsonx.ai';
  wb.created       = new Date();
  wb.modified      = new Date();
  wb.properties.date1904 = false;

  const reportDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const contractMeta = `Contract: ${contract.title}  |  Generated: ${reportDate}  |  AI: IBM Granite (watsonx.ai)`;

  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 1 — Executive Summary
  // ════════════════════════════════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('Executive Summary', {
    pageSetup: { fitToPage: true, fitToWidth: 1 },
    views: [{ showGridLines: false }],
  });

  ws1.columns = [
    { key: 'field', width: 26 },
    { key: 'value', width: 78 },
  ];

  addSheetTitle(ws1, 'Executive Summary', contractMeta, 2);

  // Section label
  const metaLabel = ws1.addRow({ field: 'CONTRACT DETAILS', value: '' });
  ws1.mergeCells(metaLabel.number, 1, metaLabel.number, 2);
  styleHeader(metaLabel, C.IBM_BLUE);
  metaLabel.getCell(1).value = 'CONTRACT DETAILS';

  const riskLevel  = (analysis.riskLevel || 'unknown').toUpperCase();
  const riskScore  = analysis.riskScore ?? 0;
  const sp = severityPalette(analysis.riskLevel);

  const infoRows = [
    ['Contract Title',     contract.title || 'N/A'],
    ['Contract ID',        String(contract._id)],
    ['Original File',      contract.originalFileName || 'N/A'],
    ['Contract Type',      contract.contractType || 'N/A'],
    ['Parties',            (contract.parties || []).join(' · ') || 'N/A'],
    ['Effective Date',     contract.effectiveDate
      ? new Date(contract.effectiveDate).toLocaleDateString('en-GB') : 'N/A'],
    ['Expiry Date',        contract.expiryDate
      ? new Date(contract.expiryDate).toLocaleDateString('en-GB') : 'N/A'],
    ['Contract Value',     contract.contractValue || 'N/A'],
  ];
  infoRows.forEach(([k, v], i) => kvRow(ws1, k, v, i % 2 === 1));

  // Spacer
  ws1.addRow({});

  // AI Analysis section header
  const aiLabel = ws1.addRow({ field: 'AI ANALYSIS RESULTS', value: '' });
  ws1.mergeCells(aiLabel.number, 1, aiLabel.number, 2);
  styleHeader(aiLabel, C.IBM_BLUE);
  aiLabel.getCell(1).value = 'AI ANALYSIS RESULTS';

  // Risk score row — colour-coded
  const riskRow = ws1.addRow({ field: 'Overall Risk Score', value: `${riskScore} / 100 — ${riskLevel}` });
  riskRow.getCell('field').font  = { bold: true, size: 10, name: 'Calibri' };
  riskRow.getCell('value').font  = { bold: true, size: 11, color: { argb: sp.font }, name: 'Calibri' };
  riskRow.getCell('value').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: sp.bg } };
  riskRow.getCell('field').fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: sp.bg } };
  riskRow.eachCell({ includeEmpty: true }, (cell) => { cell.border = cellBorder(sp.border); });
  riskRow.height = 20;

  const aiRows = [
    ['Deviations Found',   String(analysis.deviations?.length || 0)],
    ['Missing Clauses',    String(analysis.missingClauses?.length || 0)],
    ['AI Provider',        analysis.aiProvider || 'IBM watsonx.ai'],
    ['AI Model',           analysis.aiModel    || 'ibm/granite-13b-instruct-v2'],
    ['Analysis Source',    analysis.responseSource === 'mock'
      ? 'MOCK (IBM Granite not configured)'
      : 'LIVE — IBM Granite via watsonx.ai'],
    ['Analysis Date',      reportDate],
  ];
  aiRows.forEach(([k, v], i) => kvRow(ws1, k, v, i % 2 === 1));

  // Spacer
  ws1.addRow({});

  // Summary section header
  const sumLabel = ws1.addRow({ field: 'EXECUTIVE SUMMARY', value: '' });
  ws1.mergeCells(sumLabel.number, 1, sumLabel.number, 2);
  styleHeader(sumLabel, C.IBM_GRAY90);
  sumLabel.getCell(1).value = 'EXECUTIVE SUMMARY (AI Generated — IBM Granite)';

  // Summary text — merged across both columns, tall row
  const sumRow = ws1.addRow({});
  const sumStart = sumRow.number;
  ws1.mergeCells(sumStart, 1, sumStart, 2);
  const sumCell   = ws1.getCell(sumStart, 1);
  sumCell.value     = analysis.executiveSummary || 'No executive summary available.';
  sumCell.font      = { size: 10, name: 'Calibri', italic: false };
  sumCell.alignment = { wrapText: true, vertical: 'top', indent: 1 };
  sumCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
  sumCell.border    = {
    top:    { style: 'medium', color: { argb: C.IBM_BLUE } },
    left:   { style: 'thin',   color: { argb: C.IBM_GRAY20 } },
    right:  { style: 'thin',   color: { argb: C.IBM_GRAY20 } },
    bottom: { style: 'thin',   color: { argb: C.IBM_GRAY20 } },
  };
  sumRow.height = 140;


  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 2 — Clause Deviations
  // ════════════════════════════════════════════════════════════════════════════
  const ws2 = wb.addWorksheet('Clause Deviations', {
    views: [{ showGridLines: false }],
  });

  ws2.columns = [
    { key: 'num',            width: 5  },
    { key: 'clauseTitle',    width: 26 },
    { key: 'section',        width: 13 },
    { key: 'severity',       width: 11 },
    { key: 'templateText',   width: 48 },
    { key: 'contractText',   width: 48 },
    { key: 'deviation',      width: 46 },
    { key: 'recommendation', width: 46 },
    { key: 'impact',         width: 36 },
  ];

  addSheetTitle(ws2,
    'Clause Deviations',
    `${contractMeta}  |  Deviations: ${analysis.deviations?.length || 0}`,
    ws2.columns.length
  );

  const headerRow2 = ws2.addRow({
    num: '#', clauseTitle: 'Clause Name', section: 'Section',
    severity: 'Severity', templateText: 'Standard Clause (Template)',
    contractText: 'Contract Clause', deviation: 'Deviation Detail',
    recommendation: 'Recommendation', impact: 'Business Impact',
  });
  styleHeader(headerRow2);

  (analysis.deviations || []).forEach((dev, i) => {
    const pal = severityPalette(dev.severity);
    const row = ws2.addRow({
      num:            i + 1,
      clauseTitle:    dev.clauseTitle   || '',
      section:        dev.section       || '',
      severity:       pal.label,
      templateText:   dev.templateText  || '',
      contractText:   dev.contractText  || '',
      deviation:      dev.deviation     || '',
      recommendation: dev.recommendation|| '',
      impact:         dev.impact        || '',
    });
    row.height = 72;

    // Severity cell — full colour coding
    const sevCell = row.getCell('severity');
    sevCell.font      = { bold: true, size: 10, name: 'Calibri', color: { argb: pal.font } };
    sevCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.bg } };
    sevCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sevCell.border    = {
      top:    { style: 'medium', color: { argb: pal.border } },
      left:   { style: 'medium', color: { argb: pal.border } },
      bottom: { style: 'medium', color: { argb: pal.border } },
      right:  { style: 'medium', color: { argb: pal.border } },
    };

    // Clause title — bold
    row.getCell('clauseTitle').font = { bold: true, size: 10, name: 'Calibri' };

    // All cells: wrap text + top-align + border
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { wrapText: true, vertical: 'top', ...(cell.alignment || {}) };
      if (!cell.border || Object.keys(cell.border).length < 4) {
        cell.border = cellBorder();
      }
    });
    styleDataRow(row, i % 2 === 1);
  });

  // Freeze header rows (title + subtitle + spacer + column header = 4 rows)
  ws2.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];


  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 3 — Risk Assessment
  // ════════════════════════════════════════════════════════════════════════════
  const ws3 = wb.addWorksheet('Risk Assessment', {
    views: [{ showGridLines: false }],
  });

  ws3.columns = [
    { key: 'category', width: 32 },
    { key: 'score',    width: 14 },
    { key: 'level',    width: 14 },
    { key: 'scoreBar', width: 40 },
    { key: 'comment',  width: 50 },
  ];

  addSheetTitle(ws3,
    'Risk Assessment',
    `${contractMeta}  |  Overall Risk Score: ${riskScore}/100 — ${riskLevel}`,
    ws3.columns.length
  );

  const headerRow3 = ws3.addRow({
    category: 'Risk Category', score: 'Risk Score',
    level: 'Severity', scoreBar: 'Score Visualisation', comment: 'Comments',
  });
  styleHeader(headerRow3);

  (analysis.riskBreakdown || []).forEach((item, i) => {
    const pal   = severityPalette(item.level);
    const score = item.score ?? 0;

    // Score bar — repeated block character for visual bar
    const barLen = Math.round(score / 5);   // max 20 chars
    const bar    = '█'.repeat(barLen) + '░'.repeat(20 - barLen);

    const row = ws3.addRow({
      category: item.category || '',
      score,
      level:    pal.label,
      scoreBar: bar,
      comment:  getCommentForRiskLevel(item.level),
    });
    row.height = 22;

    // Severity cell
    const lvlCell = row.getCell('level');
    lvlCell.font  = { bold: true, size: 10, name: 'Calibri', color: { argb: pal.font } };
    lvlCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.bg } };
    lvlCell.alignment = { vertical: 'middle', horizontal: 'center' };
    lvlCell.border = {
      top:    { style: 'medium', color: { argb: pal.border } },
      left:   { style: 'medium', color: { argb: pal.border } },
      bottom: { style: 'medium', color: { argb: pal.border } },
      right:  { style: 'medium', color: { argb: pal.border } },
    };

    // Score bar cell — coloured matching severity
    const barCell = row.getCell('scoreBar');
    barCell.font  = { size: 9, color: { argb: pal.font }, name: 'Courier New' };
    barCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.bg } };

    // Score cell — bold + right-aligned
    row.getCell('score').font      = { bold: true, size: 11, name: 'Calibri' };
    row.getCell('score').alignment = { horizontal: 'center', vertical: 'middle' };

    row.getCell('category').font = { bold: i === 0, size: 10, name: 'Calibri' };

    styleDataRow(row, i % 2 === 1);
  });

  // Overall score summary row
  ws3.addRow({});
  const totalRow = ws3.addRow({
    category: 'OVERALL RISK SCORE',
    score:    riskScore,
    level:    riskLevel,
    scoreBar: '',
    comment:  `${riskLevel} — See Executive Summary for full details.`,
  });
  totalRow.height = 22;
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font   = { bold: true, size: 11, color: { argb: C.WHITE }, name: 'Calibri' };
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.IBM_DARK } };
    cell.border = cellBorder(C.IBM_BLUE);
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  ws3.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];


  // ════════════════════════════════════════════════════════════════════════════
  // SHEET 4 — Recommendations
  // ════════════════════════════════════════════════════════════════════════════
  const ws4 = wb.addWorksheet('Recommendations', {
    views: [{ showGridLines: false }],
  });

  ws4.columns = [
    { key: 'priority', width: 10  },
    { key: 'action',   width: 68  },
    { key: 'owner',    width: 20  },
    { key: 'deadline', width: 20  },
    { key: 'status',   width: 16  },
  ];

  addSheetTitle(ws4,
    'Recommendations',
    `${contractMeta}  |  Actions: ${analysis.recommendedActions?.length || 0}`,
    ws4.columns.length
  );

  const headerRow4 = ws4.addRow({
    priority: 'Priority', action: 'Recommended Action',
    owner: 'Owner', deadline: 'Deadline', status: 'Status',
  });
  styleHeader(headerRow4);

  (analysis.recommendedActions || []).forEach((rec, i) => {
    const pal   = statusPalette(rec.status);
    const row   = ws4.addRow({
      priority: rec.priority  ?? i + 1,
      action:   rec.action    || '',
      owner:    rec.owner     || '',
      deadline: rec.deadline  || '',
      status:   (rec.status   || 'recommended').toUpperCase(),
    });
    row.height = 36;

    // Priority — bold + centred
    const priCell  = row.getCell('priority');
    priCell.font   = { bold: true, size: 12, name: 'Calibri', color: { argb: pal.font } };
    priCell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.bg } };
    priCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Status — colour coded
    const stCell   = row.getCell('status');
    stCell.font    = { bold: true, size: 10, name: 'Calibri', color: { argb: pal.font } };
    stCell.fill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: pal.bg } };
    stCell.alignment = { horizontal: 'center', vertical: 'middle' };
    stCell.border  = {
      top: { style: 'medium', color: { argb: pal.font } }, left: { style: 'medium', color: { argb: pal.font } },
      bottom: { style: 'medium', color: { argb: pal.font } }, right: { style: 'medium', color: { argb: pal.font } },
    };

    // Left accent border on action column matching urgency
    row.getCell('action').border = {
      top:    { style: 'thin',   color: { argb: 'FFD1D5DB' } },
      left:   { style: 'medium', color: { argb: pal.font } },
      bottom: { style: 'thin',   color: { argb: 'FFD1D5DB' } },
      right:  { style: 'thin',   color: { argb: 'FFD1D5DB' } },
    };

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { ...(cell.alignment || {}), wrapText: true, vertical: 'middle' };
      if (!cell.border || Object.keys(cell.border).length < 4) {
        cell.border = cellBorder();
      }
    });
    styleDataRow(row, i % 2 === 1);
  });

  ws4.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];


  // ─── Write workbook to disk ───────────────────────────────────────────────
  const safeTitle = (contract.title || 'report')
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 55);
  const timestamp  = new Date().toISOString().slice(0, 10);
  const fileName   = `ContractIQ_Report_${safeTitle}_${timestamp}.xlsx`;
  const outputPath = path.join(REPORTS_DIR, fileName);

  await wb.xlsx.writeFile(outputPath);
  return { fileName, filePath: outputPath };
}


// ─── Risk level comments ──────────────────────────────────────────────────────
function getCommentForRiskLevel(level) {
  const comments = {
    critical: 'Immediate legal review required before execution.',
    high:     'High priority — escalate to Legal / Procurement.',
    medium:   'Renegotiation recommended before execution.',
    low:      'Minor deviation — note for records.',
  };
  return comments[(level || '').toLowerCase()] || '';
}

module.exports = { generateExcelReport, REPORTS_DIR };
