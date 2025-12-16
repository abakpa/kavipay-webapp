import {
  X,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  Receipt,
  Calendar,
  Hash,
  DollarSign,
  ShoppingCart,
  Utensils,
  Fuel,
  ShoppingBag,
  Plane,
  Heart,
  Zap,
  MoreHorizontal,
  ArrowDownLeft,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { CardTransaction, TransactionCategory, CardTransactionType } from '@/types/card';

interface TransactionDetailProps {
  transaction: CardTransaction;
  isOpen: boolean;
  onClose: () => void;
}

// Get icon based on transaction type and category
const getTransactionIcon = (
  type?: CardTransactionType,
  category?: TransactionCategory
): React.ComponentType<{ className?: string }> => {
  if (type === 'refund') return RefreshCw;
  if (type === 'withdrawal') return ArrowUpRight;
  if (type === 'fee') return CreditCard;

  switch (category) {
    case 'grocery':
      return ShoppingCart;
    case 'restaurant':
      return Utensils;
    case 'gas':
      return Fuel;
    case 'shopping':
      return ShoppingBag;
    case 'entertainment':
      return MoreHorizontal;
    case 'travel':
      return Plane;
    case 'healthcare':
      return Heart;
    case 'utilities':
      return Zap;
    default:
      return ArrowDownLeft;
  }
};

// Get transaction type label
const getTransactionTypeLabel = (type?: CardTransactionType): string => {
  switch (type) {
    case 'purchase':
      return 'Purchase';
    case 'refund':
      return 'Refund';
    case 'withdrawal':
      return 'Withdrawal';
    case 'fee':
      return 'Fee';
    default:
      return 'Transaction';
  }
};

// Get category label
const getCategoryLabel = (category?: TransactionCategory): string => {
  if (!category) return 'Other';
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Get status info
const getStatusInfo = (
  status: string
): { icon: React.ComponentType<{ className?: string }>; color: string; label: string } => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return {
        icon: CheckCircle,
        color: 'text-emerald-500 bg-emerald-500/10',
        label: 'Completed',
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-amber-500 bg-amber-500/10',
        label: 'Pending',
      };
    case 'failed':
    case 'fail':
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-destructive bg-destructive/10',
        label: 'Failed',
      };
    default:
      return {
        icon: Clock,
        color: 'text-muted-foreground bg-accent',
        label: status,
      };
  }
};

// Format full date
const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

// Determine if amount is positive (incoming) or negative (outgoing)
const isIncomingTransaction = (type?: CardTransactionType): boolean => {
  return type === 'refund';
};

export function TransactionDetail({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const Icon = getTransactionIcon(transaction.type, transaction.merchantCategory);
  const statusInfo = getStatusInfo(transaction.status);
  const StatusIcon = statusInfo.icon;
  const isIncoming = isIncomingTransaction(transaction.type);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Clipboard copy failed
    }
  };

  const displayName =
    transaction.merchantName || getTransactionTypeLabel(transaction.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Transaction Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Amount Hero Card */}
          <div
            className={cn(
              'mb-6 rounded-2xl p-6 text-center',
              isIncoming ? 'bg-emerald-500/10' : 'bg-kaviBlue/10'
            )}
          >
            <div
              className={cn(
                'mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full',
                isIncoming ? 'bg-emerald-500/20' : 'bg-kaviBlue/20'
              )}
            >
              <Icon
                className={cn(
                  'h-7 w-7',
                  isIncoming ? 'text-emerald-500' : 'text-kaviBlue'
                )}
              />
            </div>

            <p
              className={cn(
                'text-3xl font-bold',
                isIncoming ? 'text-emerald-500' : 'text-foreground'
              )}
            >
              {isIncoming ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{transaction.currency}</p>

            {/* Status Badge */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5',
                  statusInfo.color
                )}
              >
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Merchant Info */}
          <div className="mb-4 rounded-xl border border-border bg-accent/30 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Merchant
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card">
                <Icon className="h-5 w-5 text-kaviBlue" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{displayName}</p>
                {transaction.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{transaction.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>

            {/* Type */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="h-4 w-4" />
                <span className="text-sm">Type</span>
              </div>
              <span className="font-medium text-foreground">
                {getTransactionTypeLabel(transaction.type)}
              </span>
            </div>

            {/* Category */}
            {transaction.merchantCategory && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">Category</span>
                </div>
                <span className="font-medium text-foreground">
                  {getCategoryLabel(transaction.merchantCategory)}
                </span>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Date</span>
              </div>
              <span className="text-right font-medium text-foreground">
                {formatFullDate(transaction.date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Time</span>
              </div>
              <span className="font-medium text-foreground">
                {formatTime(transaction.date)}
              </span>
            </div>

            {/* Fee (if present) */}
            {transaction.fee > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Fee</span>
                </div>
                <span className="font-medium text-foreground">
                  ${transaction.fee.toFixed(2)}
                </span>
              </div>
            )}

            {/* Card */}
            {transaction.cardId && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Card</span>
                </div>
                <span className="font-mono text-sm font-medium text-foreground">
                  •••• {transaction.cardId.slice(-4)}
                </span>
              </div>
            )}

            {/* Description */}
            {transaction.description && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm">Description</span>
                </div>
                <p className="text-sm text-foreground">{transaction.description}</p>
              </div>
            )}

            {/* Transaction ID */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm">Transaction ID</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-kaviBlue hover:bg-kaviBlue/10"
                >
                  {copiedId ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="break-all font-mono text-xs text-foreground">
                {transaction.id}
              </p>
            </div>

            {/* Reference (if present) */}
            {transaction.ref && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm">Reference</span>
                </div>
                <p className="break-all font-mono text-xs text-foreground">
                  {transaction.ref}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;
