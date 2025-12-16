import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useKYC, KYCAID_STEPS } from '@/contexts/KYCContext';
import { KYCProgressIndicator } from '@/components/kyc/KYCProgressIndicator';
import {
  KYCAIDPersonalInfoStep,
  KYCAIDAddressStep,
  KYCAIDVerificationStep,
} from '@/components/kyc';

export function KYCFlow() {
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    kycStatus,
    unifiedStatus,
    isLoading,
    hasExistingVerification,
    kycaidVerification,
    loadKYCStatus,
    loadVerification,
  } = useKYC();

  const [showIntro, setShowIntro] = useState(true);

  // Check for existing verification on mount
  useEffect(() => {
    loadKYCStatus();
    loadVerification();
  }, [loadKYCStatus, loadVerification]);

  // Redirect if already verified
  useEffect(() => {
    if (unifiedStatus === 'approved') {
      navigate('/kyc/status');
    }
  }, [unifiedStatus, navigate]);

  // Skip intro if there's existing progress
  useEffect(() => {
    if (hasExistingVerification || unifiedStatus === 'in_progress' || unifiedStatus === 'under_review') {
      setShowIntro(false);
      // If verification exists but not complete, go to verification step
      if (kycaidVerification && unifiedStatus !== 'approved') {
        setCurrentStep(2);
      }
    }
  }, [hasExistingVerification, unifiedStatus, kycaidVerification, setCurrentStep]);

  // Get completed steps for progress indicator
  const getCompletedSteps = useCallback((): number[] => {
    const completed: number[] = [];
    if (currentStep > 0) completed.push(0);
    if (currentStep > 1) completed.push(1);
    if (unifiedStatus === 'approved' || unifiedStatus === 'under_review') {
      completed.push(0, 1, 2);
    }
    return completed;
  }, [currentStep, unifiedStatus]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      if (showIntro) {
        navigate(-1);
      } else {
        setShowIntro(true);
      }
    } else {
      previousStep();
    }
  }, [currentStep, showIntro, navigate, previousStep]);

  const handleStartVerification = () => {
    setShowIntro(false);
    setCurrentStep(0);
  };

  const handleVerificationComplete = () => {
    navigate('/kyc/status');
  };

  // Loading state
  if (isLoading && !kycStatus) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
          <p className="mt-4 text-muted-foreground">Loading verification status...</p>
        </div>
      </div>
    );
  }

  // Show pending/under review status - but allow continuing if user wants to
  // This handles cases where user started but didn't complete the KYCAID form
  // We no longer block access to the flow - user can choose to continue or view status

  // Intro screen - show for not_started, rejected, or under_review (to allow restart/continue)
  if (showIntro && (unifiedStatus === 'not_started' || unifiedStatus === 'rejected' || unifiedStatus === 'under_review' || unifiedStatus === 'pending_review')) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Verify Your Identity</h1>
            <p className="text-muted-foreground">Complete verification to unlock all features</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-kaviBlue/10">
              <ShieldCheck className="h-10 w-10 text-kaviBlue" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">Identity Verification</h2>
            <p className="mb-6 max-w-sm text-muted-foreground">
              We need to verify your identity to comply with regulations and keep your account
              secure.
            </p>

            {unifiedStatus === 'rejected' && kycStatus?.rejectionReason && (
              <div className="mb-6 w-full rounded-xl bg-destructive/10 p-4 text-left">
                <p className="mb-1 font-semibold text-destructive">Previous Rejection</p>
                <p className="text-sm text-muted-foreground">{kycStatus.rejectionReason}</p>
              </div>
            )}

            {(unifiedStatus === 'under_review' || unifiedStatus === 'pending_review') && (
              <div className="mb-6 w-full rounded-xl bg-amber-500/10 p-4 text-left">
                <p className="mb-1 font-semibold text-amber-600">Verification In Progress</p>
                <p className="text-sm text-muted-foreground">
                  Your verification is being reviewed. If you haven't completed the document upload, you can continue below.
                </p>
              </div>
            )}

            <div className="w-full space-y-3 text-left">
              <p className="text-sm font-medium text-foreground">You'll need:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
                    1
                  </span>
                  Personal information (name, date of birth, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
                    2
                  </span>
                  Your current residential address
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
                    3
                  </span>
                  A valid government-issued ID (passport, national ID, or driver's license)
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
                    4
                  </span>
                  A selfie for facial verification
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleStartVerification}>
          {unifiedStatus === 'rejected'
            ? 'Start Again'
            : (unifiedStatus === 'under_review' || unifiedStatus === 'pending_review')
            ? 'Continue Verification'
            : 'Start Verification'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate('/kyc/status')}
        >
          Check Verification Status
        </Button>
      </div>
    );
  }

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <KYCAIDPersonalInfoStep onNext={nextStep} onBack={handleBack} />;
      case 1:
        return <KYCAIDAddressStep onNext={nextStep} onBack={previousStep} />;
      case 2:
        return (
          <KYCAIDVerificationStep
            onComplete={handleVerificationComplete}
            onBack={previousStep}
          />
        );
      default:
        return null;
    }
  };

  // Multi-step form
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verify Your Identity</h1>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {KYCAID_STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <KYCProgressIndicator
        steps={KYCAID_STEPS.map((s) => ({ id: s.id, title: s.title }))}
        currentStep={currentStep}
        completedSteps={getCompletedSteps()}
        onStepClick={(step) => {
          if (step < currentStep) {
            setCurrentStep(step);
          }
        }}
        className="px-4"
      />

      {/* Step Content */}
      <Card>
        <CardContent className="py-6">{renderStepContent()}</CardContent>
      </Card>
    </div>
  );
}

export default KYCFlow;
