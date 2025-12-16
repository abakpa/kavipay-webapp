import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';

interface KYCAIDVerificationStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function KYCAIDVerificationStep({ onComplete, onBack }: KYCAIDVerificationStepProps) {
  const {
    kycaidSession,
    kycaidVerification,
    createSession,
    syncVerification,
    isLoading,
    isSubmitting,
    error,
    clearError,
    unifiedStatus,
  } = useKYC();

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [formOpened, setFormOpened] = useState(false);

  // Create session if not exists
  useEffect(() => {
    const initSession = async () => {
      if (!kycaidSession && !kycaidVerification && !isCreatingSession) {
        setIsCreatingSession(true);
        await createSession();
        setIsCreatingSession(false);
      }
    };
    initSession();
  }, [kycaidSession, kycaidVerification, createSession, isCreatingSession]);

  // Open KYCAID form in new window
  const handleOpenForm = useCallback(() => {
    if (kycaidSession?.formUrl) {
      window.open(kycaidSession.formUrl, '_blank', 'noopener,noreferrer');
      setFormOpened(true);
    }
  }, [kycaidSession?.formUrl]);

  // Sync verification status
  const handleSyncStatus = useCallback(async () => {
    clearError();
    await syncVerification();
  }, [clearError, syncVerification]);

  // Auto-sync when form was opened and user returns
  useEffect(() => {
    const handleFocus = () => {
      if (formOpened) {
        handleSyncStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [formOpened, handleSyncStatus]);

  // Check if verification is complete - only redirect on approved status
  // under_review means documents submitted but still being reviewed - user should be able to continue/resubmit
  useEffect(() => {
    if (unifiedStatus === 'approved') {
      onComplete();
    }
  }, [unifiedStatus, onComplete]);

  // Loading state
  if (isCreatingSession || (isLoading && !kycaidSession)) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-kaviBlue" />
        <p className="mt-4 text-muted-foreground">Preparing verification...</p>
      </div>
    );
  }

  // Error state - no session
  if (!kycaidSession && !kycaidVerification) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Session Error</h2>
          <p className="mt-2 text-muted-foreground">
            {error || 'Failed to create verification session. Please try again.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Go Back
          </Button>
          <Button
            className="flex-1"
            onClick={() => createSession()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <ShieldCheck className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Document Verification</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete the verification form to verify your identity
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-xl bg-accent/50 p-4">
        <h3 className="mb-3 font-medium text-foreground">What you'll need:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              1
            </span>
            A valid government-issued ID (passport, national ID, or driver's license)
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              2
            </span>
            Good lighting and a clear camera for selfie verification
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaviBlue/10 text-xs font-semibold text-kaviBlue">
              3
            </span>
            A few minutes to complete the process
          </li>
        </ul>
      </div>

      {/* Status indicator */}
      {formOpened && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <div>
              <p className="font-medium text-foreground">Verification in progress</p>
              <p className="text-sm text-muted-foreground">
                Complete the form in the new window, then return here
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleOpenForm}
          disabled={!kycaidSession?.formUrl}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {formOpened ? 'Open Form Again' : 'Start Verification'}
        </Button>

        {formOpened && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSyncStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                I've Completed the Form
              </>
            )}
          </Button>
        )}

        <Button variant="ghost" className="w-full" onClick={onBack}>
          Go Back
        </Button>
      </div>

      {/* Help text */}
      <p className="text-center text-xs text-muted-foreground">
        Having trouble? Make sure pop-ups are enabled for this site.
        <br />
        The verification form will open in a new window.
      </p>
    </div>
  );
}

export default KYCAIDVerificationStep;
