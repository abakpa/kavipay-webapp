import { useState, useMemo } from 'react';
import { Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import type { CryptoCurrency } from '@/types/wallet';
import type { CryptoCurrencyListItem, GroupedCurrency } from '@/types/deposit';
import { cn } from '@/lib/utils';

interface CurrencySelectorProps {
  currencies: CryptoCurrency[];
  selectedCurrency: CryptoCurrency | null;
  onSelect: (currency: CryptoCurrency) => void;
  className?: string;
}

// Top currencies to show in grid (before expansion)
const TOP_CURRENCY_SYMBOLS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB', 'TON', 'TRX'];
const INITIAL_DISPLAY_COUNT = 8;

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
  className,
}: CurrencySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get top currencies for initial grid display
  const topCurrencies = useMemo(() => {
    const top: CryptoCurrency[] = [];
    for (const symbol of TOP_CURRENCY_SYMBOLS) {
      const currency = currencies.find((c) => c.symbol.toUpperCase() === symbol);
      if (currency) {
        top.push(currency);
      }
    }
    // If we don't have enough top currencies, fill with others
    if (top.length < INITIAL_DISPLAY_COUNT) {
      for (const currency of currencies) {
        if (!top.includes(currency) && top.length < INITIAL_DISPLAY_COUNT) {
          top.push(currency);
        }
      }
    }
    return top;
  }, [currencies]);

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return currencies;
    }
    const query = searchQuery.toLowerCase();
    return currencies.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.symbol.toLowerCase().includes(query) ||
        c.network?.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  // Currencies to display based on expansion state
  const displayCurrencies = isExpanded ? filteredCurrencies : topCurrencies;

  const renderCurrencyButton = (currency: CryptoCurrency) => {
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
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label className="block text-sm font-medium text-foreground">Select Cryptocurrency</label>

      {/* Currency Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {displayCurrencies.map(renderCurrencyButton)}
      </div>

      {/* Show All / Collapse Button */}
      {currencies.length > INITIAL_DISPLAY_COUNT && (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
              setSearchQuery('');
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-kaviBlue hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show All ({currencies.length} currencies)
            </>
          )}
        </button>
      )}

      {/* Search Input (only when expanded) */}
      {isExpanded && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search currency..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
          />
        </div>
      )}

      {/* No Results */}
      {isExpanded && searchQuery && filteredCurrencies.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No currencies found for "{searchQuery}"
        </p>
      )}
    </div>
  );
}

// Enhanced Currency Selector with Network Selection Support
interface EnhancedCurrencySelectorProps {
  currencies: CryptoCurrencyListItem[];
  selectedCurrency: CryptoCurrencyListItem | null;
  onSelect: (currency: CryptoCurrencyListItem) => void;
  onNetworkSelect?: (currencies: CryptoCurrencyListItem[]) => void;
  className?: string;
}

// Group currencies by symbol for network selection
function groupCurrenciesBySymbol(
  currencies: CryptoCurrencyListItem[]
): Map<string, CryptoCurrencyListItem[]> {
  const groups = new Map<string, CryptoCurrencyListItem[]>();
  for (const currency of currencies) {
    const existing = groups.get(currency.symbol) || [];
    existing.push(currency);
    groups.set(currency.symbol, existing);
  }
  return groups;
}

export function EnhancedCurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
  onNetworkSelect,
  className,
}: EnhancedCurrencySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group currencies by symbol
  const groupedCurrencies = useMemo(() => groupCurrenciesBySymbol(currencies), [currencies]);

  // Get unique symbols for display
  const uniqueSymbols = useMemo(() => {
    const symbols = Array.from(groupedCurrencies.keys());
    // Sort with top currencies first
    return symbols.sort((a, b) => {
      const aIndex = TOP_CURRENCY_SYMBOLS.indexOf(a);
      const bIndex = TOP_CURRENCY_SYMBOLS.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedCurrencies]);

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    if (!searchQuery.trim()) {
      return uniqueSymbols;
    }
    const query = searchQuery.toLowerCase();
    return uniqueSymbols.filter((symbol) => {
      const currenciesForSymbol = groupedCurrencies.get(symbol) || [];
      return currenciesForSymbol.some(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.symbol.toLowerCase().includes(query) ||
          c.network.toLowerCase().includes(query) ||
          c.networkName.toLowerCase().includes(query)
      );
    });
  }, [uniqueSymbols, groupedCurrencies, searchQuery]);

  // Symbols to display
  const displaySymbols = isExpanded
    ? filteredSymbols
    : filteredSymbols.slice(0, INITIAL_DISPLAY_COUNT);

  const handleCurrencyClick = (symbol: string) => {
    const currenciesForSymbol = groupedCurrencies.get(symbol) || [];
    if (currenciesForSymbol.length === 1) {
      // Only one network, select directly
      onSelect(currenciesForSymbol[0]);
    } else if (currenciesForSymbol.length > 1 && onNetworkSelect) {
      // Multiple networks, trigger network selection
      onNetworkSelect(currenciesForSymbol);
    } else {
      // Default to first network
      onSelect(currenciesForSymbol[0]);
    }
  };

  const renderCurrencyButton = (symbol: string) => {
    const currenciesForSymbol = groupedCurrencies.get(symbol) || [];
    const firstCurrency = currenciesForSymbol[0];
    const hasMultipleNetworks = currenciesForSymbol.length > 1;
    const isSelected = selectedCurrency?.symbol === symbol;

    return (
      <button
        key={symbol}
        type="button"
        onClick={() => handleCurrencyClick(symbol)}
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
        <span className="text-2xl">{firstCurrency.logo}</span>
        <span className="text-sm font-semibold text-foreground">{symbol}</span>
        {isSelected && selectedCurrency?.networkName ? (
          <span className="text-xs text-kaviBlue">{selectedCurrency.networkName}</span>
        ) : hasMultipleNetworks ? (
          <span className="text-xs text-muted-foreground">
            {currenciesForSymbol.length} networks
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{firstCurrency.networkName}</span>
        )}
      </button>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <label className="block text-sm font-medium text-foreground">Select Cryptocurrency</label>

      {/* Currency Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {displaySymbols.map(renderCurrencyButton)}
      </div>

      {/* Show All / Collapse Button */}
      {uniqueSymbols.length > INITIAL_DISPLAY_COUNT && (
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded) {
              setSearchQuery('');
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-kaviBlue hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show All ({uniqueSymbols.length} currencies)
            </>
          )}
        </button>
      )}

      {/* Search Input (only when expanded) */}
      {isExpanded && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search currency or network..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
          />
        </div>
      )}

      {/* No Results */}
      {isExpanded && searchQuery && filteredSymbols.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No currencies found for "{searchQuery}"
        </p>
      )}
    </div>
  );
}

export default CurrencySelector;
