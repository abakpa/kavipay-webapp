import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/contexts/WalletContext';
import { CurrencySelector } from './CurrencySelector';
import { AmountInput } from './AmountInput';
import { PaymentDetails } from './PaymentDetails';
import type { CryptoCurrency, CryptoDeposit, DepositStep } from '@/types/wallet';
import { MIN_DEPOSIT_AMOUNT } from '@/types/wallet';
import { cn } from '@/lib/utils';

interface CryptoDepositFlowProps {
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function CryptoDepositFlow({ onComplete, onCancel, className }: CryptoDepositFlowProps) {
  const { currencies, getCryptoEstimate, createDeposit, getDepositStatus, isLoading, error } =
    useWallet();

  const [step, setStep] = useState<DepositStep>('select');
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null);
  const [amount, setAmount] = useState('');
  const [estimatedCrypto, setEstimatedCrypto] = useState<number | undefined>();
  const [deposit, setDeposit] = useState<CryptoDeposit | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [amountError, setAmountError] = useState<string | undefined>();

  const numAmount = parseFloat(amount) || 0;
  const isValidAmount = numAmount >= MIN_DEPOSIT_AMOUNT;

  // Fetch estimate when amount or currency changes
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!selectedCurrency || !isValidAmount) {
        setEstimatedCrypto(undefined);
        return;
      }

      const estimate = await getCryptoEstimate(numAmount, selectedCurrency.currency);
      if (estimate) {
        setEstimatedCrypto(estimate.estimatedAmount);
      }
    };

    const debounceTimer = setTimeout(fetchEstimate, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, selectedCurrency, numAmount, isValidAmount, getCryptoEstimate]);

  // Poll for deposit status
  useEffect(() => {
    if (step !== 'payment' || !deposit) return;
    if (['finished', 'failed', 'expired', 'refunded'].includes(deposit.status)) return;

    const pollInterval = setInterval(async () => {
      const updated = await getDepositStatus(deposit.id);
      if (updated) {
        setDeposit(updated);
        if (['finished', 'failed', 'expired'].includes(updated.status)) {
          clearInterval(pollInterval);
          if (updated.status === 'finished') {
            setStep('status');
          }
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [step, deposit, getDepositStatus]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const num = parseFloat(value) || 0;
    if (value && num < MIN_DEPOSIT_AMOUNT) {
      setAmountError(`Minimum deposit is $${MIN_DEPOSIT_AMOUNT}`);
    } else {
      setAmountError(undefined);
    }
  };

  const handleContinue = async () => {
    if (step === 'select') {
      if (!selectedCurrency || !isValidAmount) return;

      const newDeposit = await createDeposit(numAmount, selectedCurrency.currency);
      if (newDeposit) {
        setDeposit(newDeposit);
        setStep('payment');
      }
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('select');
      setDeposit(null);
    } else if (step === 'status') {
      onComplete?.();
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!deposit) return;
    setIsRefreshing(true);
    const updated = await getDepositStatus(deposit.id);
    if (updated) {
      setDeposit(updated);
    }
    setIsRefreshing(false);
  }, [deposit, getDepositStatus]);

  const handleDone = () => {
    onComplete?.();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-6">
            {/* Currency Selection */}
            <CurrencySelector
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              onSelect={setSelectedCurrency}
            />

            {/* Amount Input */}
            {selectedCurrency && (
              <AmountInput
                amount={amount}
                onChange={handleAmountChange}
                minAmount={MIN_DEPOSIT_AMOUNT}
                estimatedCrypto={estimatedCrypto}
                cryptoSymbol={selectedCurrency.symbol}
                error={amountError}
              />
            )}
          </div>
        );

      case 'payment':
        return deposit ? (
          <PaymentDetails
            deposit={deposit}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        ) : null;

      case 'status':
        return (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Deposit Successful!</h3>
            <p className="mb-6 text-muted-foreground">
              Your deposit of ${deposit?.priceAmount.toFixed(2)} has been credited to your account.
            </p>
            <Button onClick={handleDone} className="w-full max-w-xs">
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Deposit Funds';
      case 'payment':
        return 'Complete Payment';
      case 'status':
        return 'Deposit Complete';
      default:
        return 'Deposit';
    }
  };

  const canContinue = selectedCurrency && isValidAmount && !amountError;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        {step !== 'status' && (
          <button
            onClick={step === 'select' ? onCancel : handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <div>
          <h2 className="text-xl font-bold text-foreground">{getStepTitle()}</h2>
          {step === 'select' && (
            <p className="text-sm text-muted-foreground">
              Choose cryptocurrency and enter amount
            </p>
          )}
          {step === 'payment' && (
            <p className="text-sm text-muted-foreground">
              Send the exact amount to the address below
            </p>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {step !== 'status' && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 flex-1 rounded-full',
              step === 'select' ? 'bg-kaviBlue' : 'bg-kaviBlue'
            )}
          />
          <div
            className={cn(
              'h-2 flex-1 rounded-full',
              step === 'payment' ? 'bg-kaviBlue' : 'bg-border'
            )}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Actions */}
      {step === 'select' && (
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!canContinue || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Deposit...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default CryptoDepositFlow;
