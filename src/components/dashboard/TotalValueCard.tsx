import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
        'total-value-card relative overflow-hidden rounded-2xl p-6 min-h-[175px]',
        'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_4px_12px_rgba(77,166,255,0.15)]',
        className
      )}
    >
      {/* Decorative circles (matching mobile) */}
      <div className="absolute -top-[100px] -right-[100px] w-[240px] h-[240px] rounded-full bg-blue-500/[0.03] dark:bg-blue-500/[0.05]" />
      <div className="absolute -bottom-[80px] -left-[80px] w-[180px] h-[180px] rounded-full bg-indigo-500/[0.025] dark:bg-indigo-500/[0.04]" />
      <div className="absolute top-[20px] -left-[60px] w-[120px] h-[120px] rounded-full bg-kaviBlue/[0.02] dark:bg-kaviBlue/[0.03]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="balance-label text-[13px] font-medium tracking-wide">
            Available Balance
          </span>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-kaviBlue/[0.08] dark:bg-kaviBlue/10 text-kaviBlue transition-colors hover:bg-kaviBlue/15"
          >
            {isBalanceVisible ? (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Balance Display */}
        <div className="flex items-baseline">
          {isBalanceVisible ? (
            <>
              <span className="currency-label text-xl font-medium mr-1">
                {currency}
              </span>
              <span className="balance-amount text-[44px] font-bold tracking-tight leading-tight dark:drop-shadow-[0_2px_8px_rgba(77,166,255,0.15)]">
                {getCurrencySymbol(currency)}{formatBalance(balance)}
              </span>
            </>
          ) : (
            <span className="balance-hidden text-[44px] font-bold tracking-[8px]">
              • • • •
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalValueCard;
