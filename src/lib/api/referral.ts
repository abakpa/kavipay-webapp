import axios from 'axios';
import { getIdToken } from '../firebase';

// Referral API base URL
export const REFERRAL_API_BASE_URL =
  import.meta.env.VITE_REFERRAL_API_URL || 'https://ref-api.ploutoslabs.io/api/v1';

// Create referral API instance
export const referralApi = axios.create({
  baseURL: REFERRAL_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase token to referral API requests
referralApi.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
referralApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `[Referral API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`,
      { error: error.response?.data || error.message }
    );
    return Promise.reject(error);
  }
);

// ============ API ENDPOINTS ============

/**
 * Get referral dashboard data
 */
export async function getReferralDashboard() {
  try {
    console.log('[Referral API] Fetching dashboard...');
    const response = await referralApi.get('/dashboard');
    console.log('[Referral API] Dashboard response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Dashboard error:', error);
    throw error;
  }
}

/**
 * Get user's referrals list
 */
export async function getReferrals(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    console.log('[Referral API] Fetching referrals...', params);
    const response = await referralApi.get('/referrals', { params });
    console.log('[Referral API] Referrals response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Referrals error:', error);
    throw error;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStats() {
  try {
    console.log('[Referral API] Fetching stats...');
    const response = await referralApi.get('/stats');
    console.log('[Referral API] Stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Stats error:', error);
    throw error;
  }
}

/**
 * Get referral wallet/earnings
 */
export async function getReferralWallet() {
  try {
    console.log('[Referral API] Fetching wallet...');
    const response = await referralApi.get('/wallet');
    console.log('[Referral API] Wallet response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Wallet error:', error);
    throw error;
  }
}

/**
 * Get referral transactions
 */
export async function getReferralTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) {
  try {
    console.log('[Referral API] Fetching transactions...', params);
    const response = await referralApi.get('/transactions', { params });
    console.log('[Referral API] Transactions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Transactions error:', error);
    throw error;
  }
}

/**
 * Get user's referral profile/settings
 */
export async function getReferralProfile() {
  try {
    console.log('[Referral API] Fetching profile...');
    const response = await referralApi.get('/profile');
    console.log('[Referral API] Profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Profile error:', error);
    throw error;
  }
}

/**
 * Get user info (current user)
 */
export async function getReferralUser() {
  try {
    console.log('[Referral API] Fetching user...');
    const response = await referralApi.get('/user');
    console.log('[Referral API] User response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] User error:', error);
    throw error;
  }
}

/**
 * Get user info by me endpoint
 */
export async function getReferralMe() {
  try {
    console.log('[Referral API] Fetching me...');
    const response = await referralApi.get('/me');
    console.log('[Referral API] Me response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Me error:', error);
    throw error;
  }
}

/**
 * Test all possible endpoints and log results
 */
export async function testAllReferralEndpoints() {
  console.log('========== TESTING REFERRAL API ENDPOINTS ==========');
  console.log('Base URL:', REFERRAL_API_BASE_URL);

  const endpoints = [
    { name: 'Dashboard', fn: () => referralApi.get('/dashboard') },
    { name: 'Referrals', fn: () => referralApi.get('/referrals') },
    { name: 'Stats', fn: () => referralApi.get('/stats') },
    { name: 'Wallet', fn: () => referralApi.get('/wallet') },
    { name: 'Transactions', fn: () => referralApi.get('/transactions') },
    { name: 'Profile', fn: () => referralApi.get('/profile') },
    { name: 'User', fn: () => referralApi.get('/user') },
    { name: 'Me', fn: () => referralApi.get('/me') },
    { name: 'Settings', fn: () => referralApi.get('/settings') },
    { name: 'Earnings', fn: () => referralApi.get('/earnings') },
    { name: 'My Referrals', fn: () => referralApi.get('/my-referrals') },
    { name: 'Auth Firebase', fn: () => referralApi.post('/auth/firebase') },
  ];

  const results: Record<string, unknown> = {};

  for (const endpoint of endpoints) {
    try {
      console.log(`\n[Testing] ${endpoint.name}...`);
      const response = await endpoint.fn();
      console.log(`[SUCCESS] ${endpoint.name}:`, response.data);
      results[endpoint.name] = { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown }; message?: string };
      console.log(`[FAILED] ${endpoint.name}:`, err.response?.status, err.response?.data || err.message);
      results[endpoint.name] = {
        success: false,
        status: err.response?.status,
        error: err.response?.data || err.message
      };
    }
  }

  console.log('\n========== RESULTS SUMMARY ==========');
  console.table(Object.entries(results).map(([name, result]) => ({
    Endpoint: name,
    Status: (result as { success: boolean }).success ? '✅ Success' : '❌ Failed',
    Details: (result as { success: boolean }).success
      ? 'Data received'
      : (result as { status?: number }).status || 'Error'
  })));

  return results;
}

export default referralApi;
