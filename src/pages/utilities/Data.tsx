import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ProviderSelector,
  DataBundleSelector,
  PaymentMethodSelector,
  TransactionSummary,
  StepIndicator,
} from '@/components/utilities';
import { DataNetworkProviders, ValidationPatterns } from '@/constants/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { useUtilities } from '@/contexts/UtilitiesContext';
import type { NetworkProvider, DataBundle, PaymentMethod } from '@/types/utilities';

const STEPS = ['Details', 'Plan', 'Payment', 'Confirm'];

export function Data() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadDataBundles, buyData, dataBundles, isLoading, error } = useUtilities();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<NetworkProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [isBundlesLoading, setIsBundlesLoading] = useState(false);

  const walletBalance = user?.gameWalletBalance ?? 0;

  // Load data bundles when provider changes
  useEffect(() => {
    if (selectedProvider) {
      setIsBundlesLoading(true);
      loadDataBundles(selectedProvider.id).finally(() => setIsBundlesLoading(false));
      setSelectedBundle(null);
    }
  }, [selectedProvider, loadDataBundles]);

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

    return isValid;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (validateStep1()) {
        setCurrentStep(1);
      }
    } else if (currentStep === 1) {
      if (selectedBundle) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (paymentMethod) {
        setCurrentStep(3);
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
    if (!selectedProvider || !selectedBundle || !paymentMethod) return;

    const result = await buyData({
      phoneNumber,
      amountInNaira: selectedBundle.amount,
      network: selectedProvider.id,
      variationCode: selectedBundle.variationCode,
      paymentMethod,
    });

    if (result.success) {
      navigate('/utilities/result', {
        state: {
          success: true,
          type: 'data',
          message: 'Data bundle purchase successful!',
          details: {
            network: selectedProvider.name,
            phoneNumber,
            plan: selectedBundle.name,
            amount: `₦${selectedBundle.amount.toLocaleString()}`,
          },
        },
      });
    } else {
      navigate('/utilities/result', {
        state: {
          success: false,
          type: 'data',
          message: result.message || 'Data bundle purchase failed',
        },
      });
    }
  };

  const getSummaryItems = () => [
    { label: 'Network', value: selectedProvider?.name.replace(' Data', '') || '-' },
    { label: 'Phone Number', value: phoneNumber || '-' },
    { label: 'Plan', value: selectedBundle?.name || '-' },
    { label: 'Payment Method', value: paymentMethod === 'wallet' ? 'Wallet' : 'Crypto' },
    { label: 'Total', value: `₦${(selectedBundle?.amount || 0).toLocaleString()}`, highlight: true },
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
          <h1 className="text-xl font-bold text-foreground">Buy Data</h1>
          <p className="text-sm text-muted-foreground">
            Purchase data bundles for any Nigerian network
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
              providers={DataNetworkProviders}
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
          </>
        )}

        {currentStep === 1 && (
          <DataBundleSelector
            bundles={dataBundles}
            selectedBundle={selectedBundle}
            onSelect={(bundle) => setSelectedBundle(bundle as DataBundle)}
            label="Select Data Plan"
            isLoading={isBundlesLoading}
          />
        )}

        {currentStep === 2 && (
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            walletBalance={walletBalance}
            requiredAmount={(selectedBundle?.amount || 0) / 1500}
          />
        )}

        {currentStep === 3 && (
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
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
        )}
        <Button
          onClick={currentStep === 3 ? handleSubmit : handleNext}
          disabled={
            isLoading ||
            isBundlesLoading ||
            (currentStep === 0 && (!selectedProvider || !phoneNumber)) ||
            (currentStep === 1 && !selectedBundle) ||
            (currentStep === 2 && !paymentMethod)
          }
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : currentStep === 3 ? (
            'Confirm Purchase'
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

export default Data;
