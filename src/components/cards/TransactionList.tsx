import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp, Activity, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CardTransaction,
  TransactionCategory,
  TransactionStatus,
  CardTransactionType,
} from '@/types/card';
import { TransactionItem } from './TransactionItem';
import { TransactionFilters } from './TransactionFilters';

interface TransactionListProps {
  transactions: CardTransaction[];
  onTransactionClick?: (transaction: CardTransaction) => void;
  showFilters?: boolean;
  showSummary?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Group transactions by date
interface GroupedTransactions {
  [key: string]: CardTransaction[];
}

const getDateGroupKey = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const transactionDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (transactionDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (transactionDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// Deduplicate transactions by ID
const deduplicateTransactions = (transactions: CardTransaction[]): CardTransaction[] => {
  const seen = new Set<string>();
  return transactions.filter((tx) => {
    if (seen.has(tx.id)) {
      return false;
    }
    seen.add(tx.id);
    return true;
  });
};

export function TransactionList({
  transactions,
  onTransactionClick,
  showFilters = true,
  showSummary = true,
  emptyMessage = 'No transactions found',
  className,
}: TransactionListProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<CardTransactionType | 'all'>('all');

  // Filter and deduplicate transactions
  const filteredTransactions = useMemo(() => {
    let result = deduplicateTransactions(transactions);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.merchantName?.toLowerCase().includes(query) ||
          tx.description?.toLowerCase().includes(query) ||
          tx.id.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((tx) => tx.merchantCategory === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((tx) => tx.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((tx) => tx.type === selectedType);
    }

    // Sort by date (newest first)
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, searchQuery, selectedCategory, selectedStatus, selectedType]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const successfulTransactions = filteredTransactions.filter(
      (tx) => tx.status === 'success' || tx.status === 'completed'
    );

    const totalSpent = successfulTransactions
      .filter((tx) => tx.type !== 'refund')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const totalReceived = successfulTransactions
      .filter((tx) => tx.type === 'refund')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      totalSpent,
      totalReceived,
      netChange: totalReceived - totalSpent,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: GroupedTransactions = {};

    filteredTransactions.forEach((tx) => {
      const key = getDateGroupKey(tx.date);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const groupKeys = Object.keys(groupedTransactions);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      )}

      {/* Summary Stats */}
      {showSummary && filteredTransactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs">Spent</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              ${summary.totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs">Received</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              ${summary.totalReceived.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4 text-kaviBlue" />
              <span className="text-xs">Net</span>
            </div>
            <p
              className={cn(
                'text-lg font-bold',
                summary.netChange >= 0 ? 'text-emerald-500' : 'text-destructive'
              )}
            >
              {summary.netChange >= 0 ? '+' : ''}${summary.netChange.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4 text-purple-500" />
              <span className="text-xs">Transactions</span>
            </div>
            <p className="text-lg font-bold text-foreground">{summary.count}</p>
          </div>
        </div>
      )}

      {/* Transaction Groups */}
      {groupKeys.length > 0 ? (
        <div className="space-y-4">
          {groupKeys.map((groupKey) => (
            <div key={groupKey}>
              {/* Date Header */}
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{groupKey}</h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {groupedTransactions[groupKey].length} transaction
                  {groupedTransactions[groupKey].length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Transactions */}
              <div className="rounded-2xl border border-border bg-card">
                {groupedTransactions[groupKey].map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionItem
                      transaction={transaction}
                      onClick={onTransactionClick}
                    />
                    {index < groupedTransactions[groupKey].length - 1 && (
                      <div className="mx-3 border-b border-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
              ? 'No matching transactions'
              : emptyMessage}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your filters to see more results'
              : 'Transactions will appear here once you start using your card'}
          </p>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
