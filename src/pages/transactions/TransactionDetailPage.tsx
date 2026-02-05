import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
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
  Copy,
  Check,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getWalletTransactionById } from '@/lib/api/wallet';
import type { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '@/types/wallet';
import { WALLET_TRANSACTION_TYPE_LABELS } from '@/types/wallet';
import { cn } from '@/lib/utils';

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

const getStatusIcon = (status: WalletTransactionStatus) => {
  switch (status) {
    case 'completed':
      return { Icon: CheckCircle, color: '#10B981' };
    case 'pending':
    case 'processing':
      return { Icon: Clock, color: '#F59E0B' };
    case 'failed':
      return { Icon: AlertCircle, color: '#EF4444' };
    case 'reversed':
      return { Icon: RotateCcw, color: '#F59E0B' };
    default:
      return { Icon: Clock, color: '#6B7280' };
  }
};

const getStatusColors = (status: WalletTransactionStatus) => {
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

export function TransactionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const tx = await getWalletTransactionById(id);
        setTransaction(tx);
      } catch (err) {
        console.error('Failed to fetch transaction:', err);
        setError('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    const formatted =
      currency === 'NGN'
        ? amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })
        : amount.toFixed(2);
    return `${symbol}${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Transaction Details</h1>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-12">
            <AlertCircle className="mb-3 h-12 w-12 text-destructive" />
            <p className="font-medium text-foreground">Failed to Load Transaction</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 rounded-lg bg-kaviBlue px-4 py-2 text-sm font-medium text-white hover:bg-kaviBlue/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { Icon, color, bgColor } = getTransactionIcon(transaction.type);
  const { Icon: StatusIcon, color: statusIconColor } = getStatusIcon(transaction.status);
  const statusColors = getStatusColors(transaction.status);
  const label = WALLET_TRANSACTION_TYPE_LABELS[transaction.type] || transaction.description || 'Transaction';

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
          <h1 className="text-2xl font-bold text-foreground">Transaction Details</h1>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header Section */}
          <div className="flex flex-col items-center border-b border-border px-6 py-6">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: bgColor }}
            >
              <Icon className="h-8 w-8" style={{ color }} />
            </div>
            <p className="text-lg font-semibold text-foreground">{label}</p>
            <p
              className={cn(
                'mt-2 text-3xl font-bold',
                transaction.direction === 'credit' ? 'text-emerald-500' : 'text-destructive'
              )}
            >
              {transaction.direction === 'credit' ? '+' : '-'}
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
            <div
              className={cn(
                'mt-3 flex items-center gap-1.5 rounded-full px-3 py-1',
                statusColors.bg
              )}
            >
              <StatusIcon className="h-4 w-4" style={{ color: statusIconColor }} />
              <span className={cn('text-sm font-medium capitalize', statusColors.text)}>
                {transaction.status}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-0 divide-y divide-border">
            {/* Date & Time */}
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{formatDate(transaction.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="font-medium text-foreground">{formatTime(transaction.createdAt)}</span>
            </div>

            {/* Direction & Currency */}
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">Direction</span>
              <span
                className={cn(
                  'font-medium capitalize',
                  transaction.direction === 'credit' ? 'text-emerald-500' : 'text-destructive'
                )}
              >
                {transaction.direction}
              </span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">Currency</span>
              <span className="font-medium text-foreground">{transaction.currency}</span>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="font-medium text-foreground">{transaction.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Balance Change Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-3">
            <p className="text-sm font-medium text-muted-foreground">Balance Change</p>
          </div>
          <div className="flex items-center justify-center gap-4 px-6 py-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Before</p>
              <p className="text-lg font-semibold text-foreground">
                {formatAmount(transaction.balanceBefore, transaction.currency)}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">After</p>
              <p className="text-lg font-semibold text-foreground">
                {formatAmount(transaction.balanceAfter, transaction.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Reference Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-3">
            <p className="text-sm font-medium text-muted-foreground">Reference Information</p>
          </div>
          <div className="space-y-0 divide-y divide-border">
            {/* Transaction ID */}
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground">
                  {transaction.id.length > 16
                    ? `${transaction.id.slice(0, 8)}...${transaction.id.slice(-8)}`
                    : transaction.id}
                </span>
                <button
                  onClick={() => handleCopy(transaction.id, 'id')}
                  className="rounded p-1 hover:bg-accent"
                >
                  {copiedField === 'id' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Reference */}
            {transaction.reference && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-muted-foreground">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">
                    {transaction.reference.length > 16
                      ? `${transaction.reference.slice(0, 8)}...${transaction.reference.slice(-8)}`
                      : transaction.reference}
                  </span>
                  <button
                    onClick={() => handleCopy(transaction.reference!, 'reference')}
                    className="rounded p-1 hover:bg-accent"
                  >
                    {copiedField === 'reference' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Source Type */}
            {transaction.sourceType && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-muted-foreground">Source Type</span>
                <span className="font-medium capitalize text-foreground">{transaction.sourceType}</span>
              </div>
            )}

            {/* Source ID */}
            {transaction.sourceId && (
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-muted-foreground">Source ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground">
                    {transaction.sourceId.length > 16
                      ? `${transaction.sourceId.slice(0, 8)}...${transaction.sourceId.slice(-8)}`
                      : transaction.sourceId}
                  </span>
                  <button
                    onClick={() => handleCopy(transaction.sourceId!, 'sourceId')}
                    className="rounded p-1 hover:bg-accent"
                  >
                    {copiedField === 'sourceId' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailPage;
