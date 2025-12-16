import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  quickAmounts?: number[];
  className?: string;
}

export function AmountInput({
  value,
  onChange,
  currency = 'USD',
  placeholder = '0.00',
  error,
  disabled = false,
  quickAmounts = [25, 50, 100, 200],
  className,
}: AmountInputProps) {
  const handleChange = (inputValue: string) => {
    // Only allow numbers and decimal point
    const cleanValue = inputValue.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    onChange(cleanValue);
  };

  const handleQuickAmount = (amount: number) => {
    onChange(amount.toString());
  };

  const getCurrencySymbol = () => {
    switch (currency.toUpperCase()) {
      case 'USD':
        return '$';
      case 'NGN':
        return '₦';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '$';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Amount Input Field */}
      <div
        className={cn(
          'flex items-center rounded-xl border bg-card px-4',
          error
            ? 'border-destructive'
            : 'border-border focus-within:border-kaviBlue focus-within:ring-2 focus-within:ring-kaviBlue/20',
          disabled && 'opacity-50'
        )}
      >
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent px-2 py-4 text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          maxLength={10}
        />
        <span className="text-sm font-medium text-muted-foreground">{currency}</span>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Quick Amount Buttons */}
      {quickAmounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickAmount(amount)}
              disabled={disabled}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                value === amount.toString()
                  ? 'bg-kaviBlue text-white'
                  : 'bg-accent text-foreground hover:bg-kaviBlue/20',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {getCurrencySymbol()}
              {amount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AmountInput;
