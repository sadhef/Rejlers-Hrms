import axios from 'axios';

const rawOrigin = import.meta.env.VITE_API_URL;
if (typeof rawOrigin !== 'string' || rawOrigin.trim().length === 0) {
  throw new Error('VITE_API_URL is required');
}

/** Backend origin with no trailing slash, e.g. for building employee photo URLs. */
export const API_ORIGIN = rawOrigin.trim().replace(/\/+$/, '');

const TOKEN_KEY = 'rejlers-hrms-token';
const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export const getToken = () => window.localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => window.localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => window.localStorage.removeItem(TOKEN_KEY);

// In dev, go through Vite's proxy (same-origin) so the browser never hits the Odoo domain's
// CORS policy directly; production needs the backend to allow this app's origin itself.
const baseURL = import.meta.env.DEV
  ? '/bt_hrms_mobile_access/api/v1'
  : `${API_ORIGIN}/bt_hrms_mobile_access/api/v1`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  /** Every endpoint replies `{ success, message, data }`; unwrap to `data` and reject on `success: false` even for an HTTP 200. */
  (response) => {
    const body = response.data;
    if (!body || body.success !== true) {
      return Promise.reject(new Error(body?.message || 'Request failed'));
    }
    return body.data;
  },
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    const serverMessage = error?.response?.data?.message;
    if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
      return Promise.reject(new Error(serverMessage));
    }
    if (error?.request && !error?.response) {
      return Promise.reject(new Error('Unable to reach the server'));
    }
    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

export default axiosInstance;
