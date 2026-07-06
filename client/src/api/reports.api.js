import api from './axiosInstance';

/**
 * reports.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * API calls for report generation and download.
 */

/**
 * Triggers Excel report generation for a given contract.
 *
 * @param {string} contractId  MongoDB ObjectId string.
 * @returns {Promise<Object>}  { reportId, fileName, riskScore, riskLevel, downloadUrl }
 */
export async function exportReport(contractId) {
  const response = await api.post('/reports/export', { contractId }, {
    timeout: 60_000,   // Excel generation can take a few seconds
  });
  return response.data;
}

/**
 * Fetch report metadata by report ID.
 *
 * @param {string} reportId
 * @returns {Promise<Object>}  Report document
 */
export async function getReport(reportId) {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
}

/**
 * Fetch a paginated list of all generated reports.
 *
 * @param {number} [page=1]
 * @param {number} [limit=20]
 * @returns {Promise<Object>}  { reports: [], pagination }
 */
export async function listReports(page = 1, limit = 20) {
  const response = await api.get('/reports', { params: { page, limit } });
  return response.data;
}

/**
 * Returns the direct download URL for a report file.
 * Used to trigger a browser file download.
 *
 * @param {string} reportId
 * @returns {string}  Absolute URL to the .xlsx download endpoint
 */
export function getDownloadUrl(reportId) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}/reports/${reportId}/download`;
}
