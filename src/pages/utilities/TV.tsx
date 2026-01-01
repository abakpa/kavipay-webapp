import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ProviderSelector,
  DataBundleSelector,
  PaymentMethodSelector,
  TransactionSummary,
  StepIndicator,
} from '@/components/utilities';
import { useAuth } from '@/contexts/AuthContext';
import { useUtilities } from '@/contexts/UtilitiesContext';
import { ValidationPatterns, TvProviders as DefaultTvProviders } from '@/constants/utilities';
import type { TvProvider, TvPackage, PaymentMethod } from '@/types/utilities';

const STEPS = ['Provider', 'Verify', 'Package', 'Payment', 'Confirm'];

export function TV() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loadTvProviders,
    loadTvPackages,
    verifySmartCardNumber,
    subscribeTv,
    tvProviders,
    tvPackages,
    smartCardVerification,
    clearSmartCardVerification,
    isLoading,
    error,
  } = useUtilities();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<TvProvider | null>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<TvPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [cardError, setCardError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const walletBalance = user?.gameWalletBalance ?? 0;

  // Use hardcoded providers as fallback, or API providers if available
  const availableProviders = tvProviders.length > 0 ? tvProviders : DefaultTvProviders;

  // Load TV providers on mount (optional - we have fallback)
  useEffect(() => {
    loadTvProviders();
  }, [loadTvProviders]);

  // Load packages when provider changes
  useEffect(() => {
    if (selectedProvider) {
      setIsLoadingPackages(true);
      loadTvPackages(selectedProvider.serviceId).finally(() => setIsLoadingPackages(false));
      setSelectedPackage(null);
    }
  }, [selectedProvider, loadTvPackages]);

  const handleVerifyCard = async () => {
    if (!selectedProvider) return;

    if (!ValidationPatterns.smartCardNumber.test(smartCardNumber)) {
      setCardError('Please enter a valid smart card number (10-12 digits)');
      return;
    }
    setCardError('');

    if (!ValidationPatterns.phoneNumber.test(phoneNumber)) {
      setPhoneError('Please enter a valid 11-digit phone number');
      return;
    }
    setPhoneError('');

    setIsVerifying(true);
    try {
      const result = await verifySmartCardNumber({
        cardNumber: smartCardNumber,
        serviceId: selectedProvider.serviceId,
      });

      if (result?.success) {
        setCurrentStep(2);
      }
    } catch {
      setCardError('Failed to verify smart card number');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (selectedProvider) {
        setCurrentStep(1);
      }
    } else if (currentStep === 2) {
      if (selectedPackage) {
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
      clearSmartCardVerification();
      setCurrentStep(1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/utilities');
    }
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !selectedPackage || !paymentMethod) return;

    const result = await subscribeTv({
      cardNumber: smartCardNumber,
      amountInNaira: selectedPackage.amount,
      serviceId: selectedProvider.serviceId,
      variationCode: selectedPackage.variationCode,
      phoneNumber,
      paymentMethod,
    });

    if (result.success) {
      navigate('/utilities/result', {
        state: {
          success: true,
          type: 'tv',
          message: 'TV subscription successful!',
          details: {
            provider: selectedProvider.name,
            smartCardNumber,
            customerName: smartCardVerification?.customerName,
            package: selectedPackage.name,
            amount: `₦${selectedPackage.amount.toLocaleString()}`,
          },
        },
      });
    } else {
      navigate('/utilities/result', {
        state: {
          success: false,
          type: 'tv',
          message: result.message || 'TV subscription failed',
        },
      });
    }
  };

  const getSummaryItems = () => [
    { label: 'Provider', value: selectedProvider?.name || '-' },
    { label: 'Smart Card', value: smartCardNumber || '-' },
    { label: 'Customer Name', value: smartCardVerification?.customerName || '-' },
    { label: 'Current Package', value: smartCardVerification?.currentPackage || '-' },
    { label: 'New Package', value: selectedPackage?.name || '-' },
    { label: 'Phone Number', value: phoneNumber || '-' },
    { label: 'Payment Method', value: paymentMethod === 'wallet' ? 'Wallet' : 'Crypto' },
    { label: 'Total', value: `₦${(selectedPackage?.amount || 0).toLocaleString()}`, highlight: true },
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
          <h1 className="text-xl font-bold text-foreground">TV Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Pay for DSTV, GOtv and more
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={STEPS} className="mb-6" />

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <ProviderSelector
            providers={availableProviders.map(p => ({ id: p.serviceId, name: p.name }))}
            selectedProvider={selectedProvider ? { id: selectedProvider.serviceId, name: selectedProvider.name } : null}
            onSelect={(p) => setSelectedProvider(availableProviders.find(tp => tp.serviceId === p.id) || null)}
            label="Select TV Provider"
          />
        )}

        {currentStep === 1 && (
          <>
            <Input
              label="Smart Card / IUC Number"
              value={smartCardNumber}
              onChange={(e) => setSmartCardNumber(e.target.value)}
              placeholder="Enter your smart card number"
              error={cardError}
            />

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="08012345678"
              maxLength={11}
              error={phoneError}
            />

            <Button
              onClick={handleVerifyCard}
              disabled={isVerifying || !smartCardNumber || !phoneNumber}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Smart Card'
              )}
            </Button>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        )}

        {currentStep === 2 && smartCardVerification && (
          <>
            {/* Verified Customer Info */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-500">Smart Card Verified</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{smartCardVerification.customerName}</span>
                </div>
                {smartCardVerification.currentPackage && (
                  <div className="text-sm text-muted-foreground">
                    Current Package: <span className="text-foreground">{smartCardVerification.currentPackage}</span>
                  </div>
                )}
              </div>
            </div>

            <DataBundleSelector
              bundles={tvPackages}
              selectedBundle={selectedPackage}
              onSelect={(bundle) => setSelectedPackage(bundle as TvPackage)}
              label="Select Package"
              isLoading={isLoadingPackages}
            />
          </>
        )}

        {currentStep === 3 && (
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            walletBalance={walletBalance}
            requiredAmount={(selectedPackage?.amount || 0) / 1500}
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
              isLoadingPackages ||
              (currentStep === 0 && !selectedProvider) ||
              (currentStep === 2 && !selectedPackage) ||
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
              'Confirm Subscription'
            ) : (
              'Continue'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default TV;
