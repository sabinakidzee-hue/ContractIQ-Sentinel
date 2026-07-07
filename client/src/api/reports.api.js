import api from './axiosInstance';

/**
 * reports.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * All API calls related to report generation, retrieval and download.
 *
 * NOTE:
 * axiosInstance already unwraps the backend response:
 *
 *   { success: true, data: <payload>, message: '...' }
 *
 * into:
 *
 *   <payload>
 *
 * Therefore every function simply returns `response`.
 */

/**
 * Generate an Excel report for a contract.
 *
 * @param {string} contractId MongoDB ObjectId.
 * @returns {Promise<Object>}
 * {
 *   reportId,
 *   fileName,
 *   riskScore,
 *   riskLevel,
 *   downloadUrl
 * }
 */
export async function exportReport(contractId) {
  const response = await api.post(
    '/reports/export',
    { contractId },
    {
      timeout: 60_000,
    }
  );

  return response;
}

/**
 * Fetch metadata for a generated report.
 *
 * @param {string} reportId
 * @returns {Promise<Object>}
 */
export async function getReport(reportId) {
  const response = await api.get(`/reports/${reportId}`);
  return response;
}

/**
 * Fetch paginated report history.
 *
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 * {
 *   reports: [],
 *   pagination: {...}
 * }
 */
export async function listReports(page = 1, limit = 20) {
  const response = await api.get('/reports', {
    params: {
      page,
      limit,
    },
  });

  return response;
}

/**
 * Returns the download URL for a generated report.
 * Used directly by the browser.
 *
 * @param {string} reportId
 * @returns {string}
 */
export function getDownloadUrl(reportId) {
  const base =
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api';

  return `${base}/reports/${reportId}/download`;
}