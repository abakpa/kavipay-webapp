import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { setTransactionPIN, getVerificationStatus } from '@/lib/api/verification';
import { useVerification } from '@/contexts/VerificationContext';
import { cn } from '@/lib/utils';

type Mode = 'set' | 'change';

export function PINManagement() {
  const navigate = useNavigate();
  const { refreshStatus } = useVerification();

  const [hasPIN, setHasPIN] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode | null>(null);

  // For set/change PIN flow
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('new');
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getVerificationStatus();
        setHasPIN(status.pin_set);
      } catch (err) {
        console.error('Failed to check PIN status:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleStartSet = () => {
    setMode('set');
    setStep('new');
    setNewPIN('');
    setConfirmPIN('');
    setError(null);
  };

  const handleStartChange = () => {
    setMode('change');
    setStep('current');
    setCurrentPIN('');
    setNewPIN('');
    setConfirmPIN('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (newPIN !== confirmPIN) {
      setError('PINs do not match');
      return;
    }

    if (newPIN.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setTransactionPIN(newPIN, mode === 'change' ? currentPIN : undefined);
      await refreshStatus();
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || 'Failed to set PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePINInput = (
    value: string,
    setter: (val: string) => void,
    nextStep?: () => void
  ) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setter(cleaned);
    setError(null);

    if (cleaned.length === 6 && nextStep) {
      setTimeout(nextStep, 200);
    }
  };

  const handleBack = () => {
    if (mode === null) {
      navigate(-1);
    } else if (step === 'current') {
      setMode(null);
    } else if (step === 'new' && mode === 'change') {
      setStep('current');
    } else if (step === 'confirm') {
      setStep('new');
    } else {
      setMode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold">PIN {hasPIN ? 'Updated' : 'Set'} Successfully</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Transaction PIN</h1>
      </div>

      {/* Overview */}
      {mode === null && (
        <div className="flex flex-col items-center py-8">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10">
            <Key className="h-10 w-10 text-purple-500" />
          </div>

          <h2 className="mb-2 text-center text-xl font-semibold">
            {hasPIN ? 'PIN is Set Up' : 'Set Up Your PIN'}
          </h2>
          <p className="mb-8 text-center text-muted-foreground">
            {hasPIN
              ? 'Your transaction PIN is active. You can change it at any time.'
              : 'Create a 6-digit PIN to quickly verify transactions.'}
          </p>

          {hasPIN ? (
            <Button onClick={handleStartChange} className="w-full">
              Change PIN
            </Button>
          ) : (
            <Button onClick={handleStartSet} className="w-full">
              Set PIN
            </Button>
          )}
        </div>
      )}

      {/* Current PIN Step (for change) */}
      {mode === 'change' && step === 'current' && (
        <div className="flex flex-col items-center py-8">
          <h2 className="mb-2 text-center text-xl font-semibold">Enter Current PIN</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Enter your current 6-digit PIN to continue
          </p>

          <div className="mb-6 flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-3 w-3 rounded-full transition-colors',
                  i < currentPIN.length ? 'bg-kaviBlue' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={currentPIN}
            onChange={(e) =>
              handlePINInput(e.target.value, setCurrentPIN, () => setStep('new'))
            }
            className="sr-only"
            autoFocus
          />

          {/* Number pad */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (num === 'del') {
                    setCurrentPIN((prev) => prev.slice(0, -1));
                  } else if (num !== null && currentPIN.length < 6) {
                    const newVal = currentPIN + num;
                    setCurrentPIN(newVal);
                    if (newVal.length === 6) {
                      setTimeout(() => setStep('new'), 200);
                    }
                  }
                }}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-xl font-medium transition-colors',
                  num === null
                    ? 'invisible'
                    : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
                )}
              >
                {num === 'del' ? '⌫' : num}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* New PIN Step */}
      {mode !== null && step === 'new' && (
        <div className="flex flex-col items-center py-8">
          <h2 className="mb-2 text-center text-xl font-semibold">
            {mode === 'change' ? 'Enter New PIN' : 'Create Your PIN'}
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            Enter a 6-digit PIN you'll remember
          </p>

          <div className="mb-6 flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-3 w-3 rounded-full transition-colors',
                  i < newPIN.length ? 'bg-kaviBlue' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={newPIN}
            onChange={(e) =>
              handlePINInput(e.target.value, setNewPIN, () => setStep('confirm'))
            }
            className="sr-only"
            autoFocus
          />

          {/* Number pad */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (num === 'del') {
                    setNewPIN((prev) => prev.slice(0, -1));
                  } else if (num !== null && newPIN.length < 6) {
                    const newVal = newPIN + num;
                    setNewPIN(newVal);
                    if (newVal.length === 6) {
                      setTimeout(() => setStep('confirm'), 200);
                    }
                  }
                }}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-xl font-medium transition-colors',
                  num === null
                    ? 'invisible'
                    : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
                )}
              >
                {num === 'del' ? '⌫' : num}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* Confirm PIN Step */}
      {mode !== null && step === 'confirm' && (
        <div className="flex flex-col items-center py-8">
          <h2 className="mb-2 text-center text-xl font-semibold">Confirm Your PIN</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Re-enter your PIN to confirm
          </p>

          <div className="mb-6 flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-3 w-3 rounded-full transition-colors',
                  i < confirmPIN.length ? 'bg-kaviBlue' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirmPIN}
            onChange={(e) =>
              handlePINInput(e.target.value, setConfirmPIN, handleSubmit)
            }
            className="sr-only"
            autoFocus
          />

          {/* Number pad */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, i) => (
              <button
                key={i}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (num === 'del') {
                    setConfirmPIN((prev) => prev.slice(0, -1));
                  } else if (num !== null && confirmPIN.length < 6) {
                    const newVal = confirmPIN + num;
                    setConfirmPIN(newVal);
                    if (newVal.length === 6) {
                      setTimeout(handleSubmit, 200);
                    }
                  }
                }}
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-xl font-medium transition-colors',
                  num === null
                    ? 'invisible'
                    : 'bg-muted hover:bg-muted/80 active:bg-muted/60'
                )}
              >
                {num === 'del' ? '⌫' : num}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {isSubmitting && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Setting PIN...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PINManagement;
