import { useState, useEffect, useMemo } from 'react';
import { Wallet, Bitcoin, Check, Loader2, X, ChevronRight, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/utilities';
import { getCryptoCurrencies } from '@/lib/api/deposit';
import { getNairaExchangeRate } from '@/lib/api/deposit';
import type { CryptoCurrencyListItem } from '@/types/deposit';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'wallet',
    name: 'Pay with Wallet',
    description: 'Use your wallet balance',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: 'crypto',
    name: 'Pay with Crypto',
    description: 'Pay using cryptocurrency',
    icon: <Bitcoin className="h-5 w-5" />,
  },
];

// Top currencies to show in the grid
const TOP_CURRENCY_SYMBOLS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB', 'TON', 'TRX'];

// Group currencies by symbol
interface GroupedCurrency {
  symbol: string;
  name: string;
  logo: string;
  networks: CryptoCurrencyListItem[];
}

function groupCurrenciesBySymbol(currencies: CryptoCurrencyListItem[]): GroupedCurrency[] {
  const groups = new Map<string, GroupedCurrency>();

  for (const currency of currencies) {
    const existing = groups.get(currency.symbol);
    if (existing) {
      existing.networks.push(currency);
    } else {
      groups.set(currency.symbol, {
        symbol: currency.symbol,
        name: currency.name,
        logo: currency.logo,
        networks: [currency],
      });
    }
  }

  // Sort with top currencies first
  const result = Array.from(groups.values()).sort((a, b) => {
    const aIndex = TOP_CURRENCY_SYMBOLS.indexOf(a.symbol);
    const bIndex = TOP_CURRENCY_SYMBOLS.indexOf(b.symbol);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return result;
}

export interface CryptoSelection {
  currency: string;
  network: string;
  networkName: string;
}

export type WalletCurrency = 'USD' | 'NGN';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  // Wallet balances
  dollarBalance?: number;
  nairaBalance?: number;
  // Amount in Naira (for calculating USD equivalent)
  amountInNaira?: number;
  label?: string;
  className?: string;
  // Crypto selection props
  selectedCrypto?: CryptoSelection | null;
  onCryptoSelect?: (crypto: CryptoSelection) => void;
  // Wallet currency selection props
  selectedWalletCurrency?: WalletCurrency | null;
  onWalletCurrencySelect?: (currency: WalletCurrency) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  dollarBalance = 0,
  nairaBalance = 0,
  amountInNaira = 0,
  label = 'Payment Method',
  className,
  selectedCrypto,
  onCryptoSelect,
  selectedWalletCurrency,
  onWalletCurrencySelect,
}: PaymentMethodSelectorProps) {
  const [currencies, setCurrencies] = useState<CryptoCurrencyListItem[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [selectedBase, setSelectedBase] = useState<GroupedCurrency | null>(null);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rateData = await getNairaExchangeRate();
        setExchangeRate(rateData.rate);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Fallback rate
        setExchangeRate(1600);
      }
    };
    fetchExchangeRate();
  }, []);

  // Calculate USD equivalent of NGN amount
  const amountInUsd = exchangeRate ? amountInNaira / exchangeRate : null;

  // Check if wallets have sufficient balance
  const hasInsufficientUsdBalance = amountInUsd !== null && dollarBalance < amountInUsd;
  const hasInsufficientNgnBalance = nairaBalance < amountInNaira;

  // Fetch currencies when crypto is selected
  useEffect(() => {
    if (selectedMethod === 'crypto' && currencies.length === 0) {
      const fetchCurrencies = async () => {
        setLoadingCurrencies(true);
        try {
          const data = await getCryptoCurrencies();
          setCurrencies(data);
        } catch (err) {
          console.error('Failed to load currencies:', err);
        } finally {
          setLoadingCurrencies(false);
        }
      };
      fetchCurrencies();
    }
  }, [selectedMethod, currencies.length]);

  // Group currencies by symbol
  const groupedCurrencies = useMemo(() => groupCurrenciesBySymbol(currencies), [currencies]);

  // Get top currencies for display
  const topCurrencies = useMemo(() => groupedCurrencies.slice(0, 8), [groupedCurrencies]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    onSelect(method);
    if (method === 'wallet') {
      // Clear crypto selections when wallet is selected
      setSelectedBase(null);
      onCryptoSelect?.(null as unknown as CryptoSelection);
    } else if (method === 'crypto') {
      // Clear wallet currency selection when crypto is selected
      onWalletCurrencySelect?.(null as unknown as WalletCurrency);
    }
  };

  const handleCurrencySelect = (grouped: GroupedCurrency) => {
    setSelectedBase(grouped);
    if (grouped.networks.length === 1) {
      // Single network - select directly
      const network = grouped.networks[0];
      onCryptoSelect?.({
        currency: network.currency,
        network: network.network,
        networkName: network.networkName,
      });
    } else {
      // Multiple networks - show picker
      setShowNetworkPicker(true);
    }
  };

  const handleNetworkSelect = (network: CryptoCurrencyListItem) => {
    onCryptoSelect?.({
      currency: network.currency,
      network: network.network,
      networkName: network.networkName,
    });
    setShowNetworkPicker(false);
  };

  const handleClearCryptoSelection = () => {
    setSelectedBase(null);
    onCryptoSelect?.(null as unknown as CryptoSelection);
  };

  const formatUsd = (amount: number) => `$${amount.toFixed(2)}`;
  const formatNgn = (amount: number) => `₦${amount.toLocaleString()}`;

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handlePaymentMethodSelect(method.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? 'bg-kaviBlue text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {method.icon}
              </div>

              <div className="flex-1">
                <span className="block text-sm font-medium text-foreground">
                  {method.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {method.description}
                </span>
              </div>

              {isSelected && <Check className="h-5 w-5 text-kaviBlue" />}
            </button>
          );
        })}
      </div>

      {/* Wallet Currency Selection - shown when wallet is selected */}
      {selectedMethod === 'wallet' && (
        <div className="space-y-4 pt-2">
          <label className="block text-sm font-medium text-foreground">
            Pay with
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* USD Wallet Option */}
            <button
              type="button"
              onClick={() => !hasInsufficientUsdBalance && onWalletCurrencySelect?.('USD')}
              disabled={hasInsufficientUsdBalance}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all',
                selectedWalletCurrency === 'USD'
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50',
                hasInsufficientUsdBalance && 'opacity-50 cursor-not-allowed hover:bg-card hover:border-border'
              )}
            >
              {selectedWalletCurrency === 'USD' && (
                <div className="absolute right-2 top-2">
                  <Check className="h-4 w-4 text-kaviBlue" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">USD Wallet</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {formatUsd(dollarBalance)}
              </span>
              {amountInUsd !== null && (
                <span className="text-xs text-muted-foreground">
                  Cost: {formatUsd(amountInUsd)}
                </span>
              )}
              {hasInsufficientUsdBalance && (
                <span className="text-xs text-destructive mt-1">
                  Insufficient balance
                </span>
              )}
            </button>

            {/* NGN Wallet Option */}
            <button
              type="button"
              onClick={() => !hasInsufficientNgnBalance && onWalletCurrencySelect?.('NGN')}
              disabled={hasInsufficientNgnBalance}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all',
                selectedWalletCurrency === 'NGN'
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50',
                hasInsufficientNgnBalance && 'opacity-50 cursor-not-allowed hover:bg-card hover:border-border'
              )}
            >
              {selectedWalletCurrency === 'NGN' && (
                <div className="absolute right-2 top-2">
                  <Check className="h-4 w-4 text-kaviBlue" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-500">₦</span>
                <span className="text-sm font-semibold text-foreground">NGN Wallet</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {formatNgn(nairaBalance)}
              </span>
              <span className="text-xs text-muted-foreground">
                Cost: {formatNgn(amountInNaira)}
              </span>
              {hasInsufficientNgnBalance && (
                <span className="text-xs text-destructive mt-1">
                  Insufficient balance
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Crypto Currency Selection - shown when crypto is selected */}
      {selectedMethod === 'crypto' && (
        <div className="space-y-4 pt-2">
          <label className="block text-sm font-medium text-foreground">
            Select Cryptocurrency
          </label>

          {loadingCurrencies ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-kaviBlue" />
              <span className="ml-2 text-sm text-muted-foreground">Loading currencies...</span>
            </div>
          ) : selectedCrypto && selectedBase ? (
            // Show selected currency
            <div className="flex items-center justify-between rounded-xl border border-kaviBlue bg-kaviBlue/10 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedBase.logo}</span>
                <div>
                  <p className="font-semibold text-foreground">{selectedBase.symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    on {selectedCrypto.networkName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearCryptoSelection}
                className="rounded-lg bg-kaviBlue px-3 py-1.5 text-sm font-medium text-white hover:bg-kaviBlue/90 transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            // Show currency grid
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {topCurrencies.map((currency) => {
                const isSelected = selectedBase?.symbol === currency.symbol;
                const hasMultipleNetworks = currency.networks.length > 1;

                return (
                  <button
                    key={currency.symbol}
                    type="button"
                    onClick={() => handleCurrencySelect(currency)}
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
                    {hasMultipleNetworks ? (
                      <span className="text-xs text-muted-foreground">
                        {currency.networks.length} networks
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {currency.networks[0]?.networkName}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Network Picker Modal */}
      {showNetworkPicker && selectedBase && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setShowNetworkPicker(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-card sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold text-foreground">
                Select Network for {selectedBase.symbol}
              </h3>
              <button
                type="button"
                onClick={() => setShowNetworkPicker(false)}
                className="rounded-lg p-1 hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {selectedBase.networks.map((network) => (
                <button
                  key={network.id}
                  type="button"
                  onClick={() => handleNetworkSelect(network)}
                  className="flex w-full items-center justify-between rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{network.networkName}</p>
                    <p className="text-sm text-muted-foreground">{network.network.toUpperCase()}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
