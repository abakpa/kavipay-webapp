import { useNavigate } from 'react-router-dom';
import { Shield, Clock, XCircle, ArrowRight, X, Loader2 } from 'lucide-react';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface KYCStatusBannerProps {
  className?: string;
  dismissible?: boolean;
  compact?: boolean;
}

export function KYCStatusBanner({
  className,
  dismissible = false,
  compact = false,
}: KYCStatusBannerProps) {
  const navigate = useNavigate();
  const { unifiedStatus, isLoading } = useKYC();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if loading, dismissed, or verified
  if (isLoading || isDismissed || unifiedStatus === 'approved') {
    return null;
  }

  const getBannerConfig = () => {
    switch (unifiedStatus) {
      case 'under_review':
      case 'pending_review':
        return {
          icon: <Clock className={cn('text-amber-500', compact ? 'h-5 w-5' : 'h-6 w-6')} />,
          title: 'Verification In Progress',
          description: 'Your documents are being reviewed, or continue if you haven\'t finished.',
          bgColor: 'bg-amber-500/10 border-amber-500/20',
          actionText: 'View Status',
          actionPath: '/kyc/status',
          secondaryActionText: 'Continue',
          secondaryActionPath: '/kyc',
        };
      case 'in_progress':
        return {
          icon: <Loader2 className={cn('text-kaviBlue animate-spin', compact ? 'h-5 w-5' : 'h-6 w-6')} />,
          title: 'Complete Your Verification',
          description: 'You have an incomplete verification. Continue where you left off.',
          bgColor: 'bg-kaviBlue/10 border-kaviBlue/20',
          actionText: 'Continue',
          actionPath: '/kyc',
        };
      case 'rejected':
      case 'requires_resubmission':
        return {
          icon: <XCircle className={cn('text-destructive', compact ? 'h-5 w-5' : 'h-6 w-6')} />,
          title: 'Verification Failed',
          description: 'Please review and submit your documents again.',
          bgColor: 'bg-destructive/10 border-destructive/20',
          actionText: 'Try Again',
          actionPath: '/kyc',
        };
      case 'not_started':
      default:
        return {
          icon: <Shield className={cn('text-kaviBlue', compact ? 'h-5 w-5' : 'h-6 w-6')} />,
          title: 'Complete Your Verification',
          description: 'Verify your identity to create virtual cards and unlock all features.',
          bgColor: 'bg-kaviBlue/10 border-kaviBlue/20',
          actionText: 'Start Verification',
          actionPath: '/kyc',
        };
    }
  };

  const config = getBannerConfig();

  const handleAction = () => {
    navigate(config.actionPath);
  };

  const handleSecondaryAction = () => {
    if (config.secondaryActionPath) {
      navigate(config.secondaryActionPath);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border p-3',
          config.bgColor,
          className
        )}
      >
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className="text-sm font-medium text-foreground">{config.title}</p>
          </div>
        </div>
        <button
          onClick={handleAction}
          className="flex items-center gap-1 text-sm font-medium text-kaviBlue hover:underline"
        >
          {config.actionText}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn('relative rounded-xl border p-4', config.bgColor, className)}
    >
      {dismissible && (
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card">
          {config.icon}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{config.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-sm font-medium text-kaviBlue hover:underline"
            >
              {config.actionText}
              <ArrowRight className="h-4 w-4" />
            </button>
            {config.secondaryActionText && (
              <button
                onClick={handleSecondaryAction}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                {config.secondaryActionText}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal inline version for card pages
export function KYCStatusInline({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { unifiedStatus, isLoading } = useKYC();

  if (isLoading || unifiedStatus === 'approved') {
    return null;
  }

  const getConfig = () => {
    switch (unifiedStatus) {
      case 'under_review':
      case 'pending_review':
        return {
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          text: 'Verification pending',
          action: 'View Status',
          path: '/kyc/status',
        };
      case 'in_progress':
        return {
          icon: <Loader2 className="h-4 w-4 text-kaviBlue animate-spin" />,
          text: 'Continue verification',
          action: 'Continue',
          path: '/kyc',
        };
      case 'rejected':
      case 'requires_resubmission':
        return {
          icon: <XCircle className="h-4 w-4 text-destructive" />,
          text: 'Verification failed',
          action: 'Try Again',
          path: '/kyc',
        };
      default:
        return {
          icon: <Shield className="h-4 w-4 text-amber-500" />,
          text: 'Verify to create cards',
          action: 'Verify Now',
          path: '/kyc',
        };
    }
  };

  const config = getConfig();

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg bg-amber-500/10 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <span className="text-sm text-muted-foreground">{config.text}</span>
      </div>
      <button
        onClick={() => navigate(config.path)}
        className="text-sm font-medium text-kaviBlue hover:underline"
      >
        {config.action}
      </button>
    </div>
  );
}

export default KYCStatusBanner;
