import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

interface KYCStatusDisplayProps {
  onStartOver?: () => void;
  onContinue?: () => void;
  showActions?: boolean;
}

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconBgColor: string;
}

export function KYCStatusDisplay({
  onStartOver,
  onContinue,
  showActions = true,
}: KYCStatusDisplayProps) {
  const {
    kycStatus,
    unifiedStatus,
    kycaidVerification,
    isLoading,
    loadKYCStatus,
    syncVerification,
    resetKYC,
  } = useKYC();
console.log('kyc status',kycStatus)
  const getStatusConfig = (): StatusConfig => {
    switch (unifiedStatus) {
      case 'under_review':
      case 'pending_review':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          title: 'Verification In Progress',
          description:
            'Your documents are being reviewed. This usually takes 24-48 hours. We will notify you once the verification is complete.',
          bgColor: 'bg-amber-500/10',
          iconBgColor: 'bg-amber-500/20',
        };
      case 'in_progress':
        return {
          icon: <Loader2 className="h-12 w-12 text-kaviBlue animate-spin" />,
          title: 'Verification Incomplete',
          description:
            'You have an incomplete verification. Please continue where you left off to complete the process.',
          bgColor: 'bg-kaviBlue/10',
          iconBgColor: 'bg-kaviBlue/20',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-12 w-12 text-emerald-500" />,
          title: 'Verification Complete',
          description:
            'Your identity has been successfully verified. You can now access all features including creating virtual cards.',
          bgColor: 'bg-emerald-500/10',
          iconBgColor: 'bg-emerald-500/20',
        };
      case 'rejected':
      case 'requires_resubmission':
        return {
          icon: <XCircle className="h-12 w-12 text-destructive" />,
          title: 'Verification Failed',
          description:
            kycStatus?.rejectionReason ||
            kycaidVerification?.declineReasons?.join(', ') ||
            'Your verification was unsuccessful. Please review the rejection reason and submit again with correct information.',
          bgColor: 'bg-destructive/10',
          iconBgColor: 'bg-destructive/20',
        };
      case 'not_started':
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
          title: 'Verification Required',
          description:
            'Complete your identity verification to unlock all features including virtual card creation.',
          bgColor: 'bg-accent',
          iconBgColor: 'bg-accent',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleStartOver = () => {
    resetKYC();
    onStartOver?.();
  };

  const handleRefresh = async () => {
    await syncVerification();
    await loadKYCStatus();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-kaviBlue" />
        <p className="text-sm text-muted-foreground">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={cn('rounded-2xl p-6 text-center', statusConfig.bgColor)}>
        <div
          className={cn(
            'mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full',
            statusConfig.iconBgColor
          )}
        >
          {statusConfig.icon}
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">{statusConfig.title}</h2>
        <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
      </div>

      {/* Status-specific content */}
      {(unifiedStatus === 'under_review' || unifiedStatus === 'pending_review') && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground">What happens next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue text-xs font-semibold text-white">
                1
              </span>
              <span className="text-sm text-muted-foreground">
                Our team reviews your submitted documents
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue text-xs font-semibold text-white">
                2
              </span>
              <span className="text-sm text-muted-foreground">
                You'll receive an email notification with the results
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaviBlue text-xs font-semibold text-white">
                3
              </span>
              <span className="text-sm text-muted-foreground">
                Once verified, you can create virtual cards
              </span>
            </li>
          </ul>
        </div>
      )}

      {unifiedStatus === 'approved' && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground">Available Features</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Create and manage virtual cards
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Make online purchases worldwide
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Higher transaction limits
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Full account access
            </li>
          </ul>
        </div>
      )}

      {(unifiedStatus === 'rejected' || unifiedStatus === 'requires_resubmission') && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <h3 className="mb-2 font-semibold text-destructive">Rejection Reason</h3>
          <p className="text-sm text-muted-foreground">
            {kycStatus?.rejectionReason ||
              kycaidVerification?.declineReasons?.join(', ') ||
              'Please try again with correct information and clear document images.'}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="space-y-3 pt-4">
          {unifiedStatus === 'not_started' && onContinue && (
            <Button className="w-full" onClick={onContinue}>
              Start Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {unifiedStatus === 'in_progress' && onContinue && (
            <Button className="w-full" onClick={onContinue}>
              Continue Verification
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {unifiedStatus === 'approved' && onContinue && (
            <Button className="w-full" onClick={onContinue}>
              Create Virtual Card
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {(unifiedStatus === 'rejected' || unifiedStatus === 'requires_resubmission') && (
            <Button className="w-full" onClick={handleStartOver}>
              Try Again
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          )}

          {(unifiedStatus === 'under_review' || unifiedStatus === 'pending_review') && (
            <>
              <Button variant="outline" className="w-full" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </Button>
              {onContinue && (
                <Button variant="ghost" className="w-full" onClick={onContinue}>
                  Continue Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {onStartOver && (
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleStartOver}>
                  Start Over
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default KYCStatusDisplay;
