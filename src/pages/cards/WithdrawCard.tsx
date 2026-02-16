import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowDownCircle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }
  return `$${amount.toFixed(2)}`;
};

export function WithdrawCard() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const { cards, selectedCard, selectCard, withdrawFromCard, loadCards } = useVirtualCards();

  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const isNaira = currentCard?.currency?.toUpperCase() === 'NGN';
  const currencySymbol = isNaira ? '₦' : '$';

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
      setError(null);
    }
  };

  const validateWithdrawal = (): boolean => {
    if (!currentCard) {
      setError('Card not found');
      return false;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid withdrawal amount');
      return false;
    }

    if (withdrawalAmount > currentCard.balance) {
      setError('You cannot withdraw more than your available balance');
      return false;
    }

    if (withdrawalAmount < 1.0) {
      setError(`Minimum withdrawal amount is ${currencySymbol}1.00`);
      return false;
    }

    // minimum card balance after withdrawal is 1.00
    if (currentCard.balance - withdrawalAmount < 1.0) {
      setError(`Minimum card balance is ${currencySymbol}1.00 after withdrawal`);
      return false;
    }

    return true;
  };

  const handleWithdrawalClick = () => {
    if (!validateWithdrawal()) return;
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!currentCard) return;

    setShowConfirm(false);
    setIsLoading(true);
    setError(null);

    try {
      await withdrawFromCard(currentCard.id, parseFloat(amount));
      await loadCards(true);

      // Navigate back after success
      navigate('/cards');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to process withdrawal. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/cards');
  };

  const parsedAmount = parseFloat(amount) || 0;
  const exceedsBalance = currentCard ? parsedAmount > currentCard.balance : false;
  const isButtonDisabled = !amount || parsedAmount <= 0 || isLoading;

  if (!currentCard) {
    return (
      <div className="mx-auto max-w-lg">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-kaviBlue" />
          <p className="text-sm text-muted-foreground">Loading card...</p>
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Balance Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-2 text-sm uppercase tracking-wider text-muted-foreground">
            Available Balance
          </p>
          <p className="text-3xl font-extrabold text-foreground">
            {formatCurrency(currentCard.balance, currentCard.currency)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Card ending in •••• {currentCard.cardNumber.slice(-4)}
          </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Withdrawal Amount</h3>
          <div
            className={cn(
              'flex items-center rounded-lg border bg-card px-4 py-3',
              amount && 'border-kaviBlue border-2',
              exceedsBalance && 'border-destructive border-2'
            )}
          >
            <span className="mr-2 text-2xl font-semibold text-foreground">{currencySymbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              maxLength={10}
              className="flex-1 bg-transparent py-2 text-2xl font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="flex items-start gap-3 rounded-lg bg-kaviBlue/10 p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-kaviBlue" />
          <div>
            <p className="font-semibold text-kaviBlue">Withdrawal Information</p>
            <p className="mt-1 text-sm text-foreground">
              Funds will be transferred to your {isNaira ? 'Naira' : 'Dollar'} wallet instantly. No
              additional fees apply.
            </p>
          </div>
        </div>

        {/* Error Message - Amount exceeds balance */}
        {exceedsBalance && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">Amount exceeds available balance</p>
          </div>
        )}

        {/* Withdraw Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleWithdrawalClick}
          disabled={isButtonDisabled || exceedsBalance}
          className={cn(
            'w-full gap-2 shadow-lg',
            isLoading && 'cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ArrowDownCircle className="h-5 w-5" />
              Withdraw Funds
            </>
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
                {formatCurrency(parsedAmount, currentCard.currency)}
              </span>{' '}
              from your card?
            </p>

            <div className="mb-6 rounded-xl bg-accent/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(parsedAmount, currentCard.currency)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-semibold text-foreground">
                  {isNaira ? 'Naira' : 'Dollar'} Wallet
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirmWithdraw}>
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
