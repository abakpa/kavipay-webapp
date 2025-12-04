import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getIdToken } from '../firebase';

// API base URLs
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://test-api.ploutoslabs.io';
export const MINING_API_BASE_URL =
  import.meta.env.VITE_MINING_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://test-api.ploutoslabs.io';

// Storage key for mining JWT token
export const MINING_JWT_TOKEN_KEY = 'mining_jwt_token';

// Main API instance - uses Firebase ID token
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Mining API instance - uses mining JWT token (except for /auth/firebase)
export const miningApi = axios.create({
  baseURL: MINING_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase token to main API requests
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`,
      { error: error.response?.data || error.message }
    );
    return Promise.reject(error);
  }
);

// Mining API: use Firebase token for /auth/firebase, mining JWT for everything else
miningApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.url?.includes('/auth/firebase')) {
    const firebaseToken = await getIdToken();
    if (firebaseToken) {
      config.headers.Authorization = `Bearer ${firebaseToken}`;
    }
  } else {
    const miningToken = localStorage.getItem(MINING_JWT_TOKEN_KEY);
    if (miningToken) {
      config.headers.Authorization = `Bearer ${miningToken}`;
    }
  }
  return config;
});

// Mining API: auto-retry on 401 by re-authenticating with Firebase
miningApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response && error.response.status >= 400) {
      console.error(
        `[Mining API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}:`,
        (error.response.data as Record<string, unknown>)?.error ||
          (error.response.data as Record<string, unknown>)?.message ||
          'Unknown error'
      );
    }

    // Auto re-authenticate on 401 (skip if already retried or if this IS the auth endpoint)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/firebase')
    ) {
      originalRequest._retry = true;

      try {
        localStorage.removeItem(MINING_JWT_TOKEN_KEY);
        const firebaseToken = await getIdToken();
        if (!firebaseToken) {
          return Promise.reject(error);
        }

        const response = await miningApi.post(
          '/auth/firebase',
          {},
          { headers: { Authorization: `Bearer ${firebaseToken}` } }
        );

        if (response.data.token) {
          localStorage.setItem(MINING_JWT_TOKEN_KEY, response.data.token);
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return miningApi(originalRequest);
        }
      } catch (reAuthError) {
        console.error('[MiningAPI] Re-authentication failed:', reAuthError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Token helpers
export const getMiningToken = (): string | null => {
  return localStorage.getItem(MINING_JWT_TOKEN_KEY);
};

export const clearMiningToken = (): void => {
  localStorage.removeItem(MINING_JWT_TOKEN_KEY);
};

export const checkAuthStatus = async () => {
  const token = await getIdToken();
  return { isAuthenticated: !!token, token };
};

export default api;
