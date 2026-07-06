'use strict';
const axios = require('axios');
const { getIAMToken }      = require('./iam.service');
const { getWatsonxConfig } = require('../config/watsonx');

/**
 * orchestrate.service.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Invokes a published IBM watsonx Orchestrate agent via the
 * IBM Watson Assistant v2 REST API.
 *
 * ── How to connect your watsonx Orchestrate agent ────────────────────────────
 *
 * IBM watsonx Orchestrate agents are NOT directly REST-invokable as built.
 * To expose an Orchestrate agent to an external REST caller you must:
 *
 *   Step 1 — In your watsonx Orchestrate workspace:
 *             Go to Agent Settings → Integrations → Deploy to Watson Assistant
 *             (or: Channels → Web Chat → Watson Assistant)
 *
 *   Step 2 — IBM provisions a Watson Assistant instance linked to your agent.
 *             You receive:
 *               • Assistant URL  (e.g. https://api.us-south.assistant.watson.cloud.ibm.com)
 *               • Assistant ID   (a UUID, visible in the Watson Assistant URL or API keys page)
 *
 *   Step 3 — Set these in server/.env:
 *               WATSONX_ORCHESTRATE_URL      = <Assistant URL from Step 2>
 *               WATSONX_ORCHESTRATE_AGENT_ID = <Assistant ID from Step 2>
 *
 *   Step 4 — The same IBM Cloud API key (WATSONX_API_KEY) used for watsonx.ai
 *             is used for IAM authentication to Watson Assistant.
 *
 * ── What this service calls ───────────────────────────────────────────────────
 *
 *   IBM Watson Assistant v2 API (the official external REST interface for
 *   Orchestrate-deployed agents):
 *
 *     POST  {url}/v2/assistants/{id}/sessions
 *     POST  {url}/v2/assistants/{id}/sessions/{session_id}/message
 *     DELETE {url}/v2/assistants/{id}/sessions/{session_id}
 *
 *   Reference: https://cloud.ibm.com/apidocs/assistant-v2
 *
 * ── Fallback behaviour ────────────────────────────────────────────────────────
 *
 *   If WATSONX_ORCHESTRATE_URL or WATSONX_ORCHESTRATE_AGENT_ID are not set,
 *   deviation.service.js automatically falls back to IBM Granite direct
 *   (watsonx.ai /ml/v1/text/generation). No manual intervention required.
 *
 * ── Knowledge Base access ─────────────────────────────────────────────────────
 *
 *   When your agent is deployed to Watson Assistant, its Knowledge Base
 *   (Standard Vendor Agreement + clause library from Orchestrate) remains
 *   active. The Watson Assistant runtime calls back into the Orchestrate
 *   skill execution layer, which retrieves from the Knowledge Base (RAG).
 *   Your backend does NOT need direct access to the Knowledge Base —
 *   the agent handles retrieval internally.
 */

const WATSON_ASSISTANT_API_VERSION = '2023-06-15';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildUrl(baseUrl, assistantId, path) {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/v2/assistants/${assistantId}${path}?version=${WATSON_ASSISTANT_API_VERSION}`;
}

async function createSession(baseUrl, assistantId, token) {
  const url      = buildUrl(baseUrl, assistantId, '/sessions');
  const response = await axios.post(url, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    timeout: 15_000,
  });
  const sessionId = response.data?.session_id;
  if (!sessionId) throw new Error('[Orchestrate] Watson Assistant did not return a session_id.');
  return sessionId;
}

async function sendMessage(baseUrl, assistantId, token, sessionId, text) {
  const url = buildUrl(baseUrl, assistantId, `/sessions/${sessionId}/message`);
  const response = await axios.post(url, {
    input: {
      message_type: 'text',
      text,
      options: {
        return_context: false,
        debug:          false,
      },
    },
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    timeout: 180_000,  // 3 min — Orchestrate agent with RAG retrieval can be slow
  });
  return response.data;
}

async function deleteSession(baseUrl, assistantId, token, sessionId) {
  try {
    const url = buildUrl(baseUrl, assistantId, `/sessions/${sessionId}`);
    await axios.delete(url, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 8_000,
    });
  } catch (err) {
    // Non-fatal — session will expire automatically
    console.warn(`[Orchestrate] Session cleanup failed (non-fatal): ${err.message}`);
  }
}

function extractText(messageResponse) {
  const generic = messageResponse?.output?.generic || [];
  const texts   = generic
    .filter((g) => g.response_type === 'text')
    .map((g) => (g.text || '').trim())
    .filter(Boolean);
  return texts.join('\n\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends contract text to the published watsonx Orchestrate agent
 * (via the Watson Assistant v2 API) and returns the agent's raw text response.
 *
 * The agent is expected to:
 *   1. Use its Knowledge Base (Standard Vendor Agreement) for RAG context.
 *   2. Return a structured JSON analysis wrapped in triple backticks.
 *
 * @param {string}  contractText   Extracted contract text (truncated to 8 000 chars).
 * @param {Object}  [metadata]     { contractType, title }
 * @returns {Promise<string>}      Raw response text (JSON fence expected).
 */
async function invokeOrchestrateAgent(contractText, metadata = {}) {
  const cfg = getWatsonxConfig();

  const baseUrl     = cfg.orchestrateUrl;
  const assistantId = cfg.orchestrateAgentId;

  if (!baseUrl || !assistantId) {
    throw new Error(
      '[Orchestrate] WATSONX_ORCHESTRATE_URL and WATSONX_ORCHESTRATE_AGENT_ID must be set. ' +
      'See deployment instructions in this file.'
    );
  }

  const token     = await getIAMToken(cfg.apiKey);
  const sessionId = await createSession(baseUrl, assistantId, token);

  const titleHint    = metadata.title        ? `Contract Title: ${metadata.title}\n` : '';
  const typeHint     = metadata.contractType ? `Contract Type: ${metadata.contractType}\n` : '';

  // The agent's system prompt (configured in Orchestrate) handles the
  // Knowledge Base lookup. We only need to send the contract text + output schema.
  const userMessage =
    `${titleHint}${typeHint}\n` +
    `Please analyse the following contract against the enterprise Standard Vendor Agreement ` +
    `in the Knowledge Base. Return a structured JSON analysis enclosed in triple backticks with fields:\n` +
    `executiveSummary, riskScore (0-100), riskLevel, deviations (array), ` +
    `riskBreakdown (array), recommendedActions (array), missingClauses (array).\n\n` +
    `CONTRACT TEXT:\n\`\`\`\n${contractText.substring(0, 8000)}\n\`\`\``;

  let rawText = '';
  try {
    const response = await sendMessage(baseUrl, assistantId, token, sessionId, userMessage);
    rawText        = extractText(response);
  } finally {
    await deleteSession(baseUrl, assistantId, token, sessionId);
  }

  if (!rawText) {
    throw new Error(
      '[Orchestrate] Agent returned an empty response. ' +
      'Ensure the agent is deployed to Watson Assistant and its Knowledge Base is active.'
    );
  }

  return rawText;
}

module.exports = { invokeOrchestrateAgent };
