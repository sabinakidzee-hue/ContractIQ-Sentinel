'use strict';
const { isWatsonxConfigured } = require('../config/watsonx');
const { invokeOrchestrateAgent }  = require('./orchestrate.service');
const { analyseViaGranite }        = require('./granite.analysis');
const { parseAnalysisResponse }    = require('./responseParser');

/**
 * deviation.service.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Central dispatcher for contract analysis.
 *
 * ── Production AI integration (this project) ─────────────────────────────────
 *
 *  IBM Granite (ibm/granite-13b-instruct-v2) via the official watsonx.ai
 *  REST API is the PRIMARY production AI engine for ContractIQ Sentinel.
 *
 *    POST {WATSONX_API_URL}/ml/v1/text/generation?version=2023-05-29
 *
 *  The enterprise Standard Vendor Agreement clause requirements are embedded
 *  directly in the Granite system prompt (see granite.analysis.js).
 *  This produces deterministic, auditable results without external state.
 *
 * ── IBM watsonx Orchestrate — solution architecture role ─────────────────────
 *
 *  The IBM watsonx Orchestrate "Build with AI" agent created for this project
 *  is part of the OVERALL SOLUTION ARCHITECTURE and demonstrates the full
 *  IBM watsonx platform workflow (Knowledge Base, RAG, agent skills).
 *
 *  Direct external REST invocation of Build with AI agents is NOT assumed
 *  in this implementation because Orchestrate agents require deployment to
 *  a Watson Assistant channel before they expose a REST interface.
 *
 *  When that deployment is available, Path 1 (Watson Assistant v2 API) becomes
 *  active automatically via environment variable — NO code changes required.
 *
 * ── Priority chain ────────────────────────────────────────────────────────────
 *
 *  1. WATSON ASSISTANT (deployed Orchestrate agent)   — Path 1
 *     Active when: WATSONX_ORCHESTRATE_URL + WATSONX_ORCHESTRATE_AGENT_ID set
 *     Benefit: Knowledge Base RAG with live Standard Vendor Agreement
 *
 *  2. IBM GRANITE DIRECT via watsonx.ai REST          — Path 2 (primary/production)
 *     Active when: WATSONX_API_KEY + WATSONX_PROJECT_ID set
 *     Benefit: No external agent deployment required; works immediately
 *
 *  3. MOCK                                            — Path 3 (development)
 *     Active when: no credentials OR USE_MOCK_ANALYSIS=true
 *     Benefit: Full pipeline testable without any IBM account
 *
 * ── Modularity guarantee ──────────────────────────────────────────────────────
 *
 *  The frontend, controllers, and routes are completely decoupled from
 *  the AI provider. Switching from Granite to Watson Assistant (or any
 *  future Orchestrate API) only requires setting environment variables.
 *  No frontend or controller changes are ever needed.
 *
 * responseSource values: 'orchestrate' | 'live' | 'mock'
 */

