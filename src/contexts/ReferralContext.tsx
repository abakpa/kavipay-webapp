import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ReferralUser, ReferralStats } from '@/types/referral';
import { generateAppReferralLink } from '@/utils/referral';

interface ReferralContextType {
  // State
  referralCode: string;
  referralLink: string;
  referralStats: ReferralStats;
  referrals: ReferralUser[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadReferrals: () => Promise<void>;
  loadStats: () => Promise<void>;
  claimBonus: () => Promise<boolean>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

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

  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalBonus: 0,
    pendingBonus: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive referral code and link from user (ensure string type)
  const referralCode = user?.referralCode ? String(user.referralCode) : '';
  const referralLink = referralCode ? generateAppReferralLink(referralCode) : '';

  // Update stats when user data changes
  useEffect(() => {
    if (user) {
      setReferralStats((prev) => ({
        ...prev,
        totalReferrals: user.referralCount || 0,
        totalBonus: user.referralBonus || 0,
      }));
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load referrals list
  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/referrals');
      // setReferrals(response.data);

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate some referrals if user has referral count
      if (user?.referralCount && user.referralCount > 0) {
        const mockReferrals: ReferralUser[] = Array.from(
          { length: Math.min(user.referralCount, 10) },
          (_, i) => ({
            id: `ref_${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: Math.random() > 0.3,
            earnings: Math.random() * 50,
          })
        );
        setReferrals(mockReferrals);
      } else {
        setReferrals([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load referrals';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.referralCount]);

  // Load referral stats
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/referral-stats');
      // setReferralStats(response.data);

      // Mock stats based on user data
      await new Promise((resolve) => setTimeout(resolve, 300));

      const totalReferrals = user?.referralCount || 0;
      const activeReferrals = Math.floor(totalReferrals * 0.7);
      const totalBonus = user?.referralBonus || 0;
      const pendingBonus = totalBonus * 0.1; // 10% pending

      setReferralStats({
        totalReferrals,
        activeReferrals,
        totalBonus,
        pendingBonus,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.referralCount, user?.referralBonus]);

  // Claim pending bonus
  const claimBonus = useCallback(async (): Promise<boolean> => {
    if (referralStats.pendingBonus <= 0) {
      setError('No pending bonus to claim');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/collect-ref-bonus', {
      //   userID: user?.userId,
      //   telegramID: user?.telegramId,
      // });

      // Mock claim
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update stats after claiming
      setReferralStats((prev) => ({
        ...prev,
        totalBonus: prev.totalBonus + prev.pendingBonus,
        pendingBonus: 0,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim bonus';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [referralStats.pendingBonus]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([loadReferrals(), loadStats()]);
  }, [loadReferrals, loadStats]);

  const value: ReferralContextType = {
    referralCode,
    referralLink,
    referralStats,
    referrals,
    isLoading,
    error,
    loadReferrals,
    loadStats,
    claimBonus,
    refreshAll,
    clearError,
  };

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export default ReferralContext;
