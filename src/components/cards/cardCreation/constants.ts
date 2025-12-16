import {
  SupportedCurrency,
  SupportedBrand,
  CardType,
  CardProvider,
} from '@/types/card';

// Card creation fee in USD
export const CARD_CREATION_FEE = 30;

// Minimum and maximum initial balance
export const MIN_INITIAL_BALANCE = 1;
export const MAX_INITIAL_BALANCE = 10000;

// Card configuration mapping based on provider capabilities
export const CARD_CONFIGURATIONS = {
  [SupportedCurrency.NGN]: {
    [CardType.VIRTUAL]: {
      brands: [SupportedBrand.VERVE, SupportedBrand.AFRIGO],
      provider: CardProvider.SUDO,
    },
    [CardType.PHYSICAL]: {
      brands: [SupportedBrand.VERVE, SupportedBrand.AFRIGO],
      provider: CardProvider.SUDO,
    },
  },
  [SupportedCurrency.USD]: {
    [CardType.VIRTUAL]: {
      brands: [SupportedBrand.VISA, SupportedBrand.MASTERCARD],
      provider: CardProvider.SUDO, // Default to Sudo, Payscribe also available
    },
    [CardType.PHYSICAL]: {
      brands: [], // USD physical cards not available
      provider: null,
    },
  },
} as const;

export const CARD_TYPE_OPTIONS = [
  {
    value: CardType.VIRTUAL,
    label: 'Virtual Card',
    description: 'Instant issuance, online payments',
    icon: 'CreditCard',
  },
  {
    value: CardType.PHYSICAL,
    label: 'Physical Card',
    description: 'Shipped to you, use anywhere',
    icon: 'Wallet',
  },
] as const;

export const CURRENCY_OPTIONS = [
  { value: SupportedCurrency.USD, label: 'USD - US Dollar', symbol: '$' },
  { value: SupportedCurrency.NGN, label: 'NGN - Nigerian Naira', symbol: '₦' },
] as const;

export const BRAND_OPTIONS = [
  { value: SupportedBrand.VISA, label: 'Visa' },
  { value: SupportedBrand.MASTERCARD, label: 'Mastercard' },
  { value: SupportedBrand.VERVE, label: 'Verve' },
  { value: SupportedBrand.AFRIGO, label: 'Afrigo' },
] as const;

export const PROVIDER_OPTIONS = [
  {
    value: CardProvider.SUDO,
    name: 'Premium Card',
    badge: 'Recommended',
    description: 'Enhanced security with advanced spending controls',
    features: [
      { text: '3D Secure / OTP verification for merchant compatibility', positive: true },
      { text: 'Advanced spending controls (categories, channels)', positive: true },
      { text: 'Daily limit capped at $10,000', positive: false },
    ],
  },
  {
    value: CardProvider.PAYSCRIBE,
    name: 'Enterprise Card',
    badge: null,
    description: 'High-limit simple card for business transactions',
    features: [
      { text: 'Daily spending limits above $10,000', positive: true },
      { text: 'No monthly maintenance fees', positive: true },
      { text: 'Fast, simple setup with AI fraud detection', positive: true },
      { text: 'No 3D Secure (some merchants may decline)', positive: false },
    ],
  },
] as const;

// Form data interface
export interface CardCreationFormData {
  type: CardType;
  currency: SupportedCurrency;
  brand: SupportedBrand;
  amount: string;
  provider: CardProvider | null;
  cardNickname: string;
}

// Submit data interface (what gets sent to API)
export interface CardCreationSubmitData {
  type: string;
  currency: string;
  brand: string;
  amount: number;
  provider: string;
  requires3dSecure: boolean;
  dailyLimitRequired?: number;
  monthlyLimitRequired?: number;
  singleTransactionLimit?: number;
  autoTopupEnabled?: boolean;
  cardNickname?: string;
}

// Initial form state
export const INITIAL_FORM_DATA: CardCreationFormData = {
  type: CardType.VIRTUAL,
  currency: SupportedCurrency.USD,
  brand: SupportedBrand.VISA,
  amount: '',
  provider: null,
  cardNickname: '',
};

// Steps for progress bar
export type CardCreationStep = 'configure' | 'review' | 'success';

export const CARD_CREATION_STEPS = [
  { id: 'configure', label: 'Configure' },
  { id: 'review', label: 'Review & Pay' },
] as const;
