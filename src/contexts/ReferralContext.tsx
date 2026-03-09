import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ReferralStats } from '@/types/referral';
import { generateAppReferralLink } from '@/utils/referral';
import {
  getReferralStats,
  getReferrals,
  getReferralWallet,
  getReferralTransactions,
  getReferralProfile,
  getReferralDashboard,
  claimReferralBonus,
  type ReferralStatsResponse,
  type ReferralWalletResponse,
  type ReferralTransaction,
  type ReferralProfileResponse,
  type ReferralDashboardResponse,
  type ReferralListItem,
} from '@/lib/api/referral';

// ============ Types ============

export interface ReferralWallet {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
  minimumWithdrawal: number;
}

export interface ReferralActivity {
  id: string;
  type: 'signup' | 'earning' | 'withdrawal' | string;
  description: string;
  amount: number | null;
  time: string;
}

export interface ReferralProfile {
  id: string;
  email: string;
  displayName: string;
  userId: string;
  role: string;
  status: string;
  referralCode: string;
  referralLink: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  tier: string;
  commissionRate: number;
  language: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface ReferralDashboardData {
  totalEarnings: number;
  walletBalance: number;
  pendingRewards: number;
  growthRate: number;
  avgPerReferral: number;
  recentActivities: ReferralActivity[];
}

interface ReferralContextType {
  // State
  referralCode: string;
  referralLink: string;
  referralStats: ReferralStats;
  referrals: ReferralListItem[];
  wallet: ReferralWallet;
  transactions: ReferralTransaction[];
  profile: ReferralProfile;
  dashboard: ReferralDashboardData;
  isLoading: boolean;
  isWalletLoading: boolean;
  isTransactionsLoading: boolean;
  isProfileLoading: boolean;
  isDashboardLoading: boolean;
  error: string | null;

  // Pagination
  referralsPagination: { page: number; limit: number; total: number; totalPages: number };
  transactionsPagination: { page: number; limit: number; total: number; totalPages: number };

  // Actions
  loadReferrals: (page?: number, limit?: number) => Promise<void>;
  loadStats: () => Promise<void>;
  loadWallet: () => Promise<void>;
  loadTransactions: (params?: { page?: number; limit?: number; type?: string; status?: string }) => Promise<void>;
  loadProfile: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  claimBonus: () => Promise<boolean>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

// ============ Default Values ============

const defaultWallet: ReferralWallet = {
  balance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  totalWithdrawn: 0,
  currency: 'USD',
  minimumWithdrawal: 50,
};

const defaultProfile: ReferralProfile = {
  id: '',
  email: '',
  displayName: '',
  userId: '',
  role: 'user',
  status: 'active',
  referralCode: '',
  referralLink: '',
  walletBalance: 0,
  totalEarnings: 0,
  totalReferrals: 0,
  tier: 'Basic',
  commissionRate: 0,
  language: 'English',
  createdAt: '',
  lastLoginAt: '',
};

const defaultDashboard: ReferralDashboardData = {
  totalEarnings: 0,
  walletBalance: 0,
  pendingRewards: 0,
  growthRate: 0,
  avgPerReferral: 0,
  recentActivities: [],
};

const defaultPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

// ============ Context ============

const ReferralContext = createContext<ReferralContextType | null>(null);

export function useReferral(): ReferralContextType {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}

interface ReferralProviderProps {
  children: ReactNode;
}

export function ReferralProvider({ children }: ReferralProviderProps) {
  const { user } = useAuth();

  // Core state
  const [referrals, setReferrals] = useState<ReferralListItem[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    directReferrals: 0,
    level2Referrals: 0,
    level3Referrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    thisMonthReferrals: 0,
    conversionRate: 0,
    totalBonus: 0,
    pendingBonus: 0,
  });
  const [wallet, setWallet] = useState<ReferralWallet>(defaultWallet);
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);
  const [profile, setProfile] = useState<ReferralProfile>(defaultProfile);
  const [dashboard, setDashboard] = useState<ReferralDashboardData>(defaultDashboard);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  // Pagination
  const [referralsPagination, setReferralsPagination] = useState(defaultPagination);
  const [transactionsPagination, setTransactionsPagination] = useState(defaultPagination);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Store referral code from API (more reliable than user data)
  const [apiReferralCode, setApiReferralCode] = useState<string>('');

