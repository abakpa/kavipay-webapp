import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  X,
  Filter,
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
  Receipt,
  Loader2,
} from 'lucide-react';
import { getWalletTransactions } from '@/lib/api/wallet';
import type {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransactionDirection,
  WalletCurrency,
} from '@/types/wallet';
import { WALLET_TRANSACTION_TYPE_LABELS } from '@/types/wallet';
import { cn } from '@/lib/utils';

type TransactionCategory = 'all' | 'deposits' | 'cards' | 'utilities' | 'system';

const CATEGORY_TYPES: Record<Exclude<TransactionCategory, 'all'>, WalletTransactionType[]> = {
  deposits: ['crypto_deposit', 'naira_deposit'],
  cards: ['card_creation', 'card_topup', 'card_refund', 'card_termination'],
  utilities: ['airtime', 'data', 'power', 'tv_subscription'],
  system: ['system_credit', 'system_debit', 'reversal', 'currency_conversion'],
};

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

const getStatusColor = (status: WalletTransactionStatus) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-500' };
    case 'pending':
    case 'processing':
      return { bg: 'bg-amber-500/10', text: 'text-amber-500' };
    case 'failed':
      return { bg: 'bg-red-500/10', text: 'text-red-500' };
    case 'reversed':
      return { bg: 'bg-amber-500/10', text: 'text-amber-500' };
    default:
      return { bg: 'bg-gray-500/10', text: 'text-gray-500' };
  }
};

export function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters (server-side)
  const [selectedCurrency, setSelectedCurrency] = useState<WalletCurrency | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<WalletTransactionStatus | 'all'>('all');
  const [selectedDirection, setSelectedDirection] = useState<WalletTransactionDirection | 'all'>('all');

  // Filters (client-side)
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('all');

  const fetchTransactions = useCallback(async (
    pageNum: number,
    currency: WalletCurrency | 'all',
    status: WalletTransactionStatus | 'all',
    direction: WalletTransactionDirection | 'all'
  ) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params: Record<string, unknown> = {
        page: pageNum,
        limit: 20,
      };

      if (currency !== 'all') params.currency = currency;
      if (status !== 'all') params.status = status;
      if (direction !== 'all') params.direction = direction;

      const response = await getWalletTransactions(params);
      const newTransactions = response.transactions || [];

      if (pageNum === 1) {
        setTransactions(newTransactions);
      } else {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }

      setHasMore(response.pagination?.page < response.pagination?.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch and refetch when server-side filters change
  useEffect(() => {
    fetchTransactions(1, selectedCurrency, selectedStatus, selectedDirection);
  }, [fetchTransactions, selectedCurrency, selectedStatus, selectedDirection]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(page + 1, selectedCurrency, selectedStatus, selectedDirection);
    }
  };

  // Client-side filtering for category and search
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by category (client-side)
    if (selectedCategory !== 'all') {
      const categoryTypes = CATEGORY_TYPES[selectedCategory];
      filtered = filtered.filter((tx) => categoryTypes.includes(tx.type));
    }

    // Filter by search query (client-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) => {
        const label = WALLET_TRANSACTION_TYPE_LABELS[tx.type]?.toLowerCase() || '';
        const description = tx.description?.toLowerCase() || '';
        const reference = tx.reference?.toLowerCase() || '';
        return label.includes(query) || description.includes(query) || reference.includes(query);
      });
    }

    return filtered;
  }, [transactions, selectedCategory, searchQuery]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, WalletTransaction[]> = {};

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel: string;
      if (date.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedCurrency('all');
    setSelectedStatus('all');
    setSelectedDirection('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedCurrency !== 'all' ||
    selectedStatus !== 'all' ||
    selectedDirection !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {/* Category Filter (client-side) */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-kaviBlue focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="deposits">Deposits</option>
            <option value="cards">Cards</option>
            <option value="utilities">Utilities</option>
            <option value="system">System</option>
          </select>

          {/* Currency Filter (server-side) */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as WalletCurrency | 'all')}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-kaviBlue focus:outline-none"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
          </select>

          {/* Direction Filter (server-side) */}
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value as WalletTransactionDirection | 'all')}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-kaviBlue focus:outline-none"
          >
            <option value="all">All Directions</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          {/* Status Filter (server-side) */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as WalletTransactionStatus | 'all')}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-kaviBlue focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-full bg-kaviBlue/10 px-3 py-1.5 text-sm text-kaviBlue hover:bg-kaviBlue/20"
            >
              <Filter className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-12">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No Transactions Found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Your transactions will appear here'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-kaviBlue px-4 py-2 text-sm font-medium text-white hover:bg-kaviBlue/90"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([dateLabel, txs]) => (
              <div key={dateLabel}>
                <p className="mb-2 text-sm font-medium text-muted-foreground">{dateLabel}</p>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="divide-y divide-border">
                    {txs.map((tx) => {
                      const { Icon, color, bgColor } = getTransactionIcon(tx.type);
                      const statusColors = getStatusColor(tx.status);
                      const label = WALLET_TRANSACTION_TYPE_LABELS[tx.type] || tx.description;

                      return (
                        <button
                          key={tx.id}
                          onClick={() => navigate(`/transactions/${tx.id}`)}
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
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-foreground">{label}</p>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                  statusColors.bg,
                                  statusColors.text
                                )}
                              >
                                {tx.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatTime(tx.createdAt)}</p>
                          </div>

                          {/* Amount */}
                          <span
                            className={cn(
                              'font-semibold',
                              tx.direction === 'credit' ? 'text-emerald-500' : 'text-destructive'
                            )}
                          >
                            {formatAmount(tx.amount, tx.currency, tx.direction)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground hover:bg-accent/50 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionsPage;
