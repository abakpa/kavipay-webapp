import { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { DeleteAccountStep } from '@/types/profile';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

const CONFIRMATION_PHRASE = 'DELETE MY ACCOUNT';

const consequences = [
  'Your profile and all personal information will be permanently deleted',
  'All virtual cards will be terminated immediately',
  'Your wallet balance and rewards will be forfeited',
  'Transaction history will be permanently erased',
  'This action cannot be undone',
];

export function DeleteAccountModal({ isOpen, onClose, onDelete }: DeleteAccountModalProps) {
  const [step, setStep] = useState<DeleteAccountStep>('warning');
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('warning');
      setAcknowledged(false);
      setConfirmText('');
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isDeleting, onClose]);

  const handleProceedToConfirm = () => {
    if (acknowledged) {
      setStep('confirm');
    }
  };

  const handleDelete = async () => {
    if (confirmText !== CONFIRMATION_PHRASE) {
      setError('Please type the confirmation phrase exactly as shown');
      return;
    }

    setIsDeleting(true);
    setStep('deleting');
    setError(null);

    try {
      const success = await onDelete();
      if (success) {
        setStep('deleted');
      } else {
        setStep('confirm');
        setError('Failed to delete account. Please try again.');
      }
    } catch {
      setStep('confirm');
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Delete Account</h2>
          </div>
          {step !== 'deleting' && step !== 'deleted' && (
            <button
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Step: Warning */}
        {step === 'warning' && (
          <div className="space-y-4">
            {/* Warning Card */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">
                    This action is permanent
                  </p>
                  <p className="mt-1 text-sm text-destructive/80">
                    Once deleted, your account cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Consequences */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Deleting your account will:
              </p>
              <ul className="space-y-2">
                {consequences.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Acknowledge Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-foreground">
                I understand that this action is permanent and my data cannot be recovered.
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleProceedToConfirm}
                disabled={!acknowledged}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To confirm deletion, please type{' '}
              <span className="font-mono font-semibold text-destructive">
                {CONFIRMATION_PHRASE}
              </span>{' '}
              below:
            </p>

            <Input
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder="Type the phrase to confirm"
              className={cn(
                'font-mono',
                confirmText === CONFIRMATION_PHRASE && 'border-destructive'
              )}
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep('warning')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== CONFIRMATION_PHRASE}
                className="flex-1"
              >
                Delete My Account
              </Button>
            </div>
          </div>
        )}

        {/* Step: Deleting */}
        {step === 'deleting' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-destructive mb-4" />
            <p className="text-lg font-medium text-foreground">Deleting your account...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment.</p>
          </div>
        )}

        {/* Step: Deleted */}
        {step === 'deleted' && (
          <div className="flex flex-col items-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <Trash2 className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-lg font-medium text-foreground">Account Deleted</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Your account has been permanently deleted. You will be redirected shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteAccountModal;
