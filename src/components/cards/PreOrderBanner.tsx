import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { CardPreOrderStatus, type CardPreOrder } from '@/types/card';
import { cn } from '@/lib/utils';

interface PreOrderBannerProps {
  preOrders: CardPreOrder[];
}

interface StatusInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  actionText: string;
}

export function PreOrderBanner({ preOrders }: PreOrderBannerProps) {
  const navigate = useNavigate();

  // Filter active pre-orders
  const activePreOrders = useMemo(() => {
    return preOrders.filter(
      (order) =>
        order.status === CardPreOrderStatus.PENDING_KYC ||
        order.status === CardPreOrderStatus.PROCESSING ||
        order.status === CardPreOrderStatus.KYC_APPROVED ||
        order.status === CardPreOrderStatus.REFUND_ELIGIBLE ||
        order.status === CardPreOrderStatus.VERIFICATION_REJECTED
    );
  }, [preOrders]);

  // Get the latest active pre-order
  const latestOrder = useMemo(() => {
    if (activePreOrders.length === 0) return null;
    return [...activePreOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [activePreOrders]);

  if (!latestOrder) {
    return null;
  }

  const getStatusInfo = (): StatusInfo => {
    switch (latestOrder.status) {
      case CardPreOrderStatus.PENDING_KYC:
        return {
          title: 'Card Request Pending',
          description: 'Complete identity verification to activate your card',
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          borderColor: 'border-amber-500',
          actionText: 'Verify',
        };
      case CardPreOrderStatus.PROCESSING:
        return {
          title: 'Card Being Created',
          description: 'Your card is being created and will be ready soon',
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          borderColor: 'border-blue-500',
          actionText: 'View',
        };
      case CardPreOrderStatus.KYC_APPROVED:
        return {
          title: 'Ready to Create Card',
          description: 'Your identity is verified! Create your virtual card now',
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          borderColor: 'border-emerald-500',
          actionText: 'Create',
        };
      case CardPreOrderStatus.REFUND_ELIGIBLE:
        return {
          title: 'Refund Available',
          description: 'Your pre-order is eligible for refund',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          borderColor: 'border-red-500',
          actionText: 'Refund',
        };
      case CardPreOrderStatus.VERIFICATION_REJECTED:
        return {
          title: 'Verification Failed',
          description: 'Identity verification was rejected. You can request a refund',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          borderColor: 'border-red-500',
          actionText: 'Refund',
        };
      default:
        return {
          title: 'Order Status',
          description: 'Check your order status',
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          borderColor: 'border-gray-500',
          actionText: 'View',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border bg-card cursor-pointer transition-colors hover:bg-accent/50',
        statusInfo.borderColor
      )}
      onClick={() => navigate('/cards/pre-order-status')}
    >
      <div className="flex-shrink-0">{statusInfo.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{statusInfo.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {statusInfo.description}
        </p>
      </div>
      <button
        className="flex-shrink-0 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg flex items-center gap-1 hover:bg-primary/90 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          navigate('/cards/pre-order-status');
        }}
      >
        {statusInfo.actionText}
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
