'use strict';
const axios = require('axios');

/**
 * iam.service.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Exchanges an IBM Cloud API key for a short-lived IAM Bearer token.
 *
 * IBM IAM token endpoint:
 *   POST https://iam.cloud.ibm.com/identity/token
 *
 * Tokens are cached in-process and refreshed automatically 60 seconds before
 * expiry to avoid failing requests at the boundary.
 *
 * References:
 *   https://cloud.ibm.com/docs/account?topic=account-iamtoken_from_apikey
 */

const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

// ─── In-memory token cache ────────────────────────────────────────────────────
let _cache = {
  token:     null,
  expiresAt: 0,   // Unix ms timestamp
};

const REFRESH_BUFFER_MS = 60 * 1000; // Refresh 60 s before expiry

/**
 * Returns a valid IBM IAM Bearer token, fetching a new one if necessary.
 *
 * @param {string} apiKey  IBM Cloud API key (from WATSONX_API_KEY env var)
 * @returns {Promise<string>} Bearer token string
 */
async function getIAMToken(apiKey) {
  if (!apiKey) {
    throw new Error('IBM IAM: WATSONX_API_KEY is not set. Cannot obtain IAM token.');
  }

  const now = Date.now();

  // Return cached token if still valid
  if (_cache.token && now < _cache.expiresAt - REFRESH_BUFFER_MS) {
    return _cache.token;
  }

  try {
    const response = await axios.post(
      IAM_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey:     apiKey,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept':       'application/json',
        },
        timeout: 15_000,
      }
    );

    const { access_token, expires_in } = response.data;

    if (!access_token) {
      throw new Error('IBM IAM: Response did not contain an access_token.');
    }

    // Cache the token. expires_in is in seconds.
    _cache = {
      token:     access_token,
      expiresAt: now + (expires_in * 1000),
    };

    console.log(`[IAM] Token refreshed. Expires in ${expires_in}s.`);
    return access_token;

  } catch (err) {
    const msg = err.response?.data?.errorMessage
      || err.response?.data?.errorCode
      || err.message;
    throw new Error(`IBM IAM token fetch failed: ${msg}`);
  }
}

/**
 * Clears the token cache — useful in tests or after a credential rotation.
 */
function clearTokenCache() {
  _cache = { token: null, expiresAt: 0 };
}

module.exports = { getIAMToken, clearTokenCache };
