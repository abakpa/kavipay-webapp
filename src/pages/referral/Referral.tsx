import { useEffect } from 'react';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  ReferralCodeCard,
  ShareButtons,
  ReferralStatsCard,
  ReferralList,
} from '@/components/referral';
import { useReferral } from '@/contexts/ReferralContext';

export function Referral() {
  const navigate = useNavigate();
  const {
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
  } = useReferral();

  useEffect(() => {
    // Load referral data on mount
    loadReferrals();
    loadStats();
  }, [loadReferrals, loadStats]);

  const handleRefresh = async () => {
    clearError();
    await refreshAll();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Referrals</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 w-9 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Referral Code Card */}
        <ReferralCodeCard referralCode={referralCode} referralLink={referralLink} />

        {/* Share Buttons */}
        {referralCode && (
          <div className="rounded-2xl bg-card p-6">
            <ShareButtons referralCode={referralCode} referralLink={referralLink} />
          </div>
        )}

        {/* How it Works */}
        <div className="rounded-2xl bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">How it Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Share your code</p>
                <p className="text-sm text-muted-foreground">
                  Send your unique referral link to friends and family
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Friends join</p>
                <p className="text-sm text-muted-foreground">
                  When they sign up using your code, they get bonus rewards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-sm font-semibold text-kaviBlue">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">Earn together</p>
                <p className="text-sm text-muted-foreground">
                  You earn a bonus for each active referral
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <ReferralStatsCard
          stats={referralStats}
          onClaimBonus={claimBonus}
          isLoading={isLoading}
        />

        {/* Referral List */}
        <ReferralList referrals={referrals} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default Referral;
