import { Users, UserCheck, Coins, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ReferralStats } from '@/types/referral';
import { formatReferralBonus } from '@/utils/referral';
import { cn } from '@/lib/utils';

interface ReferralStatsCardProps {
  stats: ReferralStats;
  onClaimBonus?: () => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
}

function StatItem({ icon, label, value, iconBg = 'bg-kaviBlue/10', iconColor = 'text-kaviBlue' }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-accent/50 p-4">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', iconBg)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ReferralStatsCard({
  stats,
  onClaimBonus,
  isLoading,
  className,
}: ReferralStatsCardProps) {
  const handleClaimBonus = async () => {
    if (onClaimBonus) {
      await onClaimBonus();
    }
  };

  return (
    <div className={cn('rounded-2xl bg-card p-6', className)}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Your Stats</h3>

      <div className="grid grid-cols-2 gap-3">
        <StatItem
          icon={<Users className="h-5 w-5" />}
          label="Total Referrals"
          value={stats.totalReferrals}
        />
        <StatItem
          icon={<UserCheck className="h-5 w-5" />}
          label="Active"
          value={stats.activeReferrals}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
        />
        <StatItem
          icon={<Coins className="h-5 w-5" />}
          label="Total Earned"
          value={formatReferralBonus(stats.totalBonus)}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatItem
          icon={<Clock className="h-5 w-5" />}
          label="Pending"
          value={formatReferralBonus(stats.pendingBonus)}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* Claim Bonus Button */}
      {stats.pendingBonus > 0 && onClaimBonus && (
        <Button
          variant="default"
          className="mt-4 w-full"
          onClick={handleClaimBonus}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <Coins className="mr-2 h-4 w-4" />
              Claim {formatReferralBonus(stats.pendingBonus)} Bonus
            </>
          )}
        </Button>
      )}

      {/* Rank Badge */}
      {stats.rank && stats.rank <= 100 && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-4 text-center">
          <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
          <p className="text-2xl font-bold text-amber-500">#{stats.rank}</p>
        </div>
      )}
    </div>
  );
}

export default ReferralStatsCard;
