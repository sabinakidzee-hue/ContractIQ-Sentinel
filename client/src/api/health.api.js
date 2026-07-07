import api from './axiosInstance';

/**
 * health.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Backend health check — used by the Home page to show live API/DB/AI status.
 *
 * NOTE: axiosInstance's response interceptor already unwraps the API envelope
 * { success, data, message } → returns the payload directly.
 */

/**
 * @returns {Promise<Object>}  {
 *   status, service, version, timestamp,
 *   database: { state, name },
 *   ai: { provider, model, status },
 *   environment
 * }
 */
export async function getHealthStatus() {
  const response = await api.get('/health', { timeout: 8_000 });
  return response;
}
