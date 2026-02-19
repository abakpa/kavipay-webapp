import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  RefreshCcw,
  AlertCircle,
  XCircle,
  ChevronLeft,
  HelpCircle,
  CreditCard,
  Truck,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { CardPreOrderStatus as PreOrderStatus, type CardPreOrder } from '@/types/card';
import { cn } from '@/lib/utils';

interface StatusDisplay {
  icon: React.ReactNode;
  text: string;
  badgeClass: string;
  textClass: string;
}

export function CardPreOrderHistory() {
  const navigate = useNavigate();
  const {
    preOrders,
    loadPreOrders,
    syncPreOrder,
    processPreOrder,
    isProcessingPreOrder,
  } = useVirtualCards();

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Sort pre-orders by newest first
  const sortedPreOrders = useMemo(() => {
    return [...preOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [preOrders]);

  useEffect(() => {
    loadPreOrders();
  }, [loadPreOrders]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setIsSyncing(false);

    try {
      await loadPreOrders();

      // Check for stuck cards
      const stuckCards = preOrders.filter(
        (order) =>
          order.status === PreOrderStatus.PROCESSING ||
          order.status === PreOrderStatus.PENDING_SYNC
      );

      if (stuckCards.length > 0) {
        setIsSyncing(true);
        for (const stuckCard of stuckCards) {
          try {
            await syncPreOrder(stuckCard.id);
          } catch {
            // Continue if sync fails
          }
        }
        await loadPreOrders();
        setIsSyncing(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (preOrder: CardPreOrder): StatusDisplay => {
    const isSyncingThis = syncingId === preOrder.id;

    switch (preOrder.status) {
      case PreOrderStatus.PENDING_KYC:
        return {
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          text: 'Pending KYC',
          badgeClass: 'bg-amber-500/10 border-amber-500/20',
          textClass: 'text-amber-500',
        };
      case PreOrderStatus.KYC_APPROVED:
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
          text: 'KYC Approved',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/20',
          textClass: 'text-emerald-500',
        };
      case PreOrderStatus.PROCESSING:
        return {
          icon: <RefreshCcw className="h-4 w-4 text-blue-500 animate-spin" />,
          text: 'Processing',
          badgeClass: 'bg-blue-500/10 border-blue-500/20',
          textClass: 'text-blue-500',
        };
      case PreOrderStatus.PENDING_SYNC:
        return {
          icon: <RefreshCcw className={cn('h-4 w-4 text-amber-500', isSyncingThis && 'animate-spin')} />,
          text: isSyncingThis ? 'Syncing...' : 'Needs Sync',
          badgeClass: 'bg-amber-500/10 border-amber-500/20',
          textClass: 'text-amber-500',
        };
      case PreOrderStatus.COMPLETED:
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
          text: 'Completed',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/20',
          textClass: 'text-emerald-500',
        };
      case PreOrderStatus.CREATION_FAILED:
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Failed',
          badgeClass: 'bg-red-500/10 border-red-500/20',
          textClass: 'text-red-500',
        };
      case PreOrderStatus.REFUND_ELIGIBLE:
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Action Required',
          badgeClass: 'bg-red-500/10 border-red-500/20',
          textClass: 'text-red-500',
        };
      case PreOrderStatus.REFUNDED:
        return {
          icon: <XCircle className="h-4 w-4 text-gray-500" />,
          text: 'Refunded',
          badgeClass: 'bg-gray-500/10 border-gray-500/20',
          textClass: 'text-gray-500',
        };
      case PreOrderStatus.CANCELLED:
        return {
          icon: <XCircle className="h-4 w-4 text-gray-500" />,
          text: 'Cancelled',
          badgeClass: 'bg-gray-500/10 border-gray-500/20',
          textClass: 'text-gray-500',
        };
      case PreOrderStatus.VERIFICATION_REJECTED:
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Verification Failed',
          badgeClass: 'bg-red-500/10 border-red-500/20',
          textClass: 'text-red-500',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          text: 'Unknown',
          badgeClass: 'bg-gray-500/10 border-gray-500/20',
          textClass: 'text-gray-500',
        };
    }
  };

  const handleAction = async (preOrder: CardPreOrder) => {
    switch (preOrder.status) {
      case PreOrderStatus.REFUND_ELIGIBLE:
      case PreOrderStatus.VERIFICATION_REJECTED:
      case PreOrderStatus.CREATION_FAILED:
        navigate('/contact-support');
        break;
      case PreOrderStatus.KYC_APPROVED:
        try {
          setSyncingId(preOrder.id);
          await processPreOrder(preOrder.id);
          navigate('/cards');
        } catch {
          // Error handled by context
        } finally {
          setSyncingId(null);
        }
        break;
      case PreOrderStatus.PENDING_KYC:
      case PreOrderStatus.PROCESSING:
        navigate('/cards/pre-order-status');
        break;
      case PreOrderStatus.PENDING_SYNC:
        try {
          setSyncingId(preOrder.id);
          await syncPreOrder(preOrder.id);
          await loadPreOrders();
        } catch {
          // Error handled by context
        } finally {
          setSyncingId(null);
        }
        break;
      case PreOrderStatus.COMPLETED:
        if (preOrder.type === 'physical') {
          navigate(`/cards/pre-orders/${preOrder.id}/delivery`);
        } else if (preOrder.cardId) {
          navigate('/cards');
        }
        break;
    }
  };

  const getActionButton = (preOrder: CardPreOrder) => {
    const isProcessing = syncingId === preOrder.id || isProcessingPreOrder;

    switch (preOrder.status) {
      case PreOrderStatus.REFUND_ELIGIBLE:
      case PreOrderStatus.VERIFICATION_REJECTED:
      case PreOrderStatus.CREATION_FAILED:
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction(preOrder)}
          >
            <HelpCircle className="mr-1 h-3 w-3" />
            Support
          </Button>
        );
      case PreOrderStatus.KYC_APPROVED:
        return (
          <Button
            size="sm"
            onClick={() => handleAction(preOrder)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <RefreshCcw className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-1 h-3 w-3" />
                Get Card
              </>
            )}
          </Button>
        );
      case PreOrderStatus.PENDING_KYC:
      case PreOrderStatus.PROCESSING:
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction(preOrder)}
          >
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
        );
      case PreOrderStatus.PENDING_SYNC:
        return (
          <Button
            size="sm"
            onClick={() => handleAction(preOrder)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <RefreshCcw className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <RefreshCcw className="mr-1 h-3 w-3" />
                Sync
              </>
            )}
          </Button>
        );
      case PreOrderStatus.COMPLETED:
        if (preOrder.type === 'physical') {
          return (
            <Button size="sm" onClick={() => handleAction(preOrder)}>
              <Truck className="mr-1 h-3 w-3" />
              {preOrder.deliveryStatus ? 'Track' : 'Ship'}
            </Button>
          );
        }
        if (preOrder.cardId) {
          return (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAction(preOrder)}
            >
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={cn('h-4 w-4', (isLoading || isSyncing) && 'animate-spin')} />
        </Button>
      </div>

      {/* Empty State */}
      {sortedPreOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground text-center mb-6">
              You haven't placed any card orders yet.
            </p>
            <Button onClick={() => navigate('/cards/create')}>
              Create a Card
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {sortedPreOrders.map((preOrder) => {
          const statusDisplay = getStatusDisplay(preOrder);
          const actionButton = getActionButton(preOrder);

          return (
            <Card key={preOrder.id} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">
                      #{preOrder.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(preOrder.createdAt).toLocaleDateString()}{' '}
                      {new Date(preOrder.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs',
                      statusDisplay.badgeClass
                    )}
                  >
                    {statusDisplay.icon}
                    <span className={statusDisplay.textClass}>{statusDisplay.text}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Brand</p>
                    <p className="font-medium uppercase">{preOrder.brand}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Balance</p>
                    <p className="font-medium">
                      {preOrder.currency === 'USD' ? '$' : '₦'}
                      {preOrder.initialAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fee</p>
                    <p className="font-medium">
                      {preOrder.currency === 'USD' ? '$' : '₦'}
                      {preOrder.cardFeePaid.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-muted rounded-full capitalize">
                    {preOrder.type || 'virtual'} card
                  </span>
                  {actionButton}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
