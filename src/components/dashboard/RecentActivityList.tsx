import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  RefreshCw,
  XCircle,
  Phone,
  Wifi,
  Zap,
  Tv,
  RotateCcw,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import type { WalletTransaction, WalletTransactionType } from '@/types/wallet';
import { WALLET_TRANSACTION_TYPE_LABELS } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface RecentActivityListProps {
  transactions: WalletTransaction[];
  onViewAll: () => void;
  onTransactionPress?: (transaction: WalletTransaction) => void;
  className?: string;
  maxItems?: number;
}

// Icon and color mapping for transaction types
const getTransactionIcon = (type: WalletTransactionType) => {
  switch (type) {
    case 'crypto_deposit':
    case 'naira_deposit':
      return { Icon: ArrowDownLeft, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'card_creation':
      return { Icon: CreditCard, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    case 'card_topup':
      return { Icon: Plus, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    case 'card_refund':
      return { Icon: RefreshCw, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'card_termination':
      return { Icon: XCircle, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    case 'airtime':
      return { Icon: Phone, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)' };
    case 'data':
      return { Icon: Wifi, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    case 'power':
      return { Icon: Zap, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    case 'tv_subscription':
      return { Icon: Tv, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)' };
    case 'currency_conversion':
      return { Icon: RefreshCw, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    case 'system_credit':
      return { Icon: ArrowDownLeft, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    case 'system_debit':
      return { Icon: ArrowUpRight, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    case 'reversal':
      return { Icon: RotateCcw, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    default:
      return { Icon: Receipt, color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
  }
};

export function RecentActivityList({
  transactions,
  onViewAll,
  onTransactionPress,
  className,
  maxItems = 5,
}: RecentActivityListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string, direction: string) => {
    const absAmount = Math.abs(amount);
    const symbol = currency === 'NGN' ? '₦' : '$';
    const formatted =
      currency === 'NGN'
        ? absAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })
        : absAmount.toFixed(2);

    const prefix = direction === 'credit' ? '+' : '-';
    return `${prefix}${symbol}${formatted}`;
  };

  const recentTransactions = transactions.slice(0, maxItems);

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-sm text-kaviBlue hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Transactions List */}
      {recentTransactions.length > 0 ? (
        <div className="divide-y divide-border">
          {recentTransactions.map((transaction) => {
            const { Icon, color, bgColor } = getTransactionIcon(transaction.type);
            const label =
              WALLET_TRANSACTION_TYPE_LABELS[transaction.type] || transaction.description;

            return (
              <button
                key={transaction.id}
                onClick={() => onTransactionPress?.(transaction)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
              >
                {/* Icon */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-semibold',
                      transaction.direction === 'credit' ? 'text-emerald-500' : 'text-destructive'
                    )}
                  >
                    {formatAmount(transaction.amount, transaction.currency, transaction.direction)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Receipt className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No Activity Yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recent transactions will appear here
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentActivityList;
