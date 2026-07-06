'use strict';
const { generateText }    = require('./granite.service');
const { parseAnalysisResponse } = require('./responseParser');

/**
 * prompts.js  (inline in this module for locality)
 * ──────────────────────────────────────────────────────────────────────────────
 * Builds the structured analysis prompt for IBM Granite.
 *
 * Prompt strategy:
 *   - System role via <|system|> tokens (Granite instruct format)
 *   - Few-shot JSON schema example so the model knows the exact output shape
 *   - Hard instruction to return ONLY JSON — no preamble or commentary
 *
 * Contract text is truncated at 7,500 characters to stay within the 8k token
 * context window of granite-13b-instruct-v2. The most critical clause content
 * appears in the first ~5,000 characters of most contracts.
 */
const MAX_CONTRACT_CHARS = 7500;

function buildAnalysisPrompt(contractText, metadata = {}) {
  const truncated    = contractText.substring(0, MAX_CONTRACT_CHARS);
  const typeHint     = metadata.contractType ? `Contract Type: ${metadata.contractType}` : '';
  const titleHint    = metadata.title        ? `Contract Title: ${metadata.title}`        : '';
  const contextBlock = [titleHint, typeHint].filter(Boolean).join('\n');

  return `<|system|>
You are a senior enterprise legal analyst specialising in contract risk assessment.
Your task is to compare the supplied contract against the enterprise-approved Standard Vendor Agreement.

ENTERPRISE STANDARD REQUIREMENTS (apply to all vendor contracts):
- Limitation of Liability: rolling 12-month fee-based cap (not a fixed dollar amount)
- Indemnification: MUTUAL — both parties must indemnify each other
- Payment Terms: Net-30 maximum (no Net-45 or longer)
- Intellectual Property: all custom deliverables must be fully assigned to the client
- Termination for Convenience: maximum 30-day notice period
- Data Security: must reference ISO 27001 or SOC 2 Type II explicitly
- Governing Law: must specify an explicit jurisdiction
- Confidentiality: mutual NDA obligations required for 3+ years

RESPONSE FORMAT — respond ONLY with a JSON object enclosed in triple backticks:
\`\`\`json
{
  "executiveSummary": "<2-4 paragraph plain-English summary>",
  "riskScore": <integer 0-100>,
  "riskLevel": "<low|medium|high|critical>",
  "deviations": [
    {
      "clauseTitle": "<clause name>",
      "section": "<e.g. Section 8.2>",
      "severity": "<critical|high|medium|low>",
      "templateText": "<what the standard template requires>",
      "contractText": "<what the contract actually says>",
      "deviation": "<precise description of the deviation>",
      "recommendation": "<specific corrective action>",
      "impact": "<business/legal impact>"
    }
  ],
  "riskBreakdown": [
    { "category": "<risk category name>", "score": <0-100>, "level": "<low|medium|high|critical>" }
  ],
  "recommendedActions": [
    {
      "priority": <integer>,
      "action": "<specific action to take>",
      "owner": "<responsible team>",
      "deadline": "<e.g. Before execution>",
      "status": "<urgent|required|recommended>"
    }
  ],
  "missingClauses": ["<clause name if entirely absent from contract>"]
}
\`\`\`
<|user|>
${contextBlock ? contextBlock + '\n\n' : ''}Analyse the following contract and return the JSON analysis:

CONTRACT TEXT:
\`\`\`
${truncated}
\`\`\`
<|assistant|>
`;
}

/**
 * Calls IBM Granite directly (watsonx.ai REST — no Orchestrate session overhead).
 *
 * @param {string}  contractText   Extracted contract text.
 * @param {Object}  [metadata]     Optional contract metadata hints.
 * @returns {Promise<Object>}      Normalised analysis result object.
 */
async function analyseViaGranite(contractText, metadata = {}) {
  const prompt       = buildAnalysisPrompt(contractText, metadata);
  const rawResponse  = await generateText(prompt, { max_new_tokens: 3000 });
  const parsed       = parseAnalysisResponse(rawResponse);

  return {
    ...parsed,
    aiModel:        process.env.WATSONX_MODEL_ID || 'ibm/granite-13b-instruct-v2',
    aiProvider:     'IBM watsonx.ai (Granite direct)',
    responseSource: 'live',
  };
}

module.exports = { analyseViaGranite, buildAnalysisPrompt };
