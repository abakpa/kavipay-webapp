import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Info,
  Loader2,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AmountInput } from '@/components/cards/AmountInput';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { cn } from '@/lib/utils';

// Minimum balance that must remain on card after withdrawal
const MINIMUM_CARD_BALANCE = 1.0;
const MINIMUM_WITHDRAWAL = 1.0;

export function WithdrawCard() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const { cards, selectedCard, selectCard, withdrawFromCard, loadCards } =
    useVirtualCards();

  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Find and select the card from URL params
  useEffect(() => {
    if (cardId && cards.length > 0) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        selectCard(card);
      }
    }
  }, [cardId, cards, selectCard]);

  const currentCard = selectedCard;

  const parsedAmount = useMemo(() => {
    const v = parseFloat(amount);
    return isNaN(v) ? 0 : v;
  }, [amount]);

  const maxWithdrawable = useMemo(() => {
    if (!currentCard) return 0;
    return Math.max(0, currentCard.balance - MINIMUM_CARD_BALANCE);
  }, [currentCard]);

  const isValidAmount = parsedAmount >= MINIMUM_WITHDRAWAL;
  const exceedsBalance = currentCard ? parsedAmount > currentCard.balance : false;
  const exceedsMaxWithdrawable = parsedAmount > maxWithdrawable;

  const validateWithdrawal = (): boolean => {
    if (!currentCard) {
      setError('No card selected');
      return false;
    }

    if (!isValidAmount) {
      setError(`Minimum withdrawal amount is $${MINIMUM_WITHDRAWAL.toFixed(2)}`);
      return false;
    }

    if (exceedsBalance) {
      setError('Amount exceeds available balance');
      return false;
    }

    if (exceedsMaxWithdrawable) {
      setError(
        `Maximum withdrawal is $${maxWithdrawable.toFixed(2)}. A minimum balance of $${MINIMUM_CARD_BALANCE.toFixed(2)} must remain on the card.`
      );
      return false;
    }

    return true;
  };

  const handleWithdrawClick = () => {
    if (!validateWithdrawal()) return;
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!currentCard) return;

    setShowConfirm(false);
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await withdrawFromCard(currentCard.id, parsedAmount);
      await loadCards(true);

      setSuccess(
        `Successfully withdrew $${parsedAmount.toFixed(2)} from your card to your wallet.`
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/cards');
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to process withdrawal. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/cards');
  };

  const handleSetMaxAmount = () => {
    if (maxWithdrawable > 0) {
      setAmount(maxWithdrawable.toFixed(2));
      setError(null);
    }
  };

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-lg">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No Card Selected</h2>
          <p className="text-sm text-muted-foreground">
            Please select a card to proceed with withdrawal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <h1 className="text-2xl font-bold text-foreground">Withdraw Funds</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Transfer funds from your card to your wallet
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 p-4 text-emerald-500">
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Card Balance */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kaviBlue/10">
              <CreditCard className="h-5 w-5 text-kaviBlue" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Available Balance
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${currentCard.balance.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            Card ending in •••• {currentCard.cardNumber.slice(-4)}
          </p>
        </div>

        {/* Amount Input */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Withdrawal Amount</h3>
            {maxWithdrawable > 0 && (
              <button
                type="button"
                onClick={handleSetMaxAmount}
                className="text-sm font-medium text-kaviBlue hover:underline"
              >
                Max: ${maxWithdrawable.toFixed(2)}
              </button>
            )}
          </div>
          <AmountInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setError(null);
            }}
            currency={currentCard.currency}
            disabled={isLoading}
            quickAmounts={[10, 25, 50, 100]}
          />

          {/* Balance After Withdrawal */}
          {isValidAmount && !exceedsMaxWithdrawable && (
            <div className="mt-4 rounded-xl bg-accent/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-medium text-foreground">
                  ${currentCard.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal</span>
                <span className="font-medium text-foreground">
                  -${parsedAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Remaining Balance</span>
                  <span className="text-lg font-bold text-kaviBlue">
                    ${(currentCard.balance - parsedAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Exceeds Balance Warning */}
          {exceedsBalance && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-destructive">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Amount exceeds available balance</span>
            </div>
          )}

          {/* Exceeds Max Withdrawable Warning */}
          {!exceedsBalance && exceedsMaxWithdrawable && parsedAmount > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">
                Maximum withdrawal is ${maxWithdrawable.toFixed(2)}. A minimum balance of
                ${MINIMUM_CARD_BALANCE.toFixed(2)} must remain.
              </span>
            </div>
          )}
        </div>

        {/* Destination Info */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Destination
              </p>
              <p className="font-semibold text-foreground">Your Wallet Balance</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-kaviBlue/20 bg-kaviBlue/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
            <p className="text-sm text-muted-foreground">
              Funds will be transferred to your wallet balance instantly. No additional
              fees apply for withdrawals.
            </p>
          </div>
        </div>

        {/* Withdraw Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleWithdrawClick}
          disabled={
            !isValidAmount || exceedsBalance || exceedsMaxWithdrawable || isLoading
          }
          className={cn('w-full gap-2', isLoading && 'cursor-not-allowed')}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Withdraw${isValidAmount ? ` $${parsedAmount.toFixed(2)}` : ''}`
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">Confirm Withdrawal</h3>
            <p className="mb-6 text-muted-foreground">
              Are you sure you want to withdraw{' '}
              <span className="font-semibold text-foreground">
                ${parsedAmount.toFixed(2)}
              </span>{' '}
              from your card?
            </p>

            <div className="mb-6 rounded-xl bg-accent/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  ${parsedAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-semibold text-foreground">Wallet Balance</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirmWithdraw}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
