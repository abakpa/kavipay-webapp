import { Check } from 'lucide-react';
import type { CryptoCurrency } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  currencies: CryptoCurrency[];
  selectedCurrency: CryptoCurrency | null;
  onSelect: (currency: CryptoCurrency) => void;
  className?: string;
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
  className,
}: CurrencySelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-foreground">Select Cryptocurrency</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {currencies.map((currency) => {
          const isSelected = selectedCurrency?.id === currency.id;
          return (
            <button
              key={currency.id}
              type="button"
              onClick={() => onSelect(currency)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all',
                isSelected
                  ? 'border-kaviBlue bg-kaviBlue/10'
                  : 'border-border hover:border-kaviBlue/50 hover:bg-accent/50'
              )}
            >
              {isSelected && (
                <div className="absolute right-2 top-2">
                  <Check className="h-4 w-4 text-kaviBlue" />
                </div>
              )}
              <span className="text-2xl">{currency.logo}</span>
              <span className="text-sm font-semibold text-foreground">{currency.symbol}</span>
              {currency.network && (
                <span className="text-xs text-muted-foreground">{currency.network}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CurrencySelector;
