import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getReferralStats, getReferrals } from '@/lib/api/referral';
import type { ReferralStatsResponse, ReferralListItem } from '@/lib/api/referral';
import { generateAppReferralLink, formatReferralBonus } from '@/utils/referral';
import { ReferralCodeCard } from '@/components/referral/ReferralCodeCard';
import { ShareButtons } from '@/components/referral/ShareButtons';
import { ReferralList } from '@/components/referral/ReferralList';
import {
  Users,
  UserCheck,
  TrendingUp,
  Coins,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const REFERRAL_PORTAL_URL = 'https://referral.ploutoslabs.io';

export function ReferralPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<ReferralStatsResponse | null>(null);
  const [referrals, setReferrals] = useState<ReferralListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive referral code from API stats or user data
  const referralCode = stats?.referralCode || user?.referralCode || '';
  const referralLink = referralCode ? generateAppReferralLink(referralCode) : '';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsRes, referralsRes] = await Promise.allSettled([
        getReferralStats(),
        getReferrals({ page: 1, limit: 20 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }
      if (referralsRes.status === 'fulfilled') {
        setReferrals(referralsRes.value.referrals);
      }

      // If both failed, show error
      if (statsRes.status === 'rejected' && referralsRes.status === 'rejected') {
        setError('Failed to load referral data. Please try again.');
      }
    } catch {
      setError('Failed to load referral data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-foreground">Referrals</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !stats && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
            <p className="mt-3 text-sm text-muted-foreground">Loading referral data...</p>
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total Referrals"
              value={stats.totalReferrals}
              iconBg="bg-kaviBlue/10"
              iconColor="text-kaviBlue"
            />
            <StatCard
              icon={<UserCheck className="h-5 w-5" />}
              label="Direct (Level 1)"
              value={stats.directReferrals}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Active"
              value={stats.activeReferrals}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
            <StatCard
              icon={<Coins className="h-5 w-5" />}
              label="Total Earned"
              value={formatReferralBonus(stats.totalEarnings)}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
            />
          </div>
        )}

        {/* Referral Code & Share */}
        {!isLoading && (
          <>
            <ReferralCodeCard referralCode={referralCode} referralLink={referralLink} />
            {referralCode && (
              <ShareButtons referralCode={referralCode} referralLink={referralLink} />
            )}
          </>
        )}

        {/* Referral List */}
        {!isLoading && (
          <ReferralList referrals={referrals} isLoading={false} />
        )}

        {/* Link to full portal */}
        <div className="rounded-2xl bg-card p-6">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Full Referral Dashboard</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            View detailed analytics, manage your wallet, track transactions, and more on the full referral portal.
          </p>
          <a
            href={REFERRAL_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-kaviBlue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-kaviBlue/90"
          >
            Open Full Dashboard
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconBg)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default ReferralPage;
