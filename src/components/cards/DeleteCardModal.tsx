import { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import type { VirtualCard } from '@/types/card';

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
  onDeleted?: () => void;
}

export function DeleteCardModal({
  isOpen,
  onClose,
  card,
  onDeleted,
}: DeleteCardModalProps) {
  const { deleteCard } = useVirtualCards();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const expectedConfirmText = 'DELETE';
  const isConfirmed = confirmText.toUpperCase() === expectedConfirmText;

  const handleDelete = async () => {
    if (!isConfirmed) {
      setError(`Please type "${expectedConfirmText}" to confirm`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteCard(card.id);
      onDeleted?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete card';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError(null);
    onClose();
  };

  const hasBalance = card.balance > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Delete Card</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Warning Icon */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Delete This Card?
            </h3>
            <p className="text-muted-foreground">
              This action cannot be undone. The card will be permanently removed from
              your account.
            </p>
          </div>

          {/* Card Info */}
          <div className="mb-6 rounded-xl border border-border bg-accent/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kaviBlue/10">
                <CreditCard className="h-5 w-5 text-kaviBlue" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{card.cardholderName}</p>
                <p className="font-mono text-sm text-muted-foreground">
                  •••• •••• •••• {card.cardNumber.slice(-4)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  ${card.balance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{card.currency}</p>
              </div>
            </div>
          </div>

          {/* Balance Warning */}
          {hasBalance && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Card Has Remaining Balance
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-500">
                    This card still has ${card.balance.toFixed(2)} balance. Consider
                    withdrawing funds before deleting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Type <span className="font-bold text-destructive">{expectedConfirmText}</span>{' '}
              to confirm deletion
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder="Type DELETE to confirm"
              className="w-full rounded-xl border border-destructive/30 bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
              disabled={isLoading}
            />
          </div>

          {/* What happens notice */}
          <div className="rounded-xl bg-accent/50 p-3">
            <p className="mb-2 text-sm font-medium text-foreground">
              What happens when you delete:
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Card will be permanently terminated</li>
              <li>• All pending transactions will be cancelled</li>
              <li>• Transaction history will be retained for records</li>
              <li>• This action cannot be reversed</li>
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
            variant="destructive"
            className="flex-1 gap-2"
            onClick={handleDelete}
            disabled={isLoading || !isConfirmed}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Card
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteCardModal;
