import { Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CryptoCurrencyListItem } from '@/types/deposit';
import { cn } from '@/lib/utils';

interface NetworkSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  networks: CryptoCurrencyListItem[];
  selectedNetwork: CryptoCurrencyListItem | null;
  onSelect: (network: CryptoCurrencyListItem) => void;
  className?: string;
}

export function NetworkSelector({
  isOpen,
  onClose,
  currencySymbol,
  networks,
  selectedNetwork,
  onSelect,
  className,
}: NetworkSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-t-2xl bg-card p-6 sm:rounded-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Select Network</h3>
            <p className="text-sm text-muted-foreground">
              Choose a network for {currencySymbol}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-500/10 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-600">
            Please ensure you select the correct network. Sending {currencySymbol} via the
            wrong network may result in permanent loss of funds.
          </p>
        </div>

        {/* Network Options */}
        <div className="space-y-2">
          {networks.map((network) => {
            const isSelected = selectedNetwork?.id === network.id;
            return (
              <button
                key={network.id}
                onClick={() => {
                  onSelect(network);
                  onClose();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-kaviBlue bg-kaviBlue/10'
                    : 'border-border hover:border-kaviBlue/50 hover:bg-accent/50'
                )}
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{network.networkName}</p>
                  <p className="text-xs text-muted-foreground">
                    Min: {network.minAmount} {network.symbol}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-kaviBlue">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Cancel Button */}
        <Button variant="outline" className="mt-4 w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default NetworkSelector;
