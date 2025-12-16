import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface WalletBalanceHeaderProps {
  onRefresh?: () => Promise<void>;
  className?: string;
}

export function WalletBalanceHeader({ onRefresh, className }: WalletBalanceHeaderProps) {
  const { user } = useAuth();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const balance = user?.gameWalletBalance ?? 0;

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kaviBlue/10">
          <Wallet className="h-5 w-5 text-kaviBlue" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
          <p className="text-xl font-bold text-foreground">
            ${isBalanceVisible ? formatBalance(balance) : '••••••'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsBalanceVisible(!isBalanceVisible)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
        >
          {isBalanceVisible ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent hover:bg-accent/80 disabled:opacity-50"
          >
            <RefreshCw
              className={cn('h-4 w-4 text-muted-foreground', isRefreshing && 'animate-spin')}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export default WalletBalanceHeader;