  // Derive referral code - prefer API data, fallback to user data
  const referralCode = apiReferralCode || (user?.referralCode ? String(user.referralCode) : '');
  const referralLink = referralCode ? generateAppReferralLink(referralCode) : '';

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============ Load Functions ============

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setIsDashboardLoading(true);
    setError(null);

    try {
      const response: ReferralDashboardResponse = await getReferralDashboard();

      setDashboard({
        totalEarnings: response.stats?.totalEarnings || 0,
        walletBalance: response.stats?.walletBalance || 0,
        pendingRewards: response.stats?.pendingRewards || 0,
        growthRate: response.stats?.growthRate || 0,
        avgPerReferral: response.stats?.avgPerReferral || 0,
        recentActivities: (response.recentActivities || []).map((activity) => ({
          id: activity.id,
          type: activity.type,
          description: activity.description,
          amount: activity.amount ?? null,
          time: activity.time || activity.createdAt || '',
        })),
      });

      // Also update referral code/link if provided
      if (response.referralCode && !referralCode) {
        // The code will be derived from user, but we can use dashboard data as fallback
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      console.error('[ReferralContext] loadDashboard error:', err);
      setError(message);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [referralCode]);

  // Load referrals list
  const loadReferrals = useCallback(async (page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getReferrals({ page, limit });

      setReferrals(response.referrals || []);
      setReferralsPagination(response.pagination || defaultPagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load referrals';
      console.error('[ReferralContext] loadReferrals error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load referral stats
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ReferralStatsResponse = await getReferralStats();

      // Update referral code from API (most reliable source)
      if (response.referralCode) {
        console.log('[ReferralContext] loadStats: Setting referralCode from API:', response.referralCode);
        setApiReferralCode(response.referralCode);
      }

      setReferralStats({
        totalReferrals: response.totalReferrals,
        directReferrals: response.directReferrals,
        level2Referrals: response.level2Referrals,
        level3Referrals: response.level3Referrals,
        activeReferrals: response.activeReferrals,
        totalEarnings: response.totalEarnings,
        thisMonthReferrals: response.thisMonthReferrals,
        lastReferralDate: response.lastReferralDate,
        conversionRate: response.conversionRate,
        totalBonus: response.totalEarnings || 0,
        pendingBonus: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      console.error('[ReferralContext] loadStats error:', err);
      setError(message);

      // Fallback to user data if API fails
      if (user) {
        setReferralStats({
          totalReferrals: user.referralCount || 0,
          directReferrals: user.referralCount || 0,
          level2Referrals: 0,
          level3Referrals: 0,
          activeReferrals: Math.floor((user.referralCount || 0) * 0.7),
          totalEarnings: user.referralBonus || 0,
          thisMonthReferrals: 0,
          conversionRate: 0,
          totalBonus: user.referralBonus || 0,
          pendingBonus: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load wallet data
  const loadWallet = useCallback(async () => {
    setIsWalletLoading(true);
    setError(null);

    try {
      const response: ReferralWalletResponse = await getReferralWallet();

      setWallet({
        balance: response.balance || 0,
        pendingBalance: response.pendingBalance || 0,
        totalEarned: response.totalEarned || 0,
        totalWithdrawn: response.totalWithdrawn || 0,
        currency: response.currency || 'USD',
        minimumWithdrawal: response.minimumWithdrawal || 50,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet';
      console.error('[ReferralContext] loadWallet error:', err);
      setError(message);
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    setIsTransactionsLoading(true);
    setError(null);

    try {
      const response = await getReferralTransactions({
        page: params?.page || 1,
        limit: params?.limit || 20,
        type: params?.type,
        status: params?.status,
      });

      setTransactions(response.transactions || []);
      setTransactionsPagination(response.pagination || defaultPagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      console.error('[ReferralContext] loadTransactions error:', err);
      setError(message);
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  // Load profile
  const loadProfile = useCallback(async () => {
    setIsProfileLoading(true);
    setError(null);

    try {
      const response: ReferralProfileResponse = await getReferralProfile();

      // Update referral code from profile API
      if (response.referralCode) {
        console.log('[ReferralContext] loadProfile: Setting referralCode from API:', response.referralCode);
        setApiReferralCode(response.referralCode);
      }

      setProfile({
        id: response.id || '',
        email: response.email || user?.email || '',
        displayName: response.displayName || user?.name || '',
        userId: response.userId || response.id || '',
        role: response.role || 'user',
        status: response.status || 'active',
        referralCode: response.referralCode || referralCode,
        referralLink: response.referralLink || referralLink,
        walletBalance: response.walletBalance || 0,
        totalEarnings: response.totalEarnings || 0,
        totalReferrals: response.totalReferrals || 0,
        tier: response.tier || 'Basic',
        commissionRate: response.commissionRate || 0,
        language: response.language || 'English',
        createdAt: response.createdAt || '',
        lastLoginAt: response.lastLoginAt || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      console.error('[ReferralContext] loadProfile error:', err);
      setError(message);

      // Fallback to user data
      if (user) {
        setProfile({
          id: user.id || '',
          email: user.email || '',
          displayName: user.name || '',
          userId: user.userId || '',
          role: 'user',
          status: 'active',
          referralCode: referralCode,
          referralLink: referralLink,
          walletBalance: 0,
          totalEarnings: 0,
          totalReferrals: 0,
          tier: 'Basic',
          commissionRate: 0,
          language: 'English',
          createdAt: '',
          lastLoginAt: '',
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, [user, referralCode, referralLink]);

  // Claim pending bonus
  const claimBonus = useCallback(async (): Promise<boolean> => {
    if (referralStats.pendingBonus <= 0 && wallet.pendingBalance <= 0) {
      setError('No pending bonus to claim');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await claimReferralBonus();

      if (response.success) {
        // Reload wallet and stats to get fresh data
        await Promise.all([loadWallet(), loadStats()]);
        return true;
      } else {
        setError(response.message || 'Failed to claim bonus');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim bonus';
      console.error('[ReferralContext] claimBonus error:', err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [referralStats.pendingBonus, wallet.pendingBalance, loadWallet, loadStats]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadDashboard(),
      loadReferrals(),
      loadStats(),
      loadWallet(),
      loadTransactions(),
      loadProfile(),
    ]);
  }, [loadDashboard, loadReferrals, loadStats, loadWallet, loadTransactions, loadProfile]);

  // ============ Initial Load Effect ============

  useEffect(() => {
    if (user) {
      // Set initial stats from user data
      setReferralStats((prev) => ({
        ...prev,
        totalReferrals: user.referralCount || 0,
        totalBonus: user.referralBonus || 0,
      }));

      // Set initial profile from user data
      setProfile((prev) => ({
        ...prev,
        id: user.id || '',
        email: user.email || '',
        displayName: user.name || '',
        userId: user.userId || '',
        referralCode: user.referralCode || '',
      }));

      // Fetch fresh data from referral API
      const fetchInitialData = async () => {
        console.log('[ReferralContext] Starting initial data fetch...');
        try {
          const results = await Promise.allSettled([
            getReferralDashboard(),
            getReferralStats(),
            getReferrals({ page: 1, limit: 10 }),
            getReferralWallet(),
            getReferralProfile(),
          ]);

          console.log('[ReferralContext] API Results:', results);

          // Process dashboard
          if (results[0].status === 'fulfilled') {
            const data = results[0].value as ReferralDashboardResponse;
            setDashboard({
              totalEarnings: data.stats?.totalEarnings || 0,
              walletBalance: data.stats?.walletBalance || 0,
              pendingRewards: data.stats?.pendingRewards || 0,
              growthRate: data.stats?.growthRate || 0,
              avgPerReferral: data.stats?.avgPerReferral || 0,
              recentActivities: (data.recentActivities || []).map((a) => ({
                id: a.id,
                type: a.type,
                description: a.description,
                amount: a.amount ?? null,
                time: a.time || a.createdAt || '',
              })),
            });
          }

          // Process stats
          if (results[1].status === 'fulfilled') {
            const stats = results[1].value as ReferralStatsResponse;
            console.log('[ReferralContext] Stats API response:', stats);

            // Update referral code from API (most reliable source)
            if (stats.referralCode) {
              console.log('[ReferralContext] Setting referralCode from API:', stats.referralCode);
              setApiReferralCode(stats.referralCode);
            }

            const newStats = {
              totalReferrals: stats.totalReferrals,
              directReferrals: stats.directReferrals,
              level2Referrals: stats.level2Referrals,
              level3Referrals: stats.level3Referrals,
              activeReferrals: stats.activeReferrals,
              totalEarnings: stats.totalEarnings,
              thisMonthReferrals: stats.thisMonthReferrals,
              lastReferralDate: stats.lastReferralDate,
              conversionRate: stats.conversionRate,
              totalBonus: stats.totalEarnings || 0,
              pendingBonus: 0,
            };
            console.log('[ReferralContext] Setting referralStats to:', newStats);
            setReferralStats(newStats);
          } else {
            console.error('[ReferralContext] Stats API failed:', results[1]);
          }

          // Process referrals
          if (results[2].status === 'fulfilled') {
            const data = results[2].value;
            setReferrals(data.referrals || []);
            setReferralsPagination(data.pagination || defaultPagination);
          }

          // Process wallet
          if (results[3].status === 'fulfilled') {
            const data = results[3].value as ReferralWalletResponse;
            setWallet({
              balance: data.balance || 0,
              pendingBalance: data.pendingBalance || 0,
              totalEarned: data.totalEarned || 0,
              totalWithdrawn: data.totalWithdrawn || 0,
              currency: data.currency || 'USD',
              minimumWithdrawal: data.minimumWithdrawal || 50,
            });
          }

          // Process profile
          if (results[4].status === 'fulfilled') {
            const data = results[4].value as ReferralProfileResponse;
            console.log('[ReferralContext] Profile API response:', data);

            // Also update referral code from profile
            if (data.referralCode) {
              setApiReferralCode(data.referralCode);
            }

            setProfile({
              id: data.id || '',
              email: data.email || user.email || '',
              displayName: data.displayName || user.name || '',
              userId: data.userId || data.id || '',
              role: data.role || 'user',
              status: data.status || 'active',
              referralCode: data.referralCode || user.referralCode || '',
              referralLink: data.referralLink || generateAppReferralLink(data.referralCode || user.referralCode || ''),
              walletBalance: data.walletBalance || 0,
              totalEarnings: data.totalEarnings || 0,
              totalReferrals: data.totalReferrals || 0,
              tier: data.tier || 'Basic',
              commissionRate: data.commissionRate || 0,
              language: data.language || 'English',
              createdAt: data.createdAt || '',
              lastLoginAt: data.lastLoginAt || '',
            });
          }
        } catch (err) {
          console.error('[ReferralContext] Initial fetch error:', err);
        }
      };

      fetchInitialData();
    }
  }, [user?.id]); // Only run when user ID changes (login/logout)

  // ============ Context Value ============

  const value: ReferralContextType = {
    // State
    referralCode,
    referralLink,
    referralStats,
    referrals,
    wallet,
    transactions,
    profile,
    dashboard,
    isLoading,
    isWalletLoading,
    isTransactionsLoading,
    isProfileLoading,
    isDashboardLoading,
    error,

    // Pagination
    referralsPagination,
    transactionsPagination,

    // Actions
    loadReferrals,
    loadStats,
    loadWallet,
    loadTransactions,
    loadProfile,
    loadDashboard,
    claimBonus,
    refreshAll,
    clearError,
  };

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}
