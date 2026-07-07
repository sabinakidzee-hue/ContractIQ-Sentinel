import api from './axiosInstance';

/**
 * contracts.api.js
 * ──────────────────────────────────────────────────────────────────────────────
 * All API calls related to contract upload and analysis.
 *
 * NOTE: axiosInstance's response interceptor already unwraps the API envelope
 * { success, data, message } → returns the payload directly.
 * Functions here simply return the resolved value from the interceptor.
 */

/**
 * Upload a PDF or DOCX contract file.
 *
 * @param {File}     file          Browser File object from the dropzone.
 * @param {Object}   [meta]        Optional { title, contractType }
 * @param {Function} [onProgress]  Optional upload progress callback (0–100).
 * @returns {Promise<Object>}      { contractId, title, fileType, fileSize, status, uploadedAt }
 */
export async function uploadContract(file, meta = {}, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  if (meta.title)        formData.append('title', meta.title);
  if (meta.contractType) formData.append('contractType', meta.contractType);

  // Do NOT set Content-Type manually — browser must set it with the
  // correct multipart boundary when FormData is the body.
const response = await api.post('/contracts/upload', formData, {
  timeout: 60_000,
  onUploadProgress: onProgress
    ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
    : undefined,
});
  return response;
}

/**
 * Trigger AI analysis for an uploaded contract.
 *
 * @param {string} contractId  MongoDB ObjectId string.
 * @returns {Promise<Object>}  { contractId, analysisId, riskScore, riskLevel, deviationCount, responseSource }
 */
export async function analyzeContract(contractId) {
  const response = await api.post('/contracts/analyze', { contractId }, {
    timeout: 180_000,   // 3-minute timeout — Granite analysis can take time
  });
  return response;
}

/**
 * Fetch a single contract with its linked analysis.
 *
 * @param {string} contractId
 * @returns {Promise<Object>}  Contract document (populated with analysisId)
 */
export async function getContract(contractId) {
  const response = await api.get(`/contracts/${contractId}`);
  return response;
}

/**
 * Fetch a paginated list of all contracts.
 *
 * @param {number} [page=1]
 * @param {number} [limit=20]
 * @returns {Promise<Object>}  { contracts: [], pagination: { total, page, limit, pages } }
 */
export async function listContracts(page = 1, limit = 20) {
  const response = await api.get('/contracts', { params: { page, limit } });
  return response;
}

/**
 * Delete a contract and its associated analysis.
 *
 * @param {string} contractId
 * @returns {Promise<Object>}  { deleted: contractId }
 */
export async function deleteContract(contractId) {
  const response = await api.delete(`/contracts/${contractId}`);
  return response;
}
