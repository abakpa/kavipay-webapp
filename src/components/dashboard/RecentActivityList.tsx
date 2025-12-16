import { ShoppingBag, ChevronRight, Receipt } from 'lucide-react';
import type { CardTransaction } from '@/types/card';
import { cn } from '@/lib/utils';

interface RecentActivityListProps {
  transactions: CardTransaction[];
  onViewAll: () => void;
  onTransactionPress?: (transaction: CardTransaction) => void;
  className?: string;
  maxItems?: number;
}

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

  const formatAmount = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return amount < 0 ? `-${formatted}` : `+${formatted}`;
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
          {recentTransactions.map((transaction) => (
            <button
              key={transaction.id}
              onClick={() => onTransactionPress?.(transaction)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {transaction.merchantName || transaction.description}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-semibold',
                    transaction.amount < 0 ? 'text-destructive' : 'text-emerald-500'
                  )}
                >
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
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
