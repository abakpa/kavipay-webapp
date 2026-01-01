import { Wallet, Bitcoin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/utilities';

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

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  walletBalance?: number;
  requiredAmount?: number;
  label?: string;
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  walletBalance,
  requiredAmount,
  label = 'Payment Method',
  className,
}: PaymentMethodSelectorProps) {
  const hasInsufficientBalance =
    walletBalance !== undefined &&
    requiredAmount !== undefined &&
    walletBalance < requiredAmount;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isDisabled =
            method.id === 'wallet' && hasInsufficientBalance;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !isDisabled && onSelect(method.id)}
              disabled={isDisabled}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all',
                isSelected
                  ? 'border-kaviBlue bg-kaviBlue/10 ring-1 ring-kaviBlue'
                  : 'border-border bg-card hover:border-kaviBlue/50 hover:bg-accent/50',
                isDisabled && 'opacity-50 cursor-not-allowed hover:bg-card hover:border-border'
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
                {method.id === 'wallet' && hasInsufficientBalance && (
                  <span className="block text-xs text-destructive mt-1">
                    Insufficient balance
                  </span>
                )}
              </div>

              {isSelected && <Check className="h-5 w-5 text-kaviBlue" />}
            </button>
          );
        })}
      </div>

      {walletBalance !== undefined && (
        <p className="text-xs text-muted-foreground">
          Wallet Balance: ${walletBalance.toFixed(2)} USDT
        </p>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
