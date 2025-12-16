import { DollarSign } from 'lucide-react';
import { QUICK_AMOUNTS, MIN_DEPOSIT_AMOUNT } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  amount: string;
  onChange: (amount: string) => void;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  estimatedCrypto?: number;
  cryptoSymbol?: string;
  error?: string;
  className?: string;
}

export function AmountInput({
  amount,
  onChange,
  minAmount = MIN_DEPOSIT_AMOUNT,
  maxAmount,
  currency = 'USD',
  estimatedCrypto,
  cryptoSymbol,
  error,
  className,
}: AmountInputProps) {
  const handleQuickAmount = (value: number) => {
    onChange(value.toString());
  };

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount >= minAmount && (!maxAmount || numAmount <= maxAmount);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Amount ({currency})</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="number"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            min={minAmount}
            max={maxAmount}
            step="0.01"
            className={cn(
              'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
              error ? 'border-destructive' : 'border-border'
            )}
          />
        </div>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        {!error && minAmount && (
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum: ${minAmount.toFixed(2)} {currency}
          </p>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">Quick Select</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleQuickAmount(value)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                numAmount === value
                  ? 'border-kaviBlue bg-kaviBlue text-white'
                  : 'border-border bg-card text-foreground hover:border-kaviBlue hover:bg-kaviBlue/10'
              )}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Crypto Amount */}
      {estimatedCrypto !== undefined && cryptoSymbol && isValid && numAmount > 0 && (
        <div className="rounded-xl bg-accent/50 p-4">
          <p className="text-sm text-muted-foreground">You will send approximately:</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {estimatedCrypto.toFixed(8)} {cryptoSymbol}
          </p>
        </div>
      )}
    </div>
  );
}

export default AmountInput;
