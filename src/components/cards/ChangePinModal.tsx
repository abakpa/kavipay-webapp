import { useState } from 'react';
import {
  X,
  Lock,
  Key,
  Info,
  Loader2,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import type { VirtualCard } from '@/types/card';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

export function ChangePinModal({ isOpen, onClose, card }: ChangePinModalProps) {
  const { updateCardPIN } = useVirtualCards();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check card brand support for PIN operations
  const cardBrand = card.brand?.toLowerCase();
  const isVirtualDollarCard =
    (cardBrand === 'visa' || cardBrand === 'mastercard') && card.type === 'virtual';
  const supportsChangePIN =
    cardBrand === 'afrigo' || (cardBrand === 'verve' && card.type === 'virtual');

  const validatePins = (): boolean => {
    if (!currentPin || !newPin || !confirmPin) {
      setError('Please fill in all PIN fields');
      return false;
    }

    if (currentPin.length !== 4 || !/^\d+$/.test(currentPin)) {
      setError('Current PIN must be exactly 4 digits');
      return false;
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setError('New PIN must be exactly 4 digits');
      return false;
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return false;
    }

    if (currentPin === newPin) {
      setError('New PIN must be different from current PIN');
      return false;
    }

    // Check for common weak PINs
    const weakPins = ['0000', '1111', '1234', '4321', '9999'];
    if (weakPins.includes(newPin)) {
      setError('Please choose a more secure PIN');
      return false;
    }

    return true;
  };

  const handleChangePIN = async () => {
    if (!validatePins()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateCardPIN(card.id, currentPin, newPin);
      setSuccess('PIN changed successfully');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change PIN';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  // Virtual dollar cards don't need PIN
  if (isVirtualDollarCard) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-bold text-foreground">PIN Management</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
              <CreditCard className="h-7 w-7 text-blue-500" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-foreground">No PIN Required</h3>
            <p className="mb-4 text-muted-foreground">
              Virtual {card.brand} cards are designed for online transactions and don't
              require a PIN.
            </p>

            <div className="rounded-xl bg-kaviBlue/10 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
                <p className="text-sm text-muted-foreground">
                  Use your card number, expiry date, and CVV for online purchases. For
                  added security, consider enabling transaction notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Cards that don't support PIN change
  if (!supportsChangePIN) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-bold text-foreground">PIN Management</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <AlertTriangle className="h-7 w-7 text-amber-500" />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-foreground">
              PIN Change Not Available
            </h3>
            <p className="text-muted-foreground">
              PIN change is not available for this card type. Please contact support if
              you need assistance with your PIN.
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Change PIN</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4 flex items-start gap-3 rounded-xl bg-kaviBlue/10 p-4">
            <Key className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
            <div>
              <p className="font-medium text-foreground">Update Your PIN</p>
              <p className="text-sm text-muted-foreground">
                Enter your current PIN and choose a new secure 4-digit PIN
              </p>
            </div>
          </div>

          {/* Current PIN */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Current PIN
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCurrentPin(val);
                  setError(null);
                }}
                placeholder="••••"
                className="flex-1 bg-transparent text-center text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* New PIN */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              New PIN
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewPin(val);
                  setError(null);
                }}
                placeholder="••••"
                className="flex-1 bg-transparent text-center text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm New PIN */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Confirm New PIN
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setConfirmPin(val);
                  setError(null);
                }}
                placeholder="••••"
                className="flex-1 bg-transparent text-center text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h4 className="mb-2 font-medium text-amber-700 dark:text-amber-400">
              Security Notice
            </h4>
            <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-500">
              <li>• Never share your PIN with anyone</li>
              <li>• Choose a PIN that's not easily guessable</li>
              <li>• Don't use your birthday or sequential numbers</li>
              <li>• Change your PIN regularly for better security</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border p-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleChangePIN}
            disabled={isLoading || !currentPin || !newPin || !confirmPin}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Change PIN
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChangePinModal;
