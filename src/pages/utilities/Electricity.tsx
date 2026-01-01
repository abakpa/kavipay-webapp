import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ProviderSelector,
  UtilityAmountInput,
  PaymentMethodSelector,
  TransactionSummary,
  StepIndicator,
} from '@/components/utilities';
import { ElectricityProviders, MinimumAmounts, ValidationPatterns } from '@/constants/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { useUtilities } from '@/contexts/UtilitiesContext';
import { cn } from '@/lib/utils';
import type { ElectricityProvider, PaymentMethod } from '@/types/utilities';

const STEPS = ['Provider', 'Verify', 'Amount', 'Payment', 'Confirm'];

type MeterType = 'prepaid' | 'postpaid';

export function Electricity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { verifyMeterNumber, buyPower, meterVerification, clearMeterVerification, isLoading, error } = useUtilities();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<ElectricityProvider | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('prepaid');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [meterError, setMeterError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const walletBalance = user?.gameWalletBalance ?? 0;
  const numericAmount = parseInt(amount, 10) || 0;

  const handleVerifyMeter = async () => {
    if (!selectedProvider) return;

    if (!ValidationPatterns.meterNumber.test(meterNumber)) {
      setMeterError('Please enter a valid meter number (11-13 digits)');
      return;
    }
    setMeterError('');

    setIsVerifying(true);
    try {
      const result = await verifyMeterNumber({
        meterNumber,
        serviceId: selectedProvider.serviceId,
        serviceType: meterType,
      });

      if (result?.success) {
        setCurrentStep(2);
      }
    } catch {
      setMeterError('Failed to verify meter number');
    } finally {
      setIsVerifying(false);
    }
  };

  const validateAmount = (): boolean => {
    let isValid = true;

    if (!ValidationPatterns.phoneNumber.test(phoneNumber)) {
      setPhoneError('Please enter a valid 11-digit phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (numericAmount < MinimumAmounts.electricity) {
      setAmountError(`Minimum amount is ₦${MinimumAmounts.electricity}`);
      isValid = false;
    } else {
      setAmountError('');
    }

    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (selectedProvider) {
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      if (validateAmount()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (paymentMethod) {
        setCurrentStep(4);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      clearMeterVerification();
      setCurrentStep(1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/utilities');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !paymentMethod) return;

    const result = await buyPower({
      meterNumber,
      amountInNaira: numericAmount,
      serviceId: selectedProvider.serviceId,
      serviceType: meterType,
      phoneNumber,
      paymentMethod,
    });

    if (result.success) {
      navigate('/utilities/result', {
        state: {
          success: true,
          type: 'electricity',
          message: 'Electricity purchase successful!',
          details: {
            provider: selectedProvider.shortName,
            meterNumber,
            customerName: meterVerification?.customerName,
            amount: `₦${numericAmount.toLocaleString()}`,
            token: result.data?.token,
          },
        },
      });
    } else {
      navigate('/utilities/result', {
        state: {
          success: false,
          type: 'electricity',
          message: result.message || 'Electricity purchase failed',
        },
      });
    }
  };

  const getSummaryItems = () => [
    { label: 'Provider', value: selectedProvider?.shortName || '-' },
    { label: 'Meter Number', value: meterNumber || '-' },
    { label: 'Meter Type', value: meterType === 'prepaid' ? 'Prepaid' : 'Postpaid' },
    { label: 'Customer Name', value: meterVerification?.customerName || '-' },
    { label: 'Phone Number', value: phoneNumber || '-' },
    { label: 'Payment Method', value: paymentMethod === 'wallet' ? 'Wallet' : 'Crypto' },
    { label: 'Total', value: `₦${numericAmount.toLocaleString()}`, highlight: true },
  ];

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
          <h1 className="text-xl font-bold text-foreground">Buy Electricity</h1>
          <p className="text-sm text-muted-foreground">
            Pay your electricity bills
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={STEPS} className="mb-6" />

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <ProviderSelector
            providers={ElectricityProviders.map(p => ({ id: p.serviceId, name: p.name, shortName: p.shortName }))}
            selectedProvider={selectedProvider ? { id: selectedProvider.serviceId, name: selectedProvider.name, shortName: selectedProvider.shortName } : null}
            onSelect={(p) => setSelectedProvider(ElectricityProviders.find(ep => ep.serviceId === p.id) || null)}
            label="Select Electricity Provider"
          />
        )}

        {currentStep === 1 && (
          <>
            {/* Meter Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Meter Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['prepaid', 'postpaid'] as MeterType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMeterType(type)}
                    className={cn(
                      'rounded-lg border p-3 text-center font-medium transition-all',
                      meterType === type
                        ? 'border-kaviBlue bg-kaviBlue/10 text-kaviBlue ring-1 ring-kaviBlue'
                        : 'border-border bg-card text-foreground hover:border-kaviBlue/50'
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Meter Number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              placeholder="Enter your meter number"
              error={meterError}
            />

            <Button
              onClick={handleVerifyMeter}
              disabled={isVerifying || !meterNumber}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Meter'
              )}
            </Button>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        )}

        {currentStep === 2 && meterVerification && (
          <>
            {/* Verified Customer Info */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-500">Meter Verified</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{meterVerification.customerName}</span>
                </div>
                {meterVerification.customerAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-foreground">{meterVerification.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>

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
              minAmount={MinimumAmounts.electricity}
              quickAmounts={[1000, 2000, 5000, 10000, 20000]}
              error={amountError}
            />
          </>
        )}

        {currentStep === 3 && (
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            walletBalance={walletBalance}
            requiredAmount={numericAmount / 1500}
          />
        )}

        {currentStep === 4 && (
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
        {currentStep > 0 && currentStep !== 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {currentStep !== 1 && (
          <Button
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={
              isLoading ||
              (currentStep === 0 && !selectedProvider) ||
              (currentStep === 2 && (!phoneNumber || !amount)) ||
              (currentStep === 3 && !paymentMethod)
            }
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentStep === 4 ? (
              'Confirm Purchase'
            ) : (
              'Continue'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default Electricity;
