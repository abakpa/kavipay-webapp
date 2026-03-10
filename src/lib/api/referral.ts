import axios from 'axios';
import { getIdToken } from '../firebase';

// Referral API base URL
// Proxied in dev (vite.config.ts) and production (vercel.json)
export const REFERRAL_API_BASE_URL = '/referral-api';

const referralApi = axios.create({
  baseURL: REFERRAL_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Firebase token to requests
referralApi.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Types ============

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

interface ReferralStatsApiResponse {
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

export interface ReferralListItem {
  id: string;
  name: string;
  email?: string;
  joinedAt: string;
  isActive: boolean;
  earnings: number;
  level: number;
  code: string;
  referralsCount: number;
}

interface ReferralTreeItem {
  id: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    referralCode: string;
    status: string;
    createdAt: string;
  };
  level: number;
  referral_code: string;
  joined_at: string;
  status: string;
  stats: {
    direct_referrals: number;
    total_referrals: number;
    total_earnings: number;
    conversion_rate: number;
  };
}

interface ReferralTreeApiResponse {
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  referral_tree: ReferralTreeItem[];
}

export interface ReferralListResponse {
  referrals: ReferralListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ API Functions ============

export async function getReferralStats(): Promise<ReferralStatsResponse> {
  const response = await referralApi.get<ReferralStatsApiResponse>('/referrals/stats');
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
}

export async function getReferrals(params?: {
  page?: number;
  limit?: number;
}): Promise<ReferralListResponse> {
  const response = await referralApi.get<ReferralTreeApiResponse>('/referrals/tree/flat', {
    params: {
      page: params?.page || 1,
      page_size: params?.limit || 10,
    },
  });

  const { pagination, referral_tree } = response.data;

  return {
    referrals: referral_tree.map((item) => ({
      id: item.id,
      name: item.user.displayName,
      email: item.user.email,
      joinedAt: item.joined_at,
      isActive: item.status === 'active',
      earnings: item.stats.total_earnings,
      level: item.level,
      code: item.referral_code,
      referralsCount: item.stats.total_referrals,
    })),
    pagination: {
      page: pagination.page,
      limit: pagination.page_size,
      total: pagination.total,
      totalPages: pagination.total_pages,
    },
  };
}

export default referralApi;
