'use strict';

/**
 * IBM watsonx configuration.
 * All credentials are read exclusively from environment variables.
 * No secrets are ever hard-coded.
 *
 * ── Environment variables reference ─────────────────────────────────────────
 *
 * Required for IBM Granite direct (Path 2 — always available):
 *   WATSONX_API_KEY       IBM Cloud API key
 *                         → cloud.ibm.com → Manage → Access (IAM) → API keys
 *   WATSONX_PROJECT_ID    watsonx.ai project ID
 *                         → dataplatform.cloud.ibm.com → project → Manage → General
 *   WATSONX_API_URL       watsonx.ai endpoint (default: https://us-south.ml.cloud.ibm.com)
 *   WATSONX_MODEL_ID      Granite model ID (default: ibm/granite-13b-instruct-v2)
 *
 * Required for watsonx Orchestrate via Watson Assistant (Path 1 — preferred):
 *   WATSONX_ORCHESTRATE_URL
 *       The Watson Assistant service URL for your deployed Orchestrate agent.
 *       How to find it:
 *         1. In watsonx Orchestrate → publish / deploy your agent to Watson Assistant
 *         2. In Watson Assistant instance → Manage → Credentials
 *            The URL looks like:
 *            https://api.us-south.assistant.watson.cloud.ibm.com
 *
 *   WATSONX_ORCHESTRATE_AGENT_ID
 *       The Watson Assistant "Assistant ID" for your deployed agent.
 *       How to find it:
 *         1. Open your Watson Assistant instance (linked from Orchestrate)
 *         2. Go to Assistant Settings → API Details
 *            The Assistant ID is a UUID like: 12345678-abcd-1234-efgh-000000000000
 *         — OR —
 *         3. It appears in the Watson Assistant URL:
 *            https://...watson.cloud.ibm.com/instances/{instance_id}/assistants/{ASSISTANT_ID}/...
 *
 * Optional:
 *   WATSONX_SPACE_ID      Deployment space ID (for model endpoints, not required for text/generation)
 *   USE_MOCK_ANALYSIS     Set to "true" to bypass all IBM calls and return mock data (development)
 */

function getWatsonxConfig() {
  return {
    // ── watsonx.ai (IBM Granite LLM) ────────────────────────────────────────
    apiKey:    process.env.WATSONX_API_KEY    || '',
    projectId: process.env.WATSONX_PROJECT_ID || '',
    apiUrl:    process.env.WATSONX_API_URL     || 'https://us-south.ml.cloud.ibm.com',
    modelId:   process.env.WATSONX_MODEL_ID    || 'ibm/granite-13b-instruct-v2',
    spaceId:   process.env.WATSONX_SPACE_ID    || '',

    // ── Watson Assistant (deployed Orchestrate agent endpoint) ───────────────
    orchestrateUrl:     process.env.WATSONX_ORCHESTRATE_URL      || '',
    orchestrateAgentId: process.env.WATSONX_ORCHESTRATE_AGENT_ID || '',
  };
}

/**
 * Returns true when the minimum credentials for IBM Granite
 * watsonx.ai text-generation are present.
 */
function isWatsonxConfigured() {
  const cfg = getWatsonxConfig();
  return Boolean(cfg.apiKey && cfg.projectId && cfg.apiUrl);
}

/**
 * Returns true when Watson Assistant credentials (for the deployed
 * Orchestrate agent) are fully configured.
 */
function isOrchestrateConfigured() {
  const cfg = getWatsonxConfig();
  return Boolean(cfg.apiKey && cfg.orchestrateUrl && cfg.orchestrateAgentId);
}

module.exports = { getWatsonxConfig, isWatsonxConfigured, isOrchestrateConfigured };
