import { useState } from 'react';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BVNInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bvn: string) => Promise<void>;
  isLoading?: boolean;
}

export function BVNInputModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: BVNInputModalProps) {
  const [bvn, setBvn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateBVN = (value: string): string | null => {
    if (!value) {
      return 'BVN is required';
    }
    if (value.length !== 11) {
      return 'BVN must be exactly 11 digits';
    }
    if (!/^\d+$/.test(value)) {
      return 'BVN must contain only numbers';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateBVN(bvn);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await onSubmit(bvn);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process. Please try again.';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setBvn('');
    setError(null);
    onClose();
  };

  const handleBVNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 11 characters
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
    setBvn(cleaned);
    if (error) {
      setError(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kaviBlue/10">
            <Shield className="h-5 w-5 text-kaviBlue" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Enter Your BVN</h2>
        </div>

        {/* Info Box */}
        <div className="mb-5 rounded-lg border border-kaviBlue/20 bg-kaviBlue/5 p-4">
          <p className="text-sm text-muted-foreground">
            Bank Verification Number (BVN) is required to create your card. Your BVN is securely
            transmitted to our card provider and is not stored on our servers.
          </p>
        </div>

        {/* BVN Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">
            BVN (11 digits)
          </label>
          <input
            type="text"
            value={bvn}
            onChange={handleBVNChange}
            placeholder="Enter your 11-digit BVN"
            className={cn(
              'w-full rounded-lg border bg-background px-4 py-3 text-center text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1',
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : 'border-border focus:border-kaviBlue focus:ring-kaviBlue'
            )}
            maxLength={11}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <div className="mt-2 flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <p className="mt-2 text-center text-xs italic text-muted-foreground">
            You can find your BVN by dialing *565*0# on your registered phone number
          </p>
        </div>

        {/* Character Count */}
        <div className="mb-5 text-center">
          <span
            className={cn(
              'text-sm',
              bvn.length === 11 ? 'font-semibold text-kaviBlue' : 'text-muted-foreground'
            )}
          >
            {bvn.length}/11 digits
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || bvn.length !== 11}
            className="flex-1 gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BVNInputModal;
