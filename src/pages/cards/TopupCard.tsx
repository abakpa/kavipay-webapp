import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AmountInput } from '@/components/cards/AmountInput';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Fee calculation helpers (match backend logic)
const round2 = (v: number): number => Math.round(v * 100) / 100;

const computeTopupFee = (amt: number): number => {
  if (amt <= 100) {
    return round2(amt * 0.03);
  }
  if (amt <= 500) {
    return round2(amt * 0.025);
  }
  return round2(amt * 0.02);
};

export function TopupCard() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const { user } = useAuth();
  const { cards, selectedCard, selectCard, topupCard, loadCards } = useVirtualCards();

  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  const userBalance = user?.gameWalletBalance || 0;

  const parsedAmount = useMemo(() => {
    const v = parseFloat(amount);
    return isNaN(v) ? 0 : v;
  }, [amount]);

  const computedFee = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0) {
      return 0;
    }
    return computeTopupFee(parsedAmount);
  }, [parsedAmount]);

  const receivable = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0) {
      return 0;
    }
    return round2(parsedAmount - computedFee);
  }, [parsedAmount, computedFee]);

  const isValidAmount = parsedAmount > 0;
  const hasEnoughBalance = userBalance >= parsedAmount;

  const validateTopup = (): boolean => {
    if (!currentCard) {
      setError('No card selected');
      return false;
    }

    if (!isValidAmount) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parsedAmount < 1) {
      setError('Minimum topup amount is $1.00');
      return false;
    }

    if (!hasEnoughBalance) {
      setError('Insufficient wallet balance');
      return false;
    }

    return true;
  };

  const handleTopup = async () => {
    if (!validateTopup() || !currentCard) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await topupCard(currentCard.id, parsedAmount);
      await loadCards(true);

      setSuccess(
        `Topup successful! Charged $${round2(parsedAmount).toFixed(2)}. Card credited $${receivable.toFixed(2)}.`
      );

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/cards');
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to process topup. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/cards');
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
            Please select a card to proceed with topup
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

        <h1 className="text-2xl font-bold text-foreground">Card Topup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add funds to your virtual card
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
        {/* Card Information */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kaviBlue/10">
              <CreditCard className="h-5 w-5 text-kaviBlue" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{currentCard.cardholderName}</p>
              <p className="font-mono text-sm text-muted-foreground">
                •••• •••• •••• {currentCard.cardNumber.slice(-4)}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-xl font-bold text-foreground">
              ${currentCard.balance.toFixed(2)}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                {currentCard.currency}
              </span>
            </p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Your Wallet Balance
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            ${userBalance.toFixed(2)}
          </p>
          {!hasEnoughBalance && parsedAmount > 0 && (
            <p className="mt-2 text-sm text-destructive">
              Insufficient balance. You need ${(parsedAmount - userBalance).toFixed(2)}{' '}
              more.
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 font-semibold text-foreground">Enter Amount</h3>
          <AmountInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setError(null);
            }}
            currency={currentCard.currency}
            disabled={isLoading}
          />

          {/* Quick Amount Buttons */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[25, 50, 100, 200].map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => {
                  setAmount(quickAmount.toString());
                  setError(null);
                }}
                disabled={isLoading}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  amount === quickAmount.toString()
                    ? 'bg-kaviBlue text-white'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                )}
              >
                ${quickAmount}
              </button>
            ))}
          </div>

          {/* Fee Breakdown */}
          {isValidAmount && (
            <div className="mt-4 space-y-2 rounded-xl bg-accent/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Topup Amount</span>
                <span className="font-medium text-foreground">
                  ${parsedAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fee (2-3%)</span>
                <span className="font-medium text-foreground">
                  -${computedFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">You will receive</span>
                  <span className="text-lg font-bold text-kaviBlue">
                    ${receivable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-kaviBlue/20 bg-kaviBlue/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
            <p className="text-sm text-muted-foreground">
              Topup amounts are subject to your card limits. Funds will be available
              immediately after successful processing. A small processing fee applies.
            </p>
          </div>
        </div>

        {/* Topup Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleTopup}
          disabled={!isValidAmount || !hasEnoughBalance || isLoading}
          className={cn('w-full gap-2', isLoading && 'cursor-not-allowed')}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Topup Card${isValidAmount ? ` - $${parsedAmount.toFixed(2)}` : ''}`
          )}
        </Button>
      </div>
    </div>
  );
}
