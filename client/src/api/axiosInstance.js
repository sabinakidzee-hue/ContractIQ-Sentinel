import axios from 'axios';

/**
 * axiosInstance.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Pre-configured Axios instance for all ContractIQ Sentinel API calls.
 *
 * Base URL reads from VITE_API_URL env var (set in client/.env).
 * Falls back to http://localhost:5000/api for local development.
 *
 * All requests include:
 *   - Content-Type: application/json
 *   - 30-second timeout
 *
 * All responses are automatically unwrapped from the { success, data, message }
 * envelope so consuming code works directly with the payload.
 */

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Response interceptor — unwrap envelope ────────────────────────────────
instance.interceptors.response.use(
  (response) => {
    // Return the inner `data` field from the standard envelope
    // { success: true, data: {...}, message: '...' }
    return response.data;
  },
  (error) => {
    // Normalise error shape so callers always get { message, code, details }
    const apiError = error.response?.data?.error;
    const normalised = {
      message: apiError?.message || error.message || 'An unexpected error occurred.',
      code:    apiError?.code    || 'UNKNOWN_ERROR',
      details: apiError?.details || null,
      status:  error.response?.status || 0,
    };
    return Promise.reject(normalised);
  }
);

export default instance;
