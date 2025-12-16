import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Loader2, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CardPreOrder } from '@/types/card';

interface CardEmptyStateProps {
  onCreateCard?: () => void;
  isLoading?: boolean;
  hasPendingPreOrders?: boolean;
  pendingPreOrders?: CardPreOrder[];
  onProcessCard?: (preOrderId: string, bvn?: string) => Promise<void>;
  className?: string;
}

export function CardEmptyState({
  onCreateCard,
  isLoading = false,
  hasPendingPreOrders = false,
  pendingPreOrders = [],
  onProcessCard,
  className,
}: CardEmptyStateProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8',
          className
        )}
      >
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading cards...</p>
      </div>
    );
  }

  // Get the latest pending pre-order
  const latestPreOrder = pendingPreOrders[0];

  // Render pre-order status UI
  if (hasPendingPreOrders && latestPreOrder) {
    const getStatusConfig = () => {
      switch (latestPreOrder.status) {
        case 'pending_kyc':
          return {
            icon: <Shield className="h-10 w-10 text-amber-500" />,
            iconBg: 'bg-amber-500/10',
            title: 'Verification Required',
            description: 'Complete identity verification to activate your card.',
            actionText: 'Complete Verification',
            actionHandler: () => navigate('/kyc'),
            showSecondary: false,
          };
        case 'kyc_approved':
          return {
            icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
            iconBg: 'bg-emerald-500/10',
            title: 'Ready to Create Card',
            description: 'Your identity is verified! Click below to get your card.',
            actionText: 'Get My Card',
            actionHandler: async () => {
              setErrorMessage(null);
              setIsProcessing(true);
              try {
                // CardDashboard handles the BVN modal logic
                await onProcessCard?.(latestPreOrder.id);
              } catch (err: unknown) {
                // Only show error if it's not a BVN error (those are handled by CardDashboard)
                const error = err as { message?: string };
                const errorMsg = error?.message?.toLowerCase() || '';
                if (!errorMsg.includes('bvn')) {
                  setErrorMessage(error?.message || 'Failed to create card. Please try again.');
                }
              } finally {
                setIsProcessing(false);
              }
            },
            showSecondary: false,
          };
        case 'processing':
        case 'pending_sync':
          return {
            icon: <CreditCard className="h-10 w-10 text-kaviBlue" />,
            iconBg: 'bg-kaviBlue/10',
            title: 'Creating Your Card',
            description: 'Your card is being created. This usually takes a few moments.',
            actionText: null,
            actionHandler: null,
            showSecondary: false,
            showSpinner: true,
          };
        case 'creation_failed':
          return {
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            iconBg: 'bg-destructive/10',
            title: 'Card Creation Failed',
            description: 'We encountered an issue creating your card. Please try again.',
            actionText: 'Retry',
            actionHandler: () => onProcessCard?.(latestPreOrder.id),
            showSecondary: true,
          };
        case 'verification_rejected':
        case 'refund_eligible':
          return {
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            iconBg: 'bg-destructive/10',
            title: 'Verification Failed',
            description: 'Your identity verification was not approved. Please try again or contact support.',
            actionText: 'Retry Verification',
            actionHandler: () => navigate('/kyc'),
            showSecondary: true,
          };
        default:
          return {
            icon: <Clock className="h-10 w-10 text-amber-500" />,
            iconBg: 'bg-amber-500/10',
            title: 'Processing Order',
            description: 'Your card order is being processed.',
            actionText: 'View Status',
            actionHandler: () => navigate('/kyc/status'),
            showSecondary: false,
          };
      }
    };

    const statusConfig = getStatusConfig();

    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center',
          className
        )}
      >
        {/* Status Icon */}
        <div className={cn('mb-4 flex h-20 w-20 items-center justify-center rounded-full', statusConfig.iconBg)}>
          {statusConfig.icon}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-foreground">{statusConfig.title}</h3>

        {/* Description */}
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{statusConfig.description}</p>

        {/* Order Details */}
        <div className="mb-6 w-full max-w-xs rounded-lg border border-border bg-accent/30 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Card Type</span>
            <span className="font-medium text-foreground">{latestPreOrder.brand?.toUpperCase()} Card</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium text-foreground">{latestPreOrder.currency}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Initial Amount</span>
            <span className="font-medium text-foreground">${latestPreOrder.initialAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 w-full max-w-xs rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Spinner for processing state */}
        {(statusConfig.showSpinner || isProcessing) && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-kaviBlue/10 px-4 py-2 text-sm text-kaviBlue">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating your card...</span>
          </div>
        )}

        {/* Action Button */}
        {statusConfig.actionText && statusConfig.actionHandler && !isProcessing && (
          <Button
            onClick={statusConfig.actionHandler}
            size="lg"
            className="gap-2 rounded-xl shadow-lg shadow-kaviBlue/20"
          >
            {statusConfig.actionText}
          </Button>
        )}

        {/* Secondary Action for failed states */}
        {statusConfig.showSecondary && (
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => window.open('mailto:support@kavipay.com?subject=Card%20Pre-Order%20Issue', '_blank')}
          >
            Contact Support
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center',
        className
      )}
    >
      {/* Card Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-kaviBlue/10">
        <CreditCard className="h-10 w-10 text-kaviBlue" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-bold text-foreground">No Virtual Cards</h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Create your first virtual card to start making online purchases securely.
      </p>

      {/* Features List */}
      <div className="mb-6 space-y-2 text-left">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Instant virtual card creation</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Use for online purchases worldwide</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Freeze and unfreeze anytime</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Track all transactions in real-time</span>
        </div>
      </div>

      {/* Create Card Button */}
      {onCreateCard && (
        <Button
          onClick={onCreateCard}
          size="lg"
          className="gap-2 rounded-xl shadow-lg shadow-kaviBlue/20"
        >
          <Plus className="h-5 w-5" />
          Create Virtual Card
        </Button>
      )}
    </div>
  );
}

export default CardEmptyState;
