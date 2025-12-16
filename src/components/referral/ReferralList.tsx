import { Users, UserCheck, UserX, Loader2 } from 'lucide-react';
import type { ReferralUser } from '@/types/referral';
import { formatReferralBonus } from '@/utils/referral';
import { cn } from '@/lib/utils';

interface ReferralListProps {
  referrals: ReferralUser[];
  isLoading?: boolean;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ReferralItem({ referral }: { referral: ReferralUser }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-accent/50 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            referral.isActive ? 'bg-emerald-500/10' : 'bg-muted'
          )}
        >
          {referral.isActive ? (
            <UserCheck className="h-5 w-5 text-emerald-500" />
          ) : (
            <UserX className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {referral.name || referral.username || 'Anonymous'}
          </p>
          <p className="text-sm text-muted-foreground">
            Joined {formatDate(referral.joinedAt)}
          </p>
        </div>
      </div>
      <div className="text-right">
        {referral.earnings !== undefined && referral.earnings > 0 && (
          <p className="font-medium text-emerald-500">
            +{formatReferralBonus(referral.earnings)}
          </p>
        )}
        <span
          className={cn(
            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
            referral.isActive
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {referral.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
}

export function ReferralList({ referrals, isLoading, className }: ReferralListProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-2xl bg-card p-6', className)}>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Your Referrals</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
          <p className="mt-2 text-sm text-muted-foreground">Loading referrals...</p>
        </div>
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className={cn('rounded-2xl bg-card p-6', className)}>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Your Referrals</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-center text-muted-foreground">
            No referrals yet. Share your code to start earning rewards!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl bg-card p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Your Referrals</h3>
        <span className="text-sm text-muted-foreground">
          {referrals.length} {referrals.length === 1 ? 'referral' : 'referrals'}
        </span>
      </div>
      <div className="space-y-3">
        {referrals.map((referral) => (
          <ReferralItem key={referral.id} referral={referral} />
        ))}
      </div>
    </div>
  );
}

export default ReferralList;
