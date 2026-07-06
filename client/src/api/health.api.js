import api from './axiosInstance';

/**
 * health.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Backend health check — used by the Home page to show live API/DB/AI status.
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
  return response.data;
}
