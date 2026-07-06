'use strict';

/**
 * responseParser.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Parses and validates the structured JSON response returned by either
 * the IBM watsonx Orchestrate agent or the IBM Granite direct call.
 *
 * The LLM is instructed to return JSON enclosed in triple-backtick fences:
 *
 *   ```json
 *   { ... }
 *   ```
 *
 * This parser:
 *   1. Extracts JSON from the fence or attempts raw parse.
 *   2. Validates all required top-level fields.
 *   3. Normalises field values (enum enforcement, score clamping, etc.).
 *   4. Applies safe defaults so downstream code never crashes on missing fields.
 */

const VALID_SEVERITY  = new Set(['critical', 'high', 'medium', 'low']);
const VALID_RISK_LEVEL = new Set(['critical', 'high', 'medium', 'low']);
const VALID_REC_STATUS = new Set(['urgent', 'required', 'recommended']);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  const n = Number(value);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function normaliseEnum(value, validSet, fallback) {
  const v = (value || '').toString().toLowerCase().trim();
  return validSet.has(v) ? v : fallback;
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : String(value || fallback).trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Derives a risk level string from a numeric score.
 */
function scoreToLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

// ─── Field normalisers ────────────────────────────────────────────────────────

function normaliseDeviation(raw, index) {
  return {
    clauseTitle:    safeString(raw.clauseTitle    || raw.clause_title    || raw.title, `Clause ${index + 1}`),
    section:        safeString(raw.section        || raw.sectionRef      || ''),
    severity:       normaliseEnum(raw.severity, VALID_SEVERITY, 'medium'),
    templateText:   safeString(raw.templateText   || raw.template_text   || raw.expected || ''),
    contractText:   safeString(raw.contractText   || raw.contract_text   || raw.actual   || ''),
    deviation:      safeString(raw.deviation      || raw.description     || raw.summary  || ''),
    recommendation: safeString(raw.recommendation || raw.remedy          || ''),
    impact:         safeString(raw.impact         || raw.business_impact || ''),
  };
}

function normaliseRiskBreakdown(raw) {
  const score = clamp(raw.score ?? raw.riskScore ?? 0, 0, 100);
  return {
    category: safeString(raw.category || raw.name || 'Unknown'),
    score,
    level:    normaliseEnum(raw.level ?? raw.riskLevel ?? scoreToLevel(score), VALID_RISK_LEVEL, scoreToLevel(score)),
  };
}

function normaliseRecommendation(raw, index) {
  return {
    priority: clamp(raw.priority ?? index + 1, 1, 999),
    action:   safeString(raw.action || raw.description || raw.text || `Action ${index + 1}`),
    owner:    safeString(raw.owner  || raw.responsible  || ''),
    deadline: safeString(raw.deadline || raw.timeframe  || ''),
    status:   normaliseEnum(raw.status || raw.urgency, VALID_REC_STATUS, 'recommended'),
  };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Extracts and normalises an analysis JSON object from an LLM response string.
 *
 * @param {string} rawText   Raw text from IBM Granite / Orchestrate.
 * @returns {Object}         Fully normalised analysis object ready for MongoDB.
 * @throws {Error}           If JSON cannot be extracted or is structurally invalid.
 */
function parseAnalysisResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('ResponseParser: rawText must be a non-empty string.');
  }

  // ── Step 1: Extract JSON from fence ──────────────────────────────────────
  let jsonString = rawText;

  // Match ```json ... ``` or ``` ... ```
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  } else {
    // Try to find a bare JSON object/array
    const braceStart = rawText.indexOf('{');
    if (braceStart !== -1) {
      jsonString = rawText.slice(braceStart);
      // Trim anything after the last closing brace
      const braceEnd = jsonString.lastIndexOf('}');
      if (braceEnd !== -1) jsonString = jsonString.slice(0, braceEnd + 1);
    }
  }

  // ── Step 2: Parse ─────────────────────────────────────────────────────────
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseErr) {
    console.error('[ResponseParser] JSON parse failed. Raw snippet:', rawText.slice(0, 300));
    throw new Error(`ResponseParser: LLM output is not valid JSON. ${parseErr.message}`);
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('ResponseParser: Expected a JSON object at the top level.');
  }

  // ── Step 3: Normalise all fields ──────────────────────────────────────────
  const riskScore = clamp(
    parsed.riskScore ?? parsed.risk_score ?? parsed.overall_risk_score ?? 0,
    0, 100
  );

  const riskLevel = normaliseEnum(
    parsed.riskLevel ?? parsed.risk_level ?? scoreToLevel(riskScore),
    VALID_RISK_LEVEL,
    scoreToLevel(riskScore)
  );

  const deviations = safeArray(
    parsed.deviations ?? parsed.clause_deviations ?? parsed.clauseDeviations ?? []
  ).map((d, i) => normaliseDeviation(d, i));

  const riskBreakdown = safeArray(
    parsed.riskBreakdown ?? parsed.risk_breakdown ?? parsed.riskCategories ?? []
  ).map(normaliseRiskBreakdown);

  const recommendedActions = safeArray(
    parsed.recommendedActions ?? parsed.recommendations ?? parsed.actions ?? []
  ).map((r, i) => normaliseRecommendation(r, i));

  const missingClauses = safeArray(
    parsed.missingClauses ?? parsed.missing_clauses ?? []
  ).map((c) => safeString(c));

  const executiveSummary = safeString(
    parsed.executiveSummary ?? parsed.executive_summary ?? parsed.summary ?? ''
  );

  // ── Step 4: Validate minimum useful content ───────────────────────────────
  if (!executiveSummary && deviations.length === 0) {
    throw new Error(
      'ResponseParser: Parsed response contains neither an executive summary nor any deviations. ' +
      'The LLM output may be malformed.'
    );
  }

  return {
    riskScore,
    riskLevel,
    executiveSummary,
    deviations,
    riskBreakdown,
    recommendedActions,
    missingClauses,
  };
}

module.exports = { parseAnalysisResponse };
