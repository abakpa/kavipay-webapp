import { RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletBalanceCardProps {
  balance: number | null;
  currency?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  error?: string | null;
  className?: string;
}

export function WalletBalanceCard({
  balance,
  currency = 'USDT',
  isLoading = false,
  onRefresh,
  error,
  className,
}: WalletBalanceCardProps) {
  const formatBalance = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Account Balance</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">
          ${balance !== null ? formatBalance(balance) : '0.00'}
        </span>
        <span className="text-lg text-muted-foreground">{currency}</span>
      </div>

      {error && (
        <div className="mt-2 rounded-lg bg-destructive/10 p-3">
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
      )}
    </div>
  );
}

export default WalletBalanceCard;
