import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useAuth } from '@/contexts/AuthContext';
import { getNairaExchangeRate } from '@/lib/api/deposit';
import { cn } from '@/lib/utils';

// Fee calculation helpers (match backend logic)
const round2 = (v: number): number => Math.round(v * 100) / 100;
const computeTopupFee = (amt: number): number => round2(amt * 0.02);

const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'NGN') {
    return `₦${new Intl.NumberFormat('en-NG').format(amount)}`;
  }
  return `$${amount.toFixed(2)}`;
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
  const [fundFromUsd, setFundFromUsd] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1500);

  // Find and select the card from URL params
  useEffect(() => {
    if (cardId && cards.length > 0) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        selectCard(card);
      }
    }
  }, [cardId, cards, selectCard]);

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rateData = await getNairaExchangeRate();
        if (rateData?.rate) {
          setExchangeRate(rateData.rate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };
    fetchExchangeRate();
  }, []);

  const currentCard = selectedCard;

  // Determine currency from card
  const isNairaCard = currentCard?.currency?.toUpperCase() === 'NGN';
  const usingUsdForNgn = isNairaCard && fundFromUsd;
  const currencySymbol = usingUsdForNgn ? '$' : isNairaCard ? '₦' : '$';

  // Wallet balances
  const dollarBalance = user?.dollarBalance ?? 0;
  const nairaBalance = user?.nairaBalance ?? 0;
  const walletBalance = usingUsdForNgn ? dollarBalance : isNairaCard ? nairaBalance : dollarBalance;
  const walletLabel = usingUsdForNgn ? 'USD Wallet' : isNairaCard ? 'Naira Wallet' : 'USD Wallet';

  // Quick amounts based on currency and funding source
  const quickAmounts = usingUsdForNgn
    ? [5, 10, 25, 50]
    : isNairaCard
      ? [10000, 25000, 50000, 100000]
      : [25, 50, 100, 200];

  const parsedAmount = useMemo(() => {
    const v = parseFloat(amount);
    return isNaN(v) ? 0 : v;
  }, [amount]);

  // For cross-currency (USD → NGN card), compute the NGN equivalent
  const ngnEquivalent = useMemo(() => {
    if (!usingUsdForNgn || !parsedAmount || parsedAmount <= 0) return 0;
    return round2(parsedAmount * exchangeRate);
  }, [usingUsdForNgn, parsedAmount, exchangeRate]);

  // Fee only applies to USD card topups
  const computedFee = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0 || isNairaCard) return 0;
    return computeTopupFee(parsedAmount);
  }, [parsedAmount, isNairaCard]);

  // What the card receives (always in card's native currency)
  const receivable = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0) return 0;
    if (isNairaCard) return usingUsdForNgn ? ngnEquivalent : parsedAmount;
    return round2(parsedAmount - computedFee);
  }, [parsedAmount, isNairaCard, usingUsdForNgn, ngnEquivalent, computedFee]);

  // Check if wallet has sufficient funds
  const hasInsufficientBalance = parsedAmount > 0 && walletBalance < parsedAmount;
  const isValidAmount = amount && parseFloat(amount) > 0;
  const canTopup = isValidAmount && !hasInsufficientBalance && !isLoading;

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setError(null);
  };

  const handleTopup = async () => {
    if (!currentCard || !amount) return;

    const topupAmount = parseFloat(amount);
    if (isNaN(topupAmount) || topupAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const effectiveCurrencyLabel = usingUsdForNgn ? 'USD' : currentCard.currency;
    if (walletBalance < topupAmount) {
      setError(
        `You need ${formatCurrency(topupAmount, effectiveCurrencyLabel)} but only have ${formatCurrency(walletBalance, effectiveCurrencyLabel)} in your ${walletLabel}`
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the topup API with optional sourceCurrency for cross-currency
      const sourceCurrency = usingUsdForNgn ? 'USD' : undefined;
      await topupCard(currentCard.id, topupAmount, sourceCurrency);
      await loadCards(true);

      if (usingUsdForNgn) {
        setSuccess(
          `Charged $${topupAmount.toFixed(2)}. Card credited ${formatCurrency(receivable, 'NGN')}.`
        );
      } else {
        setSuccess(
          `Charged ${formatCurrency(topupAmount, currentCard.currency)}. Card credited ${formatCurrency(receivable, currentCard.currency)}.`
        );
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/cards');
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to process topup. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = () => {
    if (usingUsdForNgn || !isNairaCard) {
      navigate('/deposit');
    } else {
      navigate('/deposit/naira');
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

      <div className="space-y-4">
        {/* Card Information */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-kaviBlue" />
            <span className="font-semibold text-foreground">{currentCard.cardholderName}</span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            •••• •••• •••• {currentCard.cardNumber.slice(-4)}
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">
            Current Balance: {formatCurrency(currentCard.balance, currentCard.currency)}
          </p>
        </div>

        {/* Wallet Selector (NGN cards only) */}
        {isNairaCard && (
          <div className="flex rounded-lg bg-accent p-1">
            <button
              onClick={() => {
                setFundFromUsd(false);
                setAmount('');
                setError(null);
              }}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                !fundFromUsd
                  ? 'bg-kaviBlue text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Naira Wallet
            </button>
            <button
              onClick={() => {
                setFundFromUsd(true);
                setAmount('');
                setError(null);
              }}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                fundFromUsd
                  ? 'bg-kaviBlue text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              USD Wallet
            </button>
          </div>
        )}

        {/* Wallet Balance Info */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-1 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Funding from {walletLabel}</span>
          </div>
          <p className="ml-6 text-lg font-semibold text-foreground">
            Available: {formatCurrency(walletBalance, usingUsdForNgn ? 'USD' : currentCard.currency)}
          </p>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Enter Amount</h3>
          <div
            className={cn(
              'flex items-center rounded-lg border bg-card px-4 py-3',
              hasInsufficientBalance ? 'border-destructive' : 'border-border'
            )}
          >
            <span className="mr-2 text-lg font-bold text-foreground">{currencySymbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                  setAmount(value);
                  setError(null);
                }
              }}
              placeholder="0.00"
              disabled={isLoading}
              className="flex-1 bg-transparent text-lg font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Fee breakdown */}
          {isValidAmount && !hasInsufficientBalance && (
            <div className="space-y-1 text-sm">
              {usingUsdForNgn ? (
                <>
                  <p className="text-muted-foreground">You pay: ${parsedAmount.toFixed(2)}</p>
                  <p className="text-muted-foreground">
                    NGN equivalent: {formatCurrency(ngnEquivalent, 'NGN')}
                  </p>
                  <p className="text-foreground">
                    Card receives: {formatCurrency(receivable, 'NGN')}
                  </p>
                </>
              ) : isNairaCard ? (
                <p className="text-foreground">
                  Card will receive: {formatCurrency(receivable, 'NGN')}
                </p>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Fee (2%): {formatCurrency(computedFee, currentCard.currency)}
                  </p>
                  <p className="text-foreground">
                    Card will receive: {formatCurrency(receivable, currentCard.currency)}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Insufficient Balance Warning */}
          {hasInsufficientBalance && (
            <div className="rounded-lg bg-destructive/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-semibold text-destructive">Insufficient Balance</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                You need {formatCurrency(parsedAmount, usingUsdForNgn ? 'USD' : currentCard.currency)}{' '}
                but only have{' '}
                {formatCurrency(walletBalance, usingUsdForNgn ? 'USD' : currentCard.currency)}
              </p>

              {/* Deposit Option */}
              <button
                onClick={handleDeposit}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kaviBlue/10">
                    <Wallet className="h-5 w-5 text-kaviBlue" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Deposit</p>
                    <p className="text-xs text-muted-foreground">
                      Add {usingUsdForNgn ? 'funds' : isNairaCard ? 'Naira' : 'funds'} to your wallet
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Hint to switch wallets */}
              {isNairaCard && !fundFromUsd && dollarBalance > 0 && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  You have ${dollarBalance.toFixed(2)} in your USD wallet. Try funding from USD
                  instead.
                </p>
              )}
              {isNairaCard && fundFromUsd && nairaBalance > 0 && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  You have {formatCurrency(nairaBalance, 'NGN')} in your Naira wallet. Try switching
                  to Naira.
                </p>
              )}
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="flex justify-between gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                disabled={isLoading}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  amount === quickAmount.toString()
                    ? 'bg-kaviBlue text-white'
                    : 'bg-accent text-foreground hover:bg-accent/80'
                )}
              >
                {usingUsdForNgn
                  ? `$${quickAmount}`
                  : isNairaCard
                    ? `₦${(quickAmount / 1000).toFixed(0)}k`
                    : `$${quickAmount}`}
              </button>
            ))}
          </div>
        </div>

        {/* Topup Button */}
        <Button
          type="button"
          size="lg"
          onClick={handleTopup}
          disabled={!canTopup}
          className={cn('w-full gap-2', isLoading && 'cursor-not-allowed')}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Topup Card'
          )}
        </Button>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground">
          Topup amounts are subject to your card limits and verification requirements. Funds will be
          available immediately after successful processing.
        </p>
      </div>
    </div>
  );
}
