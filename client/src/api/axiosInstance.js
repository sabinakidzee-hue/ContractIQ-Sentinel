import axios from 'axios';

/**
 * axiosInstance.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Pre-configured Axios instance for all ContractIQ Sentinel API calls.
 *
 * Base URL reads from VITE_API_URL env var (baked in at build time by Vite).
 *   • client/.env.development  → empty string  → Vite dev-server proxy forwards
 *                                                 /api/* → localhost:5000/api/*
 *   • client/.env.production   → full Render URL including /api suffix
 *                                 e.g. https://contractiq-sentinel-api.onrender.com/api
 *
 * Response interceptor — unwraps the API envelope one level:
 *   Every backend response has the shape:
 *     { success: true, data: <payload>, message: '...' }
 *   The interceptor returns `response.data.data` so that every caller receives
 *   the payload object directly — no need for callers to unwrap themselves.
 *
 *   ERROR path — normalises the AxiosError into a plain object:
 *     { message, code, details, status }
 */

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("Axios baseURL =", instance.defaults.baseURL);

// ─── Response interceptor ──────────────────────────────────────────────────────
instance.interceptors.response.use(
  // Unwrap the standard API envelope { success, data, message } → return payload.
  // Callers receive the payload directly without any further unwrapping.
  (response) => response.data?.data ?? response.data,

  // Normalise error shape so callers always receive a plain object
  // with { message, code, details, status } instead of a raw AxiosError.
  (error) => {
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
