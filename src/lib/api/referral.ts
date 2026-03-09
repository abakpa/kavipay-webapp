import axios from 'axios';
import { getIdToken } from '../firebase';

// Referral API base URL
// In development, use the Vite proxy to bypass CORS
// In production, use the actual API URL
const isDevelopment = import.meta.env.DEV;
export const REFERRAL_API_BASE_URL = isDevelopment
  ? '/referral-api'  // Proxied through Vite dev server
  : (import.meta.env.VITE_REFERRAL_API_URL || 'https://ref-api.ploutoslabs.io/api/v1');

// Create referral API instance
export const referralApi = axios.create({
  baseURL: REFERRAL_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase token to referral API requests and log outgoing requests
referralApi.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(
    `%c[Referral API →] ${config.method?.toUpperCase()} ${config.url}`,
    'color: #3b82f6; font-weight: bold;',
    config.params ? '\n📝 Params:' : '',
    config.params || ''
  );
  return config;
});

// Response interceptor for logging ALL responses
referralApi.interceptors.response.use(
  (response) => {
    console.log(
      `%c[Referral API ✓] ${response.config?.method?.toUpperCase()} ${response.config?.url} - ${response.status}`,
      'color: #22c55e; font-weight: bold;',
      '\n📦 Response Data:', response.data
    );
    return response;
  },
  (error) => {
    console.error(
      `%c[Referral API ✗] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`,
      'color: #ef4444; font-weight: bold;',
      '\n❌ Error:', error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ============ API ENDPOINTS ============

// ============ API Response Types ============

// Actual API response for /referrals/stats
export interface ReferralStatsApiResponse {
  referral_stats: {
    user_id: string;
    referral_code: string;
    total_referrals: number;
    direct_referrals: number;
    level2_referrals: number;
    level3_referrals: number;
    active_referrals: number;
    total_earnings: number;
    this_month_referrals: number;
    last_referral_date: string;
    conversion_rate: number;
  };
}

// Normalized stats for internal use
export interface ReferralStatsResponse {
  userId: string;
  referralCode: string;
  totalReferrals: number;
  directReferrals: number;
  level2Referrals: number;
  level3Referrals: number;
  activeReferrals: number;
  totalEarnings: number;
  thisMonthReferrals: number;
  lastReferralDate: string;
  conversionRate: number;
}

// API response for /referrals/tree/flat
export interface ReferralTreeUser {
  id: string;
  telegramID?: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  referralCode: string;
  referredBy: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ReferralTreeItemStats {
  direct_referrals: number;
  total_referrals: number;
  total_earnings: number;
  conversion_rate: number;
}

export interface ReferralTreeItem {
  id: string;
  user: ReferralTreeUser;
  level: number;
  referral_code: string;
  joined_at: string;
  status: string;
  children: ReferralTreeItem[];
  stats: ReferralTreeItemStats;
}

export interface ReferralTreePagination {
  count: number;
  has_next: boolean;
  has_previous: boolean;
  limit: number;
  offset: number;
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ReferralTreeApiResponse {
  pagination: ReferralTreePagination;
  referral_tree: ReferralTreeItem[];
}

// Normalized list item for internal use
export interface ReferralListItem {
  id: string;
  name: string;
  email?: string;
  username?: string;
  joinedAt: string;
  joinedDate?: string;
  isActive: boolean;
  earnings?: number;
  earned?: number;
  status?: string;
  level?: number;
  code?: string;
  referralsCount?: number;
  // Additional fields from tree API
  user?: ReferralTreeUser;
  stats?: ReferralTreeItemStats;
}

export interface ReferralListResponse {
  referrals: ReferralListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export interface ReferralWalletResponse {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn?: number;
  currency: string;
  minimumWithdrawal?: number;
}

export interface ReferralTransaction {
  id: string;
  type: 'commission' | 'withdrawal' | 'bonus' | string;
  description?: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | string;
  createdAt: string;
  date?: string;
  referralId?: string;
  referralName?: string;
  referredUser?: string;
}

export interface ReferralTransactionResponse {
  transactions: ReferralTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API response for /me endpoint (settings tab)
export interface ReferralMeApiResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    status: string;
    referralCode: string;
    walletBalance: number;
    totalEarnings: number;
    totalReferrals: number;
    createdAt: string;
    lastLoginAt: string;
  };
}

// Normalized profile for internal use
export interface ReferralProfileResponse {
  id: string;
  email: string;
  displayName: string;
  name?: string;
  userId?: string;
  role: string;
  status: string;
  referralCode: string;
  referralLink?: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  tier?: string;
  commissionRate?: number;
  language?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface ReferralDashboardResponse {
  stats: {
    totalEarnings: number;
    walletBalance: number;
    pendingRewards: number;
    totalReferrals: number;
    activeReferrals: number;
    growthRate?: number;
    avgPerReferral?: number;
  };
  referralCode: string;
  referralLink: string;
  recentActivities: Array<{
    id: string;
    type: 'signup' | 'earning' | 'withdrawal' | string;
    description: string;
    amount?: number | null;
    time: string;
    createdAt?: string;
  }>;
}

// ============ API ENDPOINTS ============

/**
 * Get referral dashboard data
 */
export async function getReferralDashboard(): Promise<ReferralDashboardResponse> {
  try {
    console.log('[Referral API] Fetching dashboard...');
    const response = await referralApi.get('/referrals/dashboard');
    console.log('[Referral API] Dashboard response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Dashboard error:', error);
    throw error;
  }
}

/**
 * Get user's referrals list (flat tree)
 * Uses /referrals/tree/flat endpoint
 */
export async function getReferrals(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ReferralListResponse> {
  try {
    console.log('[Referral API] Fetching referrals tree/flat...', params);
    const response = await referralApi.get<ReferralTreeApiResponse>('/referrals/tree/flat', {
      params: {
        page: params?.page || 1,
        page_size: params?.limit || 10,
      },
    });
    console.log('[Referral API] Referrals tree response:', response.data);

    // Transform API response to normalized format
    const { pagination, referral_tree } = response.data;

    const referrals: ReferralListItem[] = referral_tree.map((item) => ({
      id: item.id,
      name: item.user.displayName,
      email: item.user.email,
      username: item.user.displayName,
      joinedAt: item.joined_at,
      joinedDate: new Date(item.joined_at).toLocaleDateString(),
      isActive: item.status === 'active',
      earnings: item.stats.total_earnings,
      earned: item.stats.total_earnings,
      status: item.status,
      level: item.level,
      code: item.referral_code,
      referralsCount: item.stats.total_referrals,
      user: item.user,
      stats: item.stats,
    }));

    return {
      referrals,
      pagination: {
        page: pagination.page,
        limit: pagination.page_size,
        total: pagination.total,
        totalPages: pagination.total_pages,
        hasNext: pagination.has_next,
        hasPrevious: pagination.has_previous,
      },
    };
  } catch (error) {
    console.error('[Referral API] Referrals error:', error);
    throw error;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStats(): Promise<ReferralStatsResponse> {
  try {
    console.log('[Referral API] Fetching stats...');
    const response = await referralApi.get<ReferralStatsApiResponse>('/referrals/stats');
    console.log('[Referral API] Stats response:', response.data);

    // Transform snake_case API response to camelCase
    const stats = response.data.referral_stats;
    return {
      userId: stats.user_id,
      referralCode: stats.referral_code,
      totalReferrals: stats.total_referrals,
      directReferrals: stats.direct_referrals,
      level2Referrals: stats.level2_referrals,
      level3Referrals: stats.level3_referrals,
      activeReferrals: stats.active_referrals,
      totalEarnings: stats.total_earnings,
      thisMonthReferrals: stats.this_month_referrals,
      lastReferralDate: stats.last_referral_date,
      conversionRate: stats.conversion_rate,
    };
  } catch (error) {
    console.error('[Referral API] Stats error:', error);
    throw error;
  }
}

/**
 * Get referral wallet/earnings
 */
export async function getReferralWallet(): Promise<ReferralWalletResponse> {
  try {
    console.log('[Referral API] Fetching wallet...');
    const response = await referralApi.get('/referrals/wallet');
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
}): Promise<ReferralTransactionResponse> {
  try {
    console.log('[Referral API] Fetching transactions...', params);
    const response = await referralApi.get('/referrals/transactions', { params });
    console.log('[Referral API] Transactions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Transactions error:', error);
    throw error;
  }
}

/**
 * Get user's referral profile/settings
 * Uses /users/profile endpoint
 */
export async function getReferralProfile(): Promise<ReferralProfileResponse> {
  try {
    console.log('[Referral API] Fetching profile from /users/profile...');
    const response = await referralApi.get<ReferralMeApiResponse>('/users/profile');
    console.log('[Referral API] Profile response:', response.data);

    // Transform API response to normalized format
    const { user } = response.data;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      name: user.displayName,
      userId: user.id,
      role: user.role,
      status: user.status,
      referralCode: user.referralCode,
      referralLink: `https://kavipay.com/ref/${user.referralCode}`,
      walletBalance: user.walletBalance,
      totalEarnings: user.totalEarnings,
      totalReferrals: user.totalReferrals,
      tier: 'Basic', // Not in API, default value
      commissionRate: 0, // Not in API, default value
      language: 'English', // Not in API, default value
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  } catch (error) {
    console.error('[Referral API] Profile error:', error);
    throw error;
  }
}

/**
 * Claim pending referral bonus
 */
export async function claimReferralBonus(): Promise<{ success: boolean; amount: number; message: string }> {
  try {
    console.log('[Referral API] Claiming bonus...');
    const response = await referralApi.post('/referrals/claim');
    console.log('[Referral API] Claim response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Referral API] Claim error:', error);
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
 * Authenticate with referral API using Firebase token
 */
export async function authenticateWithReferralApi() {
  try {
    console.log('[Referral API] Authenticating with Firebase token...');
    const response = await referralApi.post('/auth/firebase');
    console.log('[Referral API] Auth response:', response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    console.error('[Referral API] Auth error:', err.response?.status, err.response?.data || err.message);
    throw error;
  }
}

/**
 * Test all possible endpoints and log results
 */
export async function testAllReferralEndpoints() {
  console.log('========== TESTING REFERRAL API ENDPOINTS ==========');
  console.log('Base URL:', REFERRAL_API_BASE_URL);

  // First, try to authenticate
  console.log('\n🔐 Step 1: Authenticating with Firebase...');
  let authResult = null;
  try {
    authResult = await authenticateWithReferralApi();
    console.log('✅ Authentication successful:', authResult);
  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }

  console.log('\n📡 Step 2: Testing all endpoints...');
  const endpoints = [
    { name: 'Dashboard', fn: () => referralApi.get('/referrals/dashboard') },
    { name: 'Referrals Tree Flat', fn: () => referralApi.get('/referrals/tree/flat?page=1&page_size=10') },
    { name: 'Stats', fn: () => referralApi.get('/referrals/stats') },
    { name: 'Wallet', fn: () => referralApi.get('/referrals/wallet') },
    { name: 'Transactions', fn: () => referralApi.get('/referrals/transactions') },
    { name: 'Profile', fn: () => referralApi.get('/users/profile') },
    { name: 'User', fn: () => referralApi.get('/user') },
    { name: 'Me', fn: () => referralApi.get('/me') },
  ];

  const results: Record<string, unknown> = {
    'Auth Firebase': authResult ? { success: true, data: authResult } : { success: false, error: 'Auth failed' }
  };

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

// Expose test function globally for browser console debugging
if (typeof window !== 'undefined') {
  (window as unknown as { testReferralAPI: typeof testAllReferralEndpoints }).testReferralAPI = testAllReferralEndpoints;
  (window as unknown as { referralApi: typeof referralApi }).referralApi = referralApi;
  console.log(
    '%c[Referral API] Debug functions available:',
    'color: #8b5cf6; font-weight: bold;',
    '\n• window.testReferralAPI() - Test all endpoints',
    '\n• window.referralApi - Axios instance for manual testing'
  );
}

export default referralApi;
