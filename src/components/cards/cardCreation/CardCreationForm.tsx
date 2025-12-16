import { useState, useEffect, useMemo } from 'react';
import { CreditCard, Wallet, ChevronDown, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import {
  SupportedCurrency,
  SupportedBrand,
  CardType,
  CardProvider,
} from '@/types/card';
import {
  CARD_CONFIGURATIONS,
  CARD_TYPE_OPTIONS,
  CURRENCY_OPTIONS,
  BRAND_OPTIONS,
  PROVIDER_OPTIONS,
  MIN_INITIAL_BALANCE,
  MAX_INITIAL_BALANCE,
  type CardCreationFormData,
  type CardCreationSubmitData,
  INITIAL_FORM_DATA,
} from './constants';

interface CardCreationFormProps {
  onSubmit: (formData: CardCreationSubmitData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CardCreationForm({
  onSubmit,
  onCancel,
  loading = false,
}: CardCreationFormProps) {
  const { preOrders } = useVirtualCards();
  const [formData, setFormData] = useState<CardCreationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Check if user has a pending pre-order for the selected currency AND type
  const pendingPreOrderForConfig = useMemo(() => {
    const pendingStatuses = ['pending_kyc', 'kyc_approved', 'processing'];
    return preOrders.find(
      (preOrder) =>
        pendingStatuses.includes(preOrder.status) &&
        preOrder.currency.toUpperCase() === formData.currency &&
        preOrder.type === formData.type
    );
  }, [preOrders, formData.currency, formData.type]);

  // Get available brands based on currency and card type
  const getAvailableBrands = (): readonly SupportedBrand[] => {
    const config = CARD_CONFIGURATIONS[formData.currency]?.[formData.type];
    return config?.brands || [];
  };

  // Check if provider selection should be shown (only for USD virtual cards)
  const shouldShowProviderSelection = (): boolean => {
    return (
      formData.type === CardType.VIRTUAL &&
      formData.currency === SupportedCurrency.USD
    );
  };

  // Get provider based on selection or auto-determine
  const getProvider = (): CardProvider | null => {
    if (formData.type === CardType.PHYSICAL) {
      return CardProvider.SUDO;
    }
    if (formData.currency === SupportedCurrency.NGN) {
      return CardProvider.SUDO;
    }
    if (shouldShowProviderSelection()) {
      return formData.provider;
    }
    const config = CARD_CONFIGURATIONS[formData.currency]?.[formData.type];
    return config?.provider || null;
  };

  // Get brand options for dropdown
  const getBrandOptions = () => {
    const availableBrands = getAvailableBrands();
    return BRAND_OPTIONS.filter((option) =>
      availableBrands.includes(option.value)
    );
  };

  // Check if current combination is available
  const isConfigurationAvailable = () => {
    const availableBrands = getAvailableBrands();
    return availableBrands.length > 0;
  };

  // Auto-select first available brand when currency or type changes
  useEffect(() => {
    const config = CARD_CONFIGURATIONS[formData.currency]?.[formData.type];
    const availableBrands: readonly SupportedBrand[] = config?.brands || [];
    if (
      availableBrands.length > 0 &&
      !availableBrands.includes(formData.brand)
    ) {
      setFormData((prev) => ({ ...prev, brand: availableBrands[0] }));
    }
  }, [formData.currency, formData.type, formData.brand]);

  // Auto-select provider for non-USD virtual cards
  useEffect(() => {
    const isUsdVirtual =
      formData.type === CardType.VIRTUAL &&
      formData.currency === SupportedCurrency.USD;

    if (!isUsdVirtual) {
      if (
        formData.type === CardType.PHYSICAL ||
        formData.currency === SupportedCurrency.NGN
      ) {
        if (formData.provider !== CardProvider.SUDO) {
          setFormData((prev) => ({ ...prev, provider: CardProvider.SUDO }));
        }
      }
    }
  }, [formData.type, formData.currency, formData.provider]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate provider selection for USD virtual cards
    if (shouldShowProviderSelection() && !formData.provider) {
      newErrors.provider = 'Please select a card provider';
    }

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = 'Initial balance is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (amount < MIN_INITIAL_BALANCE) {
        newErrors.amount = `Minimum amount is $${MIN_INITIAL_BALANCE}`;
      } else if (amount > MAX_INITIAL_BALANCE) {
        newErrors.amount = `Maximum amount is $${MAX_INITIAL_BALANCE.toLocaleString()}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!isConfigurationAvailable()) {
      setErrors({ amount: 'This card configuration is not available' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const provider = getProvider();
    if (!provider) {
      setErrors({ provider: 'Please select a card provider' });
      return;
    }

    const amount = parseFloat(formData.amount);

    onSubmit({
      type: formData.type,
      currency: formData.currency,
      brand: formData.brand,
      amount,
      provider,
      requires3dSecure: provider === CardProvider.SUDO,
      autoTopupEnabled: false,
      cardNickname: formData.cardNickname.trim() || undefined,
    });
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setFormData((prev) => ({ ...prev, amount: cleanValue }));

    // Clear error when user starts typing
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const getCurrencyLabel = () => {
    return (
      CURRENCY_OPTIONS.find((opt) => opt.value === formData.currency)?.label ||
      'Select Currency'
    );
  };

  const getBrandLabel = () => {
    return (
      BRAND_OPTIONS.find((opt) => opt.value === formData.brand)?.label ||
      'Select Brand'
    );
  };

  return (
    <div className="space-y-6">
      {/* Card Type Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Card Type</h3>
        <div className="grid grid-cols-2 gap-3">
          {CARD_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, type: option.value }))
              }
              className={cn(
                'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                formData.type === option.value
                  ? 'border-kaviBlue bg-kaviBlue/10'
                  : 'border-border bg-card hover:border-kaviBlue/50'
              )}
            >
              <div className="mb-2">
                {option.value === CardType.VIRTUAL ? (
                  <CreditCard className="h-6 w-6 text-kaviBlue" />
                ) : (
                  <Wallet className="h-6 w-6 text-kaviBlue" />
                )}
              </div>
              <span className="font-semibold text-foreground">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Card Configuration</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Currency *</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-left transition-colors',
                showCurrencyDropdown
                  ? 'border-kaviBlue ring-2 ring-kaviBlue/20'
                  : 'border-border hover:border-kaviBlue/50'
              )}
            >
              <span className="text-foreground">{getCurrencyLabel()}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  showCurrencyDropdown && 'rotate-180'
                )}
              />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-card shadow-lg">
                {CURRENCY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, currency: option.value }));
                      setShowCurrencyDropdown(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl',
                      formData.currency === option.value
                        ? 'bg-kaviBlue/10 text-kaviBlue'
                        : 'hover:bg-accent'
                    )}
                  >
                    <span>{option.label}</span>
                    {formData.currency === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Choose the currency for your virtual card
          </p>
        </div>
      </div>

      {/* Brand Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Card Brand *</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBrandDropdown(!showBrandDropdown)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-left transition-colors',
              showBrandDropdown
                ? 'border-kaviBlue ring-2 ring-kaviBlue/20'
                : 'border-border hover:border-kaviBlue/50'
            )}
          >
            <span className="text-foreground">{getBrandLabel()}</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                showBrandDropdown && 'rotate-180'
              )}
            />
          </button>

          {showBrandDropdown && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-card shadow-lg">
              {getBrandOptions().map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, brand: option.value }));
                    setShowBrandDropdown(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl',
                    formData.brand === option.value
                      ? 'bg-kaviBlue/10 text-kaviBlue'
                      : 'hover:bg-accent'
                  )}
                >
                  <span>{option.label}</span>
                  {formData.brand === option.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formData.currency === SupportedCurrency.NGN
            ? 'Choose between Verve or Afrigo for NGN cards'
            : 'Choose between Visa or Mastercard for USD cards'}
        </p>
      </div>

      {/* Warning for pending pre-order */}
      {pendingPreOrderForConfig && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">
                Pending {formData.currency} {formData.type} Card
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You already have a pending {formData.currency} {formData.type} card
                request ({pendingPreOrderForConfig.brand.toUpperCase()}). Please wait
                for it to be processed or cancel it before creating another.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Provider Selection - Only for USD Virtual Cards */}
      {shouldShowProviderSelection() && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Select Card Provider *
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the provider that best fits your needs
          </p>

          <div className="space-y-3">
            {PROVIDER_OPTIONS.map((provider) => (
              <button
                key={provider.value}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, provider: provider.value }));
                  if (errors.provider) {
                    setErrors((prev) => ({ ...prev, provider: '' }));
                  }
                }}
                className={cn(
                  'w-full rounded-xl border-2 p-4 text-left transition-all',
                  formData.provider === provider.value
                    ? 'border-kaviBlue bg-kaviBlue/10'
                    : 'border-border bg-card hover:border-kaviBlue/50'
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      formData.provider === provider.value
                        ? 'border-kaviBlue'
                        : 'border-border'
                    )}
                  >
                    {formData.provider === provider.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-kaviBlue" />
                    )}
                  </div>
                  <span className="flex-1 font-semibold text-foreground">
                    {provider.name}
                  </span>
                  {provider.badge && (
                    <span className="rounded-md bg-kaviBlue/20 px-2 py-0.5 text-xs font-medium text-kaviBlue">
                      {provider.badge}
                    </span>
                  )}
                </div>

                <p className="mb-2 text-sm text-muted-foreground">
                  {provider.description}
                </p>

                <div className="space-y-1">
                  {provider.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span>{feature.positive ? '✓' : '⚠'}</span>
                      <span
                        className={
                          feature.positive ? 'text-foreground' : 'text-amber-500'
                        }
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {errors.provider && (
            <p className="text-sm text-destructive">{errors.provider}</p>
          )}
        </div>
      )}

      {/* Configuration not available warning */}
      {!isConfigurationAvailable() && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">
                Configuration Not Available
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formData.type === CardType.PHYSICAL &&
                formData.currency === SupportedCurrency.USD
                  ? 'Physical cards are not currently available for USD. Please select Virtual card type or change currency to NGN.'
                  : 'This card configuration is not available. Please select a different combination.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Amount Input */}
      {isConfigurationAvailable() && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Initial Balance *
          </label>
          <div
            className={cn(
              'flex items-center rounded-xl border bg-card px-4',
              errors.amount
                ? 'border-destructive'
                : 'border-border focus-within:border-kaviBlue focus-within:ring-2 focus-within:ring-kaviBlue/20'
            )}
          >
            <span className="text-muted-foreground">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent px-2 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          {errors.amount ? (
            <p className="text-xs text-destructive">{errors.amount}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Amount in USD to fund your card initially (min: ${MIN_INITIAL_BALANCE})
            </p>
          )}
        </div>
      )}

      {/* Advanced Options */}
      {isConfigurationAvailable() && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
          >
            <span className="text-foreground">Advanced Options (Optional)</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                showAdvancedOptions && 'rotate-180'
              )}
            />
          </button>

          {showAdvancedOptions && (
            <div className="mt-3 space-y-4 rounded-xl border border-border bg-card/50 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Card Nickname
                </label>
                <input
                  type="text"
                  value={formData.cardNickname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cardNickname: e.target.value,
                    }))
                  }
                  placeholder="e.g., Shopping Card, Travel Card"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                />
                <p className="text-xs text-muted-foreground">
                  Give your card a friendly name for easy identification
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-xl border border-kaviBlue/20 bg-kaviBlue/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
          <p className="text-sm text-muted-foreground">
            A one-time card creation fee of $30 will be charged. Your card will be
            ready to use immediately after successful payment.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !formData.amount || !isConfigurationAvailable()}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Next'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onCancel}
          disabled={loading}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default CardCreationForm;
