import { useState } from 'react';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TotalValueCardProps {
  balance: number;
  currency?: string;
  className?: string;
}

export function TotalValueCard({ balance, currency = 'USD', className }: TotalValueCardProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      NGN: '₦',
      EUR: '€',
      GBP: '£',
    };
    return symbols[curr] || curr;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-kaviBlue to-kaviBlue/80 p-6 text-white',
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute right-12 top-12 h-16 w-16 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Available Balance</span>
          </div>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            {isBalanceVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{getCurrencySymbol(currency)}</span>
          <span className="text-4xl font-bold tracking-tight">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
          </span>
        </div>

        <p className="mt-2 text-sm text-white/60">
          {currency} Wallet
        </p>
      </div>
    </div>
  );
}

export default TotalValueCard;
