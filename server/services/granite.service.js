'use strict';
const axios  = require('axios');
const { getIAMToken }       = require('./iam.service');
const { getWatsonxConfig }  = require('../config/watsonx');

/**
 * granite.service.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Sends a prompt to the IBM watsonx.ai text-generation endpoint backed by
 * IBM Granite and returns the generated text.
 *
 * Endpoint:
 *   POST {WATSONX_API_URL}/ml/v1/text/generation?version=2023-05-29
 *
 * References:
 *   https://cloud.ibm.com/apidocs/watsonx-ai#text-generation
 */

const API_VERSION = '2023-05-29';

/**
 * Default generation parameters tuned for structured contract analysis.
 * Lower temperature gives more deterministic, fact-based output.
 */
const DEFAULT_PARAMS = {
  decoding_method:   'greedy',
  max_new_tokens:    3000,
  min_new_tokens:    50,
  temperature:       0.1,
  repetition_penalty: 1.1,
  stop_sequences:    ['```\n\n', '---END---'],
};

/**
 * Calls the IBM Granite model via watsonx.ai REST API.
 *
 * @param {string}  prompt          The full prompt to send to the model.
 * @param {Object}  [overrideParams] Optional parameter overrides.
 * @returns {Promise<string>}       The generated text string.
 */
async function generateText(prompt, overrideParams = {}) {
  const cfg = getWatsonxConfig();

  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error('IBM Granite: WATSONX_API_KEY and WATSONX_PROJECT_ID must be set.');
  }

  const token = await getIAMToken(cfg.apiKey);

  const url = `${cfg.apiUrl}/ml/v1/text/generation?version=${API_VERSION}`;

  const body = {
    model_id:   cfg.modelId,
    project_id: cfg.projectId,
    input:      prompt,
    parameters: { ...DEFAULT_PARAMS, ...overrideParams },
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      timeout: 120_000,   // 2-minute timeout for large contracts
    });

    const results = response.data?.results;
    if (!results || results.length === 0) {
      throw new Error('IBM Granite: Empty results array in response.');
    }

    const generatedText = results[0]?.generated_text?.trim();
    if (!generatedText) {
      throw new Error('IBM Granite: generated_text is empty in response.');
    }

    // Log token usage in development
    if (process.env.NODE_ENV !== 'production') {
      const usage = results[0]?.generated_token_count;
      console.log(`[Granite] Generated ${usage ?? '?'} tokens for model ${cfg.modelId}`);
    }

    return generatedText;

  } catch (err) {
    const status  = err.response?.status;
    const apiMsg  = err.response?.data?.errors?.[0]?.message
                  || err.response?.data?.message
                  || err.message;

    if (status === 401) throw new Error(`IBM Granite: Unauthorized — check your WATSONX_API_KEY. (${apiMsg})`);
    if (status === 400) throw new Error(`IBM Granite: Bad request — ${apiMsg}`);
    if (status === 429) throw new Error('IBM Granite: Rate limit exceeded. Please retry in a few seconds.');
    if (status === 503) throw new Error('IBM Granite: Service temporarily unavailable. Please retry.');

    throw new Error(`IBM Granite API error [${status ?? 'network'}]: ${apiMsg}`);
  }
}

module.exports = { generateText };
