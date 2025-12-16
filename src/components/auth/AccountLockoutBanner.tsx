import { Shield, AlertTriangle } from 'lucide-react';

interface AccountLockoutBannerProps {
  isLockedOut: boolean;
  formattedTimeRemaining: string;
  attempts: number;
  remainingAttempts: number;
  shouldShowWarning: boolean;
}

export function AccountLockoutBanner({
  isLockedOut,
  formattedTimeRemaining,
  attempts,
  remainingAttempts,
  shouldShowWarning,
}: AccountLockoutBannerProps) {
  // Account is locked out
  if (isLockedOut) {
    return (
      <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/20">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-destructive">Account Locked</h3>
            <p className="mb-3 text-sm text-destructive/80">
              Too many failed login attempts. Please wait before trying again.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-destructive/20 px-3 py-2">
              <span className="text-xs text-destructive/70">Try again in:</span>
              <span className="text-lg font-bold text-destructive">
                {formattedTimeRemaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show warning when attempts are running low
  if (shouldShowWarning && attempts > 0) {
    return (
      <div className="mb-4 rounded-xl border border-kaviGold/20 bg-kaviGold/10 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-kaviGold" />
          <span className="text-sm text-kaviGold">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before account lockout
          </span>
        </div>
      </div>
    );
  }

  // Show subtle warning after first failed attempt
  if (attempts > 0 && !shouldShowWarning) {
    return (
      <div className="mb-4 text-center text-xs text-muted-foreground">
        {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
      </div>
    );
  }

  return null;
}
