import api from './axiosInstance';

/**
 * analysis.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * API calls for retrieving contract analysis results.
 */

/**
 * Fetch the full analysis result for a contract.
 *
 * @param {string} contractId  MongoDB ObjectId string.
 * @returns {Promise<Object>}  { contract, analysis }
 *   analysis contains: { riskScore, riskLevel, executiveSummary,
 *                        deviations, riskBreakdown, recommendedActions,
 *                        missingClauses, aiProvider, responseSource }
 */
export async function getAnalysis(contractId) {
  const response = await api.get(`/analysis/${contractId}`);
  return response.data;
}

/**
 * Fetch a paginated list of all analyses.
 *
 * @param {Object} [params]         Query params: { page, limit, riskLevel }
 * @returns {Promise<Object>}       { analyses: [], pagination }
 */
export async function listAnalyses(params = {}) {
  const response = await api.get('/analysis', { params });
  return response.data;
}
