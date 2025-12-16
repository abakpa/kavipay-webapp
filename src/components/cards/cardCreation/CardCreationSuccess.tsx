import { CheckCircle, Eye, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import type { VirtualCard, CardPreOrder } from '@/types/card';

interface CardCreationSuccessProps {
  createdCard?: VirtualCard;
  createdPreOrder?: CardPreOrder;
  onViewDashboard: () => void;
  onManageCard: () => void;
}

interface NextStepOption {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function CardCreationSuccess({
  createdCard,
  createdPreOrder,
  onViewDashboard,
  onManageCard,
}: CardCreationSuccessProps) {
  const { user } = useAuth();
  const isKYCVerified = user?.kycStatus === 'verified';

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const nextSteps: NextStepOption[] = createdCard
    ? [
        {
          icon: Eye,
          title: 'View Card Details',
          description: 'See your full card number, CVV, and copy details',
        },
        {
          icon: Settings,
          title: 'Manage Limits',
          description: 'Adjust spending limits and card security settings',
        },
        {
          icon: BarChart3,
          title: 'Track Spending',
          description: 'Monitor transactions and spending patterns',
        },
      ]
    : isKYCVerified
      ? [
          {
            icon: Settings,
            title: 'Process Your Card',
            description:
              'Your identity is verified. Process your card to start using it',
          },
          {
            icon: Eye,
            title: 'Check Status',
            description: 'View your card setup progress and processing status',
          },
        ]
      : [
          {
            icon: ShieldCheck,
            title: 'Verify Your Identity',
            description:
              'Complete KYC verification to activate your card and start using it',
          },
          {
            icon: Eye,
            title: 'Check Status',
            description: 'View your card setup progress and verification status',
          },
        ];

  return (
    <div className="flex flex-col items-center py-8">
      {/* Success Icon */}
      <div className="mb-6 animate-bounce-once">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
      </div>

      {/* Success Message */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          {createdCard ? 'Card Created Successfully!' : 'Card Setup Complete!'}
        </h2>
        <p className="max-w-md text-muted-foreground">
          {createdCard
            ? `Your ${
                createdCard.label && !createdCard.label.startsWith('undefined')
                  ? createdCard.label.toLowerCase()
                  : 'virtual card'
              } is ready to use. You can start making purchases immediately.`
            : isKYCVerified
              ? 'Your card pre-order is complete! Your identity is already verified. Process your card now to start using it for purchases.'
              : 'Your card pre-order is complete! Next, verify your identity to activate your card and start using it for purchases.'}
        </p>
      </div>

      {/* Card Preview */}
      {createdCard && (
        <div className="mb-8 w-full max-w-sm">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            {/* Card Brand */}
            <div className="absolute right-4 top-4">
              <span className="text-sm font-bold text-white">
                {createdCard.brand?.toUpperCase() || 'VISA'}
              </span>
            </div>

            {/* Card Number */}
            <div className="mt-8">
              <span className="text-xs uppercase tracking-wider text-white/60">
                Card Number
              </span>
              <p className="mt-1 font-mono text-lg font-medium tracking-wider text-white">
                {formatCardNumber(createdCard.cardNumber)}
              </p>
            </div>

            {/* Card Bottom Details */}
            <div className="mt-6 flex items-end justify-between">
              <div className="flex gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/60">
                    Valid Thru
                  </span>
                  <p className="mt-1 font-mono text-sm font-medium text-white">
                    ••/••
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-white/60">
                    CVV
                  </span>
                  <p className="mt-1 font-mono text-sm font-medium text-white">
                    •••
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {createdCard.cardholderName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Order Info */}
      {createdPreOrder && (
        <div className="mb-8 w-full max-w-sm">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center">
            <span className="text-xs uppercase tracking-wider text-white/60">
              Card Configured
            </span>
            <p className="mt-2 font-mono text-lg font-bold text-white">
              {createdPreOrder.brand.toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-white/80">
              {createdPreOrder.currency} ${createdPreOrder.initialAmount}
            </p>
            <p className="mt-4 text-xs text-white/60">
              {isKYCVerified
                ? 'Ready to process - tap below to create your card'
                : 'Card will be created after KYC verification'}
            </p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-8 w-full max-w-md">
        <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
          Quick Actions
        </h3>

        <div className="space-y-3">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <IconComponent className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex w-full max-w-md flex-col gap-3">
        <Button type="button" size="lg" onClick={onManageCard} className="w-full">
          {createdCard
            ? 'Card Settings'
            : isKYCVerified
              ? 'Process Card'
              : 'Start KYC Verification'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onViewDashboard}
          className="w-full"
        >
          {createdCard ? 'Go to Dashboard' : 'View Status'}
        </Button>
      </div>
    </div>
  );
}

export default CardCreationSuccess;
