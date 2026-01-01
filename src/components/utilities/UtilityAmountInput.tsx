import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UtilityAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  currency?: string;
  quickAmounts?: number[];
  minAmount?: number;
  maxAmount?: number;
  error?: string;
  className?: string;
}

export function UtilityAmountInput({
  value,
  onChange,
  label = 'Amount',
  placeholder = 'Enter amount',
  currency = '₦',
  quickAmounts = [500, 1000, 2000, 5000],
  minAmount,
  maxAmount,
  error,
  className,
}: UtilityAmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleQuickAmountClick = (amount: number) => {
    onChange(amount.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const numericValue = parseInt(value, 10) || 0;
  const isValid =
    (!minAmount || numericValue >= minAmount) &&
    (!maxAmount || numericValue <= maxAmount);

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 transition-colors',
          isFocused && 'ring-2 ring-kaviBlue border-kaviBlue',
          error && 'border-destructive ring-destructive',
          !isFocused && !error && 'border-input'
        )}
      >
        <span className="text-lg font-semibold text-muted-foreground">
          {currency}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {minAmount && (
        <p className="text-xs text-muted-foreground">
          Minimum amount: {currency}
          {minAmount.toLocaleString()}
        </p>
      )}

      {quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickAmountClick(amount)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                numericValue === amount
                  ? 'border-kaviBlue bg-kaviBlue/10 text-kaviBlue'
                  : 'border-border bg-card text-foreground hover:border-kaviBlue/50 hover:bg-accent/50'
              )}
            >
              {currency}
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UtilityAmountInput;
