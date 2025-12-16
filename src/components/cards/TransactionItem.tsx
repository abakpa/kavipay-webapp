import {
  ShoppingCart,
  Utensils,
  Fuel,
  ShoppingBag,
  Plane,
  Heart,
  Zap,
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardTransaction, TransactionCategory, CardTransactionType } from '@/types/card';

interface TransactionItemProps {
  transaction: CardTransaction;
  onClick?: (transaction: CardTransaction) => void;
  className?: string;
}

// Get icon and color based on transaction type and category
const getTransactionIcon = (
  type?: CardTransactionType,
  category?: TransactionCategory
): { icon: React.ComponentType<{ className?: string }>; colorClass: string } => {
  // First check transaction type
  if (type === 'refund') {
    return { icon: RefreshCw, colorClass: 'text-emerald-500 bg-emerald-500/10' };
  }
  if (type === 'withdrawal') {
    return { icon: ArrowUpRight, colorClass: 'text-orange-500 bg-orange-500/10' };
  }
  if (type === 'fee') {
    return { icon: CreditCard, colorClass: 'text-purple-500 bg-purple-500/10' };
  }

  // Then check category for purchases
  switch (category) {
    case 'grocery':
      return { icon: ShoppingCart, colorClass: 'text-green-500 bg-green-500/10' };
    case 'restaurant':
      return { icon: Utensils, colorClass: 'text-orange-500 bg-orange-500/10' };
    case 'gas':
      return { icon: Fuel, colorClass: 'text-amber-500 bg-amber-500/10' };
    case 'shopping':
      return { icon: ShoppingBag, colorClass: 'text-pink-500 bg-pink-500/10' };
    case 'entertainment':
      return { icon: MoreHorizontal, colorClass: 'text-purple-500 bg-purple-500/10' };
    case 'travel':
      return { icon: Plane, colorClass: 'text-blue-500 bg-blue-500/10' };
    case 'healthcare':
      return { icon: Heart, colorClass: 'text-red-500 bg-red-500/10' };
    case 'utilities':
      return { icon: Zap, colorClass: 'text-yellow-500 bg-yellow-500/10' };
    default:
      return { icon: ArrowDownLeft, colorClass: 'text-kaviBlue bg-kaviBlue/10' };
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

// Get status color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'text-emerald-500';
    case 'pending':
      return 'text-amber-500';
    case 'failed':
    case 'fail':
    case 'cancelled':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

// Format date for display
const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

// Determine if amount is positive (incoming) or negative (outgoing)
const isIncomingTransaction = (type?: CardTransactionType): boolean => {
  return type === 'refund';
};

export function TransactionItem({ transaction, onClick, className }: TransactionItemProps) {
  const { icon: Icon, colorClass } = getTransactionIcon(
    transaction.type,
    transaction.merchantCategory
  );
  const isIncoming = isIncomingTransaction(transaction.type);
  const statusColor = getStatusColor(transaction.status);

  const displayName =
    transaction.merchantName || getTransactionTypeLabel(transaction.type);

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
        'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-foreground">{displayName}</p>
          <p
            className={cn(
              'flex-shrink-0 font-semibold',
              isIncoming ? 'text-emerald-500' : 'text-foreground'
            )}
          >
            {isIncoming ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </p>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {getTransactionTypeLabel(transaction.type)}
            {transaction.location && ` • ${transaction.location}`}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className={statusColor}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
            <span className="text-muted-foreground">
              {formatTransactionDate(transaction.date)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default TransactionItem;