// ─── Mock data (preserved from Module 2 for development fallback) ─────────────
const MOCK_DEVIATIONS = [
  {
    clauseTitle:    'Limitation of Liability',
    section:        'Section 8.2',
    severity:       'critical',
    templateText:   'The aggregate liability of either party shall not exceed the total fees paid or payable in the twelve (12) months immediately preceding the event giving rise to the claim.',
    contractText:   'The aggregate liability of either party under this Agreement shall not exceed USD $50,000 regardless of the nature of the claim.',
    deviation:      'Fixed cap of $50,000 replaces the rolling 12-month fee-based cap. At a contract value of $1.25M, this cap provides inadequate protection and is 96% below the enterprise standard.',
    recommendation: 'Replace fixed cap with rolling 12-month fee-based calculation. Escalate to Legal for immediate review before execution.',
    impact:         'Financial exposure up to $1,200,000 beyond approved threshold.',
  },
  {
    clauseTitle:    'Indemnification',
    section:        'Section 9.1',
    severity:       'high',
    templateText:   'Each party shall indemnify, defend, and hold harmless the other party from and against any claims arising out of the indemnifying party\'s negligence, willful misconduct, or breach of this Agreement.',
    contractText:   'Vendor shall indemnify GlobalTech Enterprises from any third-party claims arising from Vendor\'s provision of services under this Agreement.',
    deviation:      'Indemnification is one-directional (Vendor → Client only). Standard template requires bilateral obligations.',
    recommendation: 'Revise to include mutual indemnification language covering both parties.',
    impact:         'GlobalTech has no indemnification obligation, creating asymmetric legal exposure.',
  },
  {
    clauseTitle:    'Payment Terms',
    section:        'Section 4.3',
    severity:       'medium',
    templateText:   'Payment shall be due within thirty (30) days of receipt of a valid invoice (Net-30).',
    contractText:   'Payment shall be due within forty-five (45) days of receipt of a valid invoice (Net-45).',
    deviation:      'Payment terms are Net-45 versus the enterprise-approved Net-30 standard.',
    recommendation: 'Negotiate payment terms back to Net-30 or obtain CFO approval for Net-45.',
    impact:         'Cash flow impact estimated at $15,000–$20,000 per invoice cycle.',
  },
  {
    clauseTitle:    'Intellectual Property Ownership',
    section:        'Section 11.1',
    severity:       'medium',
    templateText:   'All work product created by Vendor specifically for Client shall be the exclusive property of Client upon full payment.',
    contractText:   'Vendor retains ownership of all proprietary tools, methodologies, and background IP. Work product created exclusively for Client shall be assigned to Client upon receipt of full payment, excluding any Vendor background IP incorporated therein.',
    deviation:      'Vendor has introduced background IP carve-out language not present in the standard template. Scope of "background IP" is undefined.',
    recommendation: 'Define "background IP" with a precise list in Schedule A.',
    impact:         'Risk of Vendor retaining rights to critical deliverable components.',
  },
  {
    clauseTitle:    'Termination for Convenience',
    section:        'Section 14.2',
    severity:       'medium',
    templateText:   'Either party may terminate this Agreement for convenience upon thirty (30) days written notice.',
    contractText:   'Either party may terminate this Agreement for convenience upon sixty (60) days written notice.',
    deviation:      'Notice period extended from 30 days to 60 days.',
    recommendation: 'Negotiate back to 30-day notice period.',
    impact:         'Extended vendor lock-in by 30 additional days per termination event.',
  },
  {
    clauseTitle:    'Data Privacy and Security',
    section:        'Section 12.4',
    severity:       'low',
    templateText:   'Vendor shall implement and maintain security measures in accordance with ISO 27001 or equivalent standards.',
    contractText:   'Vendor shall implement reasonable security measures to protect Client data from unauthorized access.',
    deviation:      'Specific security standard reference (ISO 27001) has been removed.',
    recommendation: 'Reinstate explicit ISO 27001 reference or acceptable equivalent (SOC 2 Type II).',
    impact:         'Potential compliance gap with enterprise data security requirements.',
  },
];

const MOCK_RECOMMENDATIONS = [
  { priority: 1, action: 'Escalate Limitation of Liability clause to General Counsel immediately.',       owner: 'Legal Team',    deadline: 'Before execution',  status: 'urgent' },
  { priority: 2, action: 'Revise indemnification to include mutual obligations per enterprise standard.', owner: 'Legal Team',    deadline: 'Before execution',  status: 'urgent' },
  { priority: 3, action: 'Renegotiate payment terms from Net-45 to Net-30 or obtain CFO approval.',      owner: 'Procurement',   deadline: '5 business days',   status: 'required' },
  { priority: 4, action: 'Define background IP scope in Schedule A and attach to agreement.',              owner: 'Legal Team',    deadline: '5 business days',   status: 'required' },
  { priority: 5, action: 'Negotiate termination notice period from 60 days back to 30 days.',             owner: 'Procurement',   deadline: '10 business days',  status: 'recommended' },
  { priority: 6, action: 'Reinstate ISO 27001 security standard reference in data privacy clause.',       owner: 'IT / Security', deadline: '10 business days',  status: 'recommended' },
];

