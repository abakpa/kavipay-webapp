// ==========================================
// CRYPTO DEPOSIT TYPES
// ==========================================

// Network for a cryptocurrency
export interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  addressRegex?: string;
  memoRegex?: string;
  isDefault?: boolean;
  minConfirmations?: number;
  estimatedArrival?: string; // e.g. "~10 mins"
}

// Token on a specific network
export interface CryptoToken {
  id: string;
  currency: string; // API currency code e.g. 'usdttrc20', 'usdcerc20'
  symbol: string;
  name: string;
  network: CryptoNetwork;
  logo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Grouped currency with multiple networks
export interface GroupedCurrency {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
  tokens: CryptoToken[];
}

// Full crypto currency list from API
export interface CryptoCurrencyListItem {
  id: string;
  name: string;
  symbol: string;
  currency: string;
  network: string;
  networkName: string;
  logo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Crypto deposit status
export const CryptoDepositStatusEnum = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  CONFIRMED: 'confirmed',
  OVERPAID: 'overpaid',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  // Legacy statuses from existing code
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  SENDING: 'sending',
  FINISHED: 'finished',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;
export type CryptoDepositStatusType =
  (typeof CryptoDepositStatusEnum)[keyof typeof CryptoDepositStatusEnum];

// Crypto deposit response from API
export interface CryptoDepositData {
  id: number;
  paymentId: string;
  payAddress: string;
  payCurrency: string;
  payAmount: number;
  priceAmount: number;
  priceCurrency: string;
  status: CryptoDepositStatusType;
  network?: string;
  networkName?: string;
  expiresAt?: string;
  createdAt: string;
  actuallyPaid?: number;
  outcomeAmount?: number;
  memo?: string; // For currencies that require memo (XRP, XLM, etc.)
}

// List of crypto deposits response
export interface CryptoDepositsResponse {
  deposits: CryptoDepositData[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ==========================================
// NAIRA DEPOSIT TYPES
// ==========================================

// Naira virtual account status
export const NairaVirtualAccountStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
} as const;
export type NairaVirtualAccountStatusType =
  (typeof NairaVirtualAccountStatus)[keyof typeof NairaVirtualAccountStatus];

// Naira virtual account for bank transfer (matches backend API response)
export interface NairaVirtualAccount {
  id: number;
  virtualAccountId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  amountNgn: number;
  expiresAt: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
}

// Naira deposit status
export const NairaDepositStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;
export type NairaDepositStatusType =
  (typeof NairaDepositStatus)[keyof typeof NairaDepositStatus];

// Naira deposit record (matches backend API response)
export interface NairaDeposit {
  ID: number;
  amountNgn: number;
  amountUsd?: number;
  status: NairaDepositStatusType;
  reference?: string;
  CreatedAt: string;
  completedAt?: string;
}

// Naira deposits list response
export interface NairaDepositsResponse {
  deposits: NairaDeposit[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Exchange rate response
export interface NairaExchangeRate {
  rate: number; // NGN per USD
  minAmountNGN: number;
  maxAmountNGN: number;
  minAmountUSD: number;
  maxAmountUSD: number;
  updatedAt: string;
}

// ==========================================
// CONSTANTS
// ==========================================

// Minimum and maximum amounts
export const NAIRA_MIN_AMOUNT = 1000; // ₦1,000
export const NAIRA_MAX_AMOUNT = 10000000; // ₦10,000,000

// Quick amount buttons for Naira (in Naira)
export const NAIRA_QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

// Virtual account expiry time in minutes
export const VIRTUAL_ACCOUNT_EXPIRY_MINUTES = 30;

// Top cryptocurrencies for grid display
export const TOP_CRYPTO_CURRENCIES = [
  'USDT',
  'USDC',
  'BTC',
  'ETH',
  'SOL',
  'BNB',
  'SONIC',
  'TON',
  'TRX',
  'XRP',
];

// Crypto deposit minimum (in USD)
export const CRYPTO_MIN_DEPOSIT_USD = 1;

// Quick amount buttons for crypto (in USD)
export const CRYPTO_QUICK_AMOUNTS_USD = [10, 25, 50, 100];
