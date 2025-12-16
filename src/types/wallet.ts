// Cryptocurrency types
export interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  currency: string; // e.g., 'btc', 'eth', 'usdcbase'
  network?: string;
  minAmount?: number;
  logo?: string;
}

// Crypto deposit types
export const CryptoDepositStatus = {
  WAITING: 'waiting',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  SENDING: 'sending',
  FINISHED: 'finished',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
} as const;
export type CryptoDepositStatus = (typeof CryptoDepositStatus)[keyof typeof CryptoDepositStatus];

export interface CryptoDeposit {
  id: number;
  paymentId: string;
  payAddress: string;
  payCurrency: string;
  payAmount: number;
  priceAmount: number;
  priceCurrency: string;
  status: CryptoDepositStatus;
  expiresAt?: string;
  createdAt: string;
  actuallyPaid?: number;
  outcomeAmount?: number;
}

export interface CryptoEstimate {
  estimatedAmount: number;
  currency: string;
  rate: number;
}

// Withdrawal types
export const WithdrawalStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus];

export interface Withdrawal {
  id: string;
  userId: string;
  usdAmount: number;
  walletAddress: string;
  hash?: string;
  status: WithdrawalStatus;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

// Wallet balance types
export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface TokenBalance {
  tokenAddress: string;
  name: string;
  symbol: string;
  logo?: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  usdPrice?: number;
  usdValue?: number;
  nativeToken: boolean;
  chain?: string;
}

// Transaction types for wallet
export const WalletTransactionType = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  CARD_TOPUP: 'card_topup',
  CARD_WITHDRAW: 'card_withdraw',
  FEE: 'fee',
} as const;
export type WalletTransactionType = (typeof WalletTransactionType)[keyof typeof WalletTransactionType];

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  date: string;
  hash?: string;
  from?: string;
  to?: string;
  fee?: number;
}

// Deposit step types
export type DepositStep = 'select' | 'payment' | 'status';

// Popular cryptocurrencies for quick selection
export const POPULAR_CRYPTOCURRENCIES: CryptoCurrency[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', currency: 'btc', logo: '₿' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', currency: 'eth', logo: 'Ξ' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', currency: 'usdttrc20', network: 'TRC20', logo: '₮' },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', currency: 'usdcbase', network: 'Base', logo: '$' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', currency: 'sol', logo: '◎' },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', currency: 'ltc', logo: 'Ł' },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', currency: 'doge', logo: 'Ð' },
  { id: 'trx', name: 'Tron', symbol: 'TRX', currency: 'trx', logo: '⧫' },
];

// Quick amount options
export const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

// Minimum deposit amount
export const MIN_DEPOSIT_AMOUNT = 5;

// Minimum withdrawal amount
export const MIN_WITHDRAWAL_AMOUNT = 10;

// Card top-up fee tiers
export const TOPUP_FEE_TIERS = [
  { maxAmount: 100, feePercent: 3 },
  { maxAmount: 500, feePercent: 2.5 },
  { maxAmount: Infinity, feePercent: 2 },
];

export const getTopupFee = (amount: number): number => {
  const tier = TOPUP_FEE_TIERS.find((t) => amount <= t.maxAmount);
  return tier ? (amount * tier.feePercent) / 100 : 0;
};

export const getTopupFeePercent = (amount: number): number => {
  const tier = TOPUP_FEE_TIERS.find((t) => amount <= t.maxAmount);
  return tier?.feePercent ?? 2;
};