const MOCK_RISK_BREAKDOWN = [
  { category: 'Liability Exposure',  score: 88, level: 'critical' },
  { category: 'Indemnification',     score: 76, level: 'high'     },
  { category: 'Payment Terms',       score: 55, level: 'medium'   },
  { category: 'IP Ownership',        score: 40, level: 'medium'   },
  { category: 'Termination Rights',  score: 62, level: 'medium'   },
  { category: 'Confidentiality',     score: 18, level: 'low'      },
  { category: 'Governing Law',       score: 12, level: 'low'      },
  { category: 'Data Privacy',        score: 33, level: 'low'      },
];

function buildMockResponse() {
  return {
    riskScore:          72,
    riskLevel:          'high',
    executiveSummary:
      'This Master Vendor Agreement has been reviewed against the enterprise Standard Vendor Agreement template (MOCK MODE — IBM watsonx credentials not configured).\n\n' +
      `The analysis identified ${MOCK_DEVIATIONS.length} clause deviations, of which 2 are classified as Critical/High Risk and require immediate legal review prior to execution.\n\n` +
      'Key areas of concern include the limitation of liability cap (fixed at $50,000 vs. the rolling 12-month fee standard), a one-directional indemnification clause, and Net-45 payment terms deviating from the approved Net-30 standard.\n\n' +
      'Overall Risk Score: 72 / 100 — HIGH RISK. Executive review and legal sign-off are strongly recommended before contract execution.\n\n' +
      '[SOURCE: MOCK — Configure WATSONX_API_KEY and WATSONX_PROJECT_ID to enable live IBM Granite analysis]',
    deviations:         MOCK_DEVIATIONS,
    missingClauses:     [],
    recommendedActions: MOCK_RECOMMENDATIONS,
    riskBreakdown:      MOCK_RISK_BREAKDOWN,
    aiModel:            'MOCK — ibm/granite-13b-instruct-v2',
    aiProvider:         'IBM watsonx Orchestrate (MOCK)',
    responseSource:     'mock',
  };
}

// ─── Helper — determines if Orchestrate is fully configured ──────────────────
function isOrchestrateConfigured() {
  return Boolean(
    process.env.WATSONX_ORCHESTRATE_URL &&
    process.env.WATSONX_ORCHESTRATE_AGENT_ID &&
    process.env.WATSONX_API_KEY
  );
}

// ─── Main exported function ───────────────────────────────────────────────────
/**
 * Analyses a contract and returns a structured result.
 *
 * Priority chain: Orchestrate → Granite Direct → Mock
 *
 * @param {string}  extractedText  Plain-text contract content.
 * @param {Object}  [metadata]     { contractType, title }
 * @returns {Promise<Object>}      Normalised analysis result.
 */
async function analyzeContract(extractedText, metadata = {}) {
  // ── Force mock when env flag is set (useful for demos and CI) ────────────
  if (process.env.USE_MOCK_ANALYSIS === 'true') {
    console.log('[Analysis] USE_MOCK_ANALYSIS=true — using mock response.');
    return buildMockResponse();
  }

  // ── Path 1: IBM watsonx Orchestrate ─────────────────────────────────────
  if (isOrchestrateConfigured()) {
    console.log('[Analysis] Using IBM watsonx Orchestrate agent…');
    try {
      const rawResponse = await invokeOrchestrateAgent(extractedText, metadata);
      const parsed      = parseAnalysisResponse(rawResponse);
      return {
        ...parsed,
        aiModel:        process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-instruct-v2',
        aiProvider:     'IBM watsonx Orchestrate',
        responseSource: 'orchestrate',
      };
    } catch (orchestrateErr) {
      console.warn(`[Analysis] Orchestrate failed: ${orchestrateErr.message}. Falling back to Granite direct…`);
    }
  }

  // ── Path 2: IBM Granite direct (watsonx.ai REST) ─────────────────────────
  if (isWatsonxConfigured()) {
    console.log('[Analysis] Using IBM Granite direct (watsonx.ai)…');
    try {
      return await analyseViaGranite(extractedText, metadata);
    } catch (graniteErr) {
      console.warn(`[Analysis] Granite direct failed: ${graniteErr.message}. Falling back to mock…`);
    }
  }

  // ── Path 3: Mock fallback ────────────────────────────────────────────────
  console.warn('[Analysis] No IBM credentials configured — returning MOCK analysis response.');
  return buildMockResponse();
}

module.exports = { analyzeContract };
