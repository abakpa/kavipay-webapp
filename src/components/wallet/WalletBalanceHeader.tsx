import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNairaExchangeRate } from '@/lib/api/deposit';
import { cn } from '@/lib/utils';

interface WalletBalanceHeaderProps {
  className?: string;
}

export function WalletBalanceHeader({ className }: WalletBalanceHeaderProps) {
  const { user } = useAuth();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1500); // Default fallback

  const dollarBalance = user?.dollarBalance ?? 0;
  const nairaBalance = user?.nairaBalance ?? 0;

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rateData = await getNairaExchangeRate();
        if (rateData?.rate) {
          setExchangeRate(rateData.rate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Keep default fallback rate
      }
    };
    fetchExchangeRate();
  }, []);

  // Calculate total balance in USD
  const nairaInUsd = exchangeRate > 0 ? nairaBalance / exchangeRate : 0;
  const totalBalanceUsd = dollarBalance + nairaInUsd;

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleBalanceClick = () => {
    if (isBalanceVisible) {
      setShowBreakdown(!showBreakdown);
    }
  };

  return (
    <div
      className={cn(
        'total-value-card relative overflow-hidden rounded-2xl p-6',
        'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_4px_12px_rgba(77,166,255,0.15)]',
        className
      )}
    >
      {/* Decorative circles (matching dashboard) */}
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
        <div
          className="cursor-pointer"
          onClick={handleBalanceClick}
        >
          {isBalanceVisible ? (
            <>
              <div className="flex items-baseline">
                <span className="currency-label text-xl font-medium mr-1">
                  USD
                </span>
                <span className="balance-amount text-[36px] font-bold tracking-tight leading-tight dark:drop-shadow-[0_2px_8px_rgba(77,166,255,0.15)]">
                  ${formatBalance(totalBalanceUsd)}
                </span>
              </div>

              {/* Breakdown Section */}
              {showBreakdown && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-medium text-muted-foreground">
                      USD Wallet:
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">
                      ${formatBalance(dollarBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-muted-foreground">
                      NGN Wallet:
                    </span>
                    <span className="text-[13px] font-semibold text-foreground">
                      ₦{formatNaira(nairaBalance)} (~${formatBalance(nairaInUsd)})
                    </span>
                  </div>
                </div>
              )}

              {/* Tap hint */}
              {!showBreakdown && (nairaBalance > 0 || dollarBalance > 0) && (
                <p className="text-[11px] text-muted-foreground mt-2 text-center">
                  Tap to see breakdown
                </p>
              )}
            </>
          ) : (
            <span className="balance-hidden text-[36px] font-bold tracking-[8px]">
              • • • •
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletBalanceHeader;
