'use strict';
/**
 * seed.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Populates the database with realistic demo data for development and demos.
 *
 * Usage:
 *   node server/seed.js            — seed (safe: skips if data already exists)
 *   node server/seed.js --force    — drop existing data and re-seed
 *   node server/seed.js --clear    — drop all collections only
 *
 * Requires MONGO_URI in server/.env
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Contract = require('./models/Contract.model');
const Analysis = require('./models/Analysis.model');
const Report   = require('./models/Report.model');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_CONTRACTS = [
  {
    title:            'Acme Corp — Master Vendor Agreement',
    originalFileName: 'Acme_Corp_Vendor_Agreement_v3.pdf',
    storedFileName:   'demo-acme-001.pdf',
    filePath:         '',
    fileType:         'pdf',
    fileSizeBytes:    291_840,
    contractType:     'Master Vendor Agreement',
    parties:          ['GlobalTech Enterprises Ltd.', 'Acme Corp Solutions Inc.'],
    effectiveDate:    new Date('2024-07-01'),
    expiryDate:       new Date('2026-06-30'),
    contractValue:    '$1,250,000',
    status:           'analysed',
  },
  {
    title:            'Nexus Logistics — Service Level Agreement',
    originalFileName: 'Nexus_SLA_v2.pdf',
    storedFileName:   'demo-nexus-002.pdf',
    filePath:         '',
    fileType:         'pdf',
    fileSizeBytes:    184_320,
    contractType:     'Service Level Agreement',
    parties:          ['GlobalTech Enterprises Ltd.', 'Nexus Logistics Ltd.'],
    effectiveDate:    new Date('2024-05-01'),
    expiryDate:       new Date('2025-04-30'),
    contractValue:    '$320,000',
    status:           'analysed',
  },
  {
    title:            'BrightPath IT — Software License Agreement',
    originalFileName: 'BrightPath_SLA_2024.docx',
    storedFileName:   'demo-brightpath-003.docx',
    filePath:         '',
    fileType:         'docx',
    fileSizeBytes:    102_400,
    contractType:     'Software License Agreement',
    parties:          ['GlobalTech Enterprises Ltd.', 'BrightPath IT Solutions'],
    effectiveDate:    new Date('2024-04-01'),
    expiryDate:       new Date('2027-03-31'),
    contractValue:    '$75,000',
    status:           'analysed',
  },
  {
    title:            'Meridian Consulting — Statement of Work',
    originalFileName: 'Meridian_SoW_Phase2.pdf',
    storedFileName:   'demo-meridian-004.pdf',
    filePath:         '',
    fileType:         'pdf',
    fileSizeBytes:    348_160,
    contractType:     'Statement of Work',
    parties:          ['GlobalTech Enterprises Ltd.', 'Meridian Consulting Group'],
    effectiveDate:    new Date('2024-06-01'),
    expiryDate:       new Date('2025-05-31'),
    contractValue:    '$890,000',
    status:           'analysed',
  },
  {
    title:            'Skyline Properties — Office Lease Renewal',
    originalFileName: 'Skyline_Lease_2024.pdf',
    storedFileName:   'demo-skyline-005.pdf',
    filePath:         '',
    fileType:         'pdf',
    fileSizeBytes:    156_672,
    contractType:     'Lease Agreement',
    parties:          ['GlobalTech Enterprises Ltd.', 'Skyline Properties Inc.'],
    effectiveDate:    new Date('2024-08-01'),
    expiryDate:       new Date('2027-07-31'),
    contractValue:    '$240,000',
    status:           'analysed',
  },
];

const SEED_ANALYSES = [
  {
    riskScore: 72, riskLevel: 'high',
    executiveSummary:
      'This Master Vendor Agreement has been reviewed against the enterprise Standard Vendor Agreement template. ' +
      'The analysis identified 6 clause deviations, of which 2 are classified as Critical/High Risk. ' +
      'The limitation of liability cap is fixed at $50,000 — 96% below the rolling 12-month fee-based standard. ' +
      'Indemnification is one-directional. Net-45 payment terms deviate from the approved Net-30 standard. ' +
      'Overall Risk Score: 72/100 — HIGH RISK.',
    deviations: [
      { clauseTitle: 'Limitation of Liability', section: 'Section 8.2', severity: 'critical',
        templateText: 'Aggregate liability shall not exceed total fees paid in the preceding 12 months.',
        contractText: 'Aggregate liability shall not exceed USD $50,000.', deviation: 'Fixed cap replaces rolling 12-month standard.',
        recommendation: 'Replace with rolling 12-month fee-based cap.', impact: 'Financial exposure up to $1.2M beyond threshold.' },
      { clauseTitle: 'Indemnification', section: 'Section 9.1', severity: 'high',
        templateText: 'Each party shall mutually indemnify the other.', contractText: 'Vendor shall indemnify Client only.',
        deviation: 'One-directional indemnification.', recommendation: 'Add mutual indemnification clause.',
        impact: 'Asymmetric legal exposure for Client.' },
      { clauseTitle: 'Payment Terms', section: 'Section 4.3', severity: 'medium',
        templateText: 'Net-30.', contractText: 'Net-45.',
        deviation: '15-day extension beyond standard.', recommendation: 'Renegotiate to Net-30.',
        impact: '$15,000–$20,000 cash flow impact per cycle.' },
    ],
    riskBreakdown: [
      { category: 'Liability Exposure', score: 88, level: 'critical' },
      { category: 'Indemnification',    score: 76, level: 'high'     },
      { category: 'Payment Terms',      score: 55, level: 'medium'   },
      { category: 'IP Ownership',       score: 40, level: 'medium'   },
      { category: 'Data Privacy',       score: 33, level: 'low'      },
    ],
    recommendedActions: [
      { priority: 1, action: 'Escalate Limitation of Liability to General Counsel.', owner: 'Legal Team',   deadline: 'Before execution', status: 'urgent' },
      { priority: 2, action: 'Revise indemnification to mutual obligations.',        owner: 'Legal Team',   deadline: 'Before execution', status: 'urgent' },
      { priority: 3, action: 'Renegotiate payment terms to Net-30.',                 owner: 'Procurement',  deadline: '5 business days',  status: 'required' },
    ],
    aiModel: 'ibm/granite-13b-instruct-v2', aiProvider: 'IBM watsonx.ai (Granite direct)', responseSource: 'mock',
  },
  {
    riskScore: 44, riskLevel: 'medium',
    executiveSummary: 'Nexus Logistics SLA contains 3 deviations of medium severity. Response time SLAs are below enterprise standard. Penalty cap is missing. Overall risk is moderate.',
    deviations: [
      { clauseTitle: 'SLA Response Time', section: 'Section 3.1', severity: 'medium',
        templateText: '4-hour critical response.', contractText: '8-hour critical response.',
        deviation: 'Response time doubled.', recommendation: 'Negotiate to 4-hour SLA.', impact: 'Potential 4-hour operational downtime.' },
    ],
    riskBreakdown: [
      { category: 'Service Levels',    score: 55, level: 'medium' },
      { category: 'Penalty Provisions',score: 48, level: 'medium' },
      { category: 'Termination',       score: 30, level: 'low'    },
    ],
    recommendedActions: [
      { priority: 1, action: 'Negotiate SLA response time to 4 hours.', owner: 'Procurement', deadline: '5 business days', status: 'required' },
    ],
    aiModel: 'ibm/granite-13b-instruct-v2', aiProvider: 'IBM watsonx.ai (Granite direct)', responseSource: 'mock',
  },
  {
    riskScore: 21, riskLevel: 'low',
    executiveSummary: 'BrightPath IT Software License Agreement is broadly compliant. 1 minor deviation in usage restriction language. No critical issues identified. Approved for execution with minor amendment.',
    deviations: [
      { clauseTitle: 'Usage Restrictions', section: 'Section 2.4', severity: 'low',
        templateText: 'Unlimited enterprise users.', contractText: 'Up to 500 named users.',
        deviation: 'User cap introduced.', recommendation: 'Remove user cap or negotiate unlimited.', impact: 'Minor operational constraint.' },
    ],
    riskBreakdown: [
      { category: 'License Scope',  score: 25, level: 'low' },
      { category: 'IP Ownership',   score: 18, level: 'low' },
      { category: 'Renewal Terms',  score: 20, level: 'low' },
    ],
    recommendedActions: [
      { priority: 1, action: 'Remove user cap from Section 2.4.', owner: 'Legal Team', deadline: '10 business days', status: 'recommended' },
    ],
    aiModel: 'ibm/granite-13b-instruct-v2', aiProvider: 'IBM watsonx.ai (Granite direct)', responseSource: 'mock',
  },
  {
    riskScore: 88, riskLevel: 'critical',
    executiveSummary: 'Meridian Consulting Statement of Work contains 9 critical deviations. Scope of work is poorly defined, IP ownership is ambiguous, and liability provisions are entirely absent. DO NOT EXECUTE without full legal review.',
    deviations: [
      { clauseTitle: 'Limitation of Liability', section: 'Section 6.1', severity: 'critical',
        templateText: 'Rolling 12-month cap.', contractText: 'No liability cap specified.',
        deviation: 'Liability cap entirely absent.', recommendation: 'Insert standard rolling 12-month cap immediately.', impact: 'Unlimited financial exposure.' },
      { clauseTitle: 'Scope of Work', section: 'Section 1.0', severity: 'high',
        templateText: 'Detailed deliverable schedule with acceptance criteria.', contractText: 'Deliverables to be agreed during project.',
        deviation: 'No defined deliverables.', recommendation: 'Attach detailed Schedule A before execution.', impact: 'Dispute risk over deliverable definition.' },
    ],
    riskBreakdown: [
      { category: 'Liability',   score: 95, level: 'critical' },
      { category: 'Scope',       score: 85, level: 'critical' },
      { category: 'IP',          score: 80, level: 'critical' },
      { category: 'Payment',     score: 70, level: 'high'     },
      { category: 'Termination', score: 65, level: 'medium'   },
    ],
    recommendedActions: [
      { priority: 1, action: 'DO NOT EXECUTE — escalate to General Counsel immediately.', owner: 'Legal Team',  deadline: 'Immediate', status: 'urgent' },
      { priority: 2, action: 'Insert limitation of liability clause.',                    owner: 'Legal Team',  deadline: 'Before execution', status: 'urgent' },
      { priority: 3, action: 'Define scope of work in Schedule A.',                       owner: 'Procurement', deadline: 'Before execution', status: 'urgent' },
    ],
    aiModel: 'ibm/granite-13b-instruct-v2', aiProvider: 'IBM watsonx.ai (Granite direct)', responseSource: 'mock',
  },
  {
    riskScore: 15, riskLevel: 'low',
    executiveSummary: 'Skyline Properties Office Lease Renewal is fully compliant. 1 minor administrative deviation in notice address. Approved for execution.',
    deviations: [
      { clauseTitle: 'Notice Address', section: 'Section 18.1', severity: 'low',
        templateText: 'Legal department address.', contractText: 'General company address.',
        deviation: 'Notice not directed to Legal.', recommendation: 'Update to Legal department address.', impact: 'Minor administrative risk.' },
    ],
    riskBreakdown: [
      { category: 'Lease Terms',  score: 12, level: 'low' },
      { category: 'Rent Reviews', score: 18, level: 'low' },
      { category: 'Break Clause', score: 15, level: 'low' },
    ],
    recommendedActions: [
      { priority: 1, action: 'Update notice address to Legal department.', owner: 'Legal Team', deadline: '10 business days', status: 'recommended' },
    ],
    aiModel: 'ibm/granite-13b-instruct-v2', aiProvider: 'IBM watsonx.ai (Granite direct)', responseSource: 'mock',
  },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function run() {
  const args  = process.argv.slice(2);
  const force = args.includes('--force');
  const clear = args.includes('--clear');

  console.log('\n  ContractIQ Sentinel — Database Seed Script');
  console.log('  ──────────────────────────────────────────\n');

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log('  [DB] Connected.\n');

  if (force || clear) {
    await Promise.all([
      Contract.deleteMany({}),
      Analysis.deleteMany({}),
      Report.deleteMany({}),
    ]);
    console.log('  [Seed] Collections cleared.');
    if (clear) {
      console.log('  [Seed] --clear flag: exiting without re-seeding.');
      return;
    }
  }

  // Skip if data already exists and --force not specified
  const existing = await Contract.countDocuments();
  if (existing > 0 && !force) {
    console.log(`  [Seed] Database already has ${existing} contracts. Use --force to re-seed.`);
    return;
  }

  // ── Insert contracts ───────────────────────────────────────────────────────
  const contracts = await Contract.insertMany(SEED_CONTRACTS);
  console.log(`  [Seed] Inserted ${contracts.length} contracts.`);

  // ── Insert analyses linked to contracts ───────────────────────────────────
  const analyses = await Analysis.insertMany(
    SEED_ANALYSES.map((a, i) => ({ ...a, contractId: contracts[i]._id, analyzedAt: new Date() }))
  );
  console.log(`  [Seed] Inserted ${analyses.length} analyses.`);

  // ── Back-fill analysisId on contracts ─────────────────────────────────────
  await Promise.all(
    contracts.map((c, i) => Contract.findByIdAndUpdate(c._id, { analysisId: analyses[i]._id }))
  );

  // ── Insert one sample report ────────────────────────────────────────────────
  await Report.create({
    contractId:    contracts[0]._id,
    analysisId:    analyses[0]._id,
    fileName:      `ContractIQ_Report_Acme_Corp_${new Date().toISOString().split('T')[0]}.xlsx`,
    filePath:      '',
    contractTitle: contracts[0].title,
    riskScore:     analyses[0].riskScore,
    riskLevel:     analyses[0].riskLevel,
    deviationCount:analyses[0].deviations.length,
    reportStatus:  'ready',
    generatedAt:   new Date(),
  });
  console.log('  [Seed] Inserted 1 sample report.\n');

  console.log('  ✓ Seed complete.\n');
  console.log(`  Contracts : ${contracts.length}`);
  console.log(`  Analyses  : ${analyses.length}`);
  console.log(`  Reports   : 1\n`);
}

run()
  .catch((err) => { console.error('[Seed] Fatal:', err.message); process.exit(1); })
  .finally(() => mongoose.connection.close());
