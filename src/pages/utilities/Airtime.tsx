import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ProviderSelector,
  UtilityAmountInput,
  PaymentMethodSelector,
  TransactionSummary,
  StepIndicator,
} from '@/components/utilities';
import type { CryptoSelection, WalletCurrency } from '@/components/utilities/PaymentMethodSelector';
import { NetworkProviders, MinimumAmounts, ValidationPatterns } from '@/constants/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { useUtilities } from '@/contexts/UtilitiesContext';
import { useTransactionVerification } from '@/hooks/useTransactionVerification';
import { TransactionVerificationModal } from '@/components/verification/TransactionVerificationModal';
import type { NetworkProvider, PaymentMethod } from '@/types/utilities';

const STEPS = ['Details', 'Payment', 'Confirm'];

export function Airtime() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buyAirtime, isLoading, error } = useUtilities();
  const verification = useTransactionVerification();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<NetworkProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cryptoSelection, setCryptoSelection] = useState<CryptoSelection | null>(null);
  const [walletCurrency, setWalletCurrency] = useState<WalletCurrency | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');

  const dollarBalance = user?.dollarBalance ?? 0;
  const nairaBalance = user?.nairaBalance ?? 0;
  const numericAmount = parseInt(amount, 10) || 0;

  const validateStep1 = (): boolean => {
    let isValid = true;

    if (!selectedProvider) {
      isValid = false;
    }

    if (!ValidationPatterns.phoneNumber.test(phoneNumber)) {
      setPhoneError('Please enter a valid 11-digit phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (numericAmount < MinimumAmounts.airtime) {
      setAmountError(`Minimum amount is ₦${MinimumAmounts.airtime}`);
      isValid = false;
    } else {
      setAmountError('');
    }

    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateStep1()) {
        setCurrentStep(1);
      }
    } else if (currentStep === 1) {
      // For wallet, require wallet currency selection; for crypto, require crypto selection
      if ((paymentMethod === 'wallet' && walletCurrency) || (paymentMethod === 'crypto' && cryptoSelection)) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/utilities');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !paymentMethod) return;

    // Request verification before proceeding
    const verificationToken = await verification.requestVerification();
    if (!verificationToken) return; // User cancelled verification

    const result = await buyAirtime({
      network: selectedProvider.id,
      phoneNumber,
      amountInNaira: numericAmount,
      paymentMethod,
      verificationToken,
      ...(paymentMethod === 'crypto' && cryptoSelection && {
        token: cryptoSelection.currency,
        cryptoNetwork: cryptoSelection.network,
      }),
      ...(paymentMethod === 'wallet' && walletCurrency && {
        paymentCurrency: walletCurrency,
      }),
    });

    if (result.success) {
      navigate('/utilities/result', {
        state: {
          success: true,
          type: 'airtime',
          message: 'Airtime purchase successful!',
          details: {
            network: selectedProvider.name,
            phoneNumber,
            amount: `₦${numericAmount.toLocaleString()}`,
          },
        },
      });
    } else {
      navigate('/utilities/result', {
        state: {
          success: false,
          type: 'airtime',
          message: result.message || 'Airtime purchase failed',
        },
      });
    }
  };

  const getSummaryItems = () => {
    const items = [
      { label: 'Network', value: selectedProvider?.name || '-' },
      { label: 'Phone Number', value: phoneNumber || '-' },
      { label: 'Amount', value: `₦${numericAmount.toLocaleString()}` },
      { label: 'Payment Method', value: paymentMethod === 'wallet' ? 'Wallet' : 'Crypto' },
    ];

    if (paymentMethod === 'wallet' && walletCurrency) {
      items.push({ label: 'Wallet', value: `${walletCurrency} Wallet` });
    }

    if (paymentMethod === 'crypto' && cryptoSelection) {
      items.push({ label: 'Crypto', value: `${cryptoSelection.currency.toUpperCase()} (${cryptoSelection.networkName})` });
    }

    items.push({ label: 'Total', value: `₦${numericAmount.toLocaleString()}` });
    return items;
  };

  // Check if payment selection is complete
  const isPaymentSelectionComplete =
    (paymentMethod === 'wallet' && walletCurrency) ||
    (paymentMethod === 'crypto' && cryptoSelection);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Buy Airtime</h1>
          <p className="text-sm text-muted-foreground">
            Purchase airtime for any Nigerian network
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={STEPS} className="mb-6" />

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <>
            <ProviderSelector
              providers={NetworkProviders}
              selectedProvider={selectedProvider}
              onSelect={setSelectedProvider}
              label="Select Network"
            />

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08012345678"
              maxLength={11}
              error={phoneError}
            />

            <UtilityAmountInput
              value={amount}
              onChange={setAmount}
              label="Amount"
              placeholder="Enter amount"
              currency="₦"
              minAmount={MinimumAmounts.airtime}
              quickAmounts={[100, 200, 500, 1000, 2000, 5000]}
              error={amountError}
            />
          </>
        )}

        {currentStep === 1 && (
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            dollarBalance={dollarBalance}
            nairaBalance={nairaBalance}
            amountInNaira={numericAmount}
            selectedCrypto={cryptoSelection}
            onCryptoSelect={setCryptoSelection}
            selectedWalletCurrency={walletCurrency}
            onWalletCurrencySelect={setWalletCurrency}
          />
        )}

        {currentStep === 2 && (
          <>
            <TransactionSummary items={getSummaryItems()} />
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading || verification.isVerifying}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          onClick={currentStep === 2 ? handleSubmit : handleNext}
          disabled={
            isLoading ||
            verification.isVerifying ||
            (currentStep === 0 && (!selectedProvider || !phoneNumber || !amount)) ||
            (currentStep === 1 && !isPaymentSelectionComplete)
          }
          className="flex-1"
        >
          {isLoading || verification.isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : currentStep === 2 ? (
            'Confirm Purchase'
          ) : (
            'Continue'
          )}
        </Button>
      </div>

      {/* Transaction Verification Modal */}
      <TransactionVerificationModal
        activeModal={verification.activeModal}
        closeModal={verification.closeModal}
        onPinSubmit={verification.onPinSubmit}
        pinError={verification.pinError}
        onTOTPSubmit={verification.onTOTPSubmit}
        totpError={verification.totpError}
        onEmailOTPRequest={verification.onEmailOTPRequest}
        onEmailOTPSubmit={verification.onEmailOTPSubmit}
        emailOTPError={verification.emailOTPError}
        emailOTPSent={verification.emailOTPSent}
        maskedEmail={verification.maskedEmail}
        onMethodSelect={verification.onMethodSelect}
        availableMethods={verification.availableMethods}
        isVerifying={verification.isVerifying}
      />
    </div>
  );
}

export default Airtime;
