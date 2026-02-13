import { api } from './index';
import type {
  CryptoCurrencyListItem,
  CryptoDepositData,
  CryptoDepositsResponse,
  NairaVirtualAccount,
  NairaDeposit,
  NairaDepositsResponse,
  NairaExchangeRate,
  NigerianBank,
  NameEnquiryResult,
  NairaPayout,
  NairaPayoutsResponse,
  InitiateNairaPayoutParams,
} from '@/types/deposit';

// ==========================================
// CRYPTO DEPOSIT API
// ==========================================

/**
 * Fetch list of available cryptocurrencies for deposit
 */
export async function getCryptoCurrencies(): Promise<CryptoCurrencyListItem[]> {
  const response = await api.get<{ currencies: CryptoCurrencyListItem[] }>(
    '/deposits/crypto/currencies'
  );
  return response.data.currencies;
}

/**
 * Step 1: Create a crypto deposit with USD amount
 */
export async function createCryptoDeposit(amountUSD: number): Promise<CryptoDepositData> {
  const response = await api.post<CryptoDepositData>('/deposits/crypto/create', {
    amount: amountUSD,
    currency: 'USD',
  });
  return response.data;
}

/**
 * Step 2: Select token and network for an existing deposit
 */
export async function selectCryptoToken(
  depositId: number,
  currency: string,
  network?: string
): Promise<CryptoDepositData> {
  const response = await api.post<CryptoDepositData>(
    `/deposits/crypto/${depositId}/select-token`,
    {
      currency,
      network,
    }
  );
  return response.data;
}

/**
 * Get a single crypto deposit by ID
 */
export async function getCryptoDeposit(depositId: number): Promise<CryptoDepositData> {
  const response = await api.get<CryptoDepositData>(`/deposits/crypto/${depositId}`);
  return response.data;
}

/**
 * Get list of crypto deposits with pagination
 */
export async function getCryptoDeposits(
  page: number = 1,
  limit: number = 10
): Promise<CryptoDepositsResponse> {
  const response = await api.get<CryptoDepositsResponse>('/deposits/crypto', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Get crypto estimate for a given USD amount and currency
 */
export async function getCryptoEstimate(
  amountUSD: number,
  currency: string
): Promise<{ estimatedAmount: number; rate: number }> {
  const response = await api.get<{ estimatedAmount: number; rate: number }>(
    '/deposits/crypto/estimate',
    {
      params: { amount: amountUSD, currency },
    }
  );
  return response.data;
}

// ==========================================
// NAIRA DEPOSIT API (matches mobile app endpoints)
// ==========================================

/**
 * Get current NGN/USD exchange rate and limits
 */
export async function getNairaExchangeRate(): Promise<NairaExchangeRate> {
  const response = await api.get<NairaExchangeRate>('/wallet/exchange-rate');
  return response.data;
}

/**
 * Create a new virtual account for Naira deposit
 * @param amountNGN - Amount in Naira
 * @returns The created virtual account with bank details
 */
export async function createNairaVirtualAccount(
  amountNGN: number
): Promise<NairaVirtualAccount> {
  const response = await api.post<NairaVirtualAccount>('/naira/virtual-account', {
    amountNgn: amountNGN,
  });
  return response.data;
}

/**
 * Get active virtual account (if any)
 * @returns The active virtual account or null if none exists
 */
export async function getNairaVirtualAccount(): Promise<NairaVirtualAccount | null> {
  try {
    const response = await api.get<NairaVirtualAccount>('/naira/virtual-account');
    return response.data;
  } catch (error: unknown) {
    // Return null if no active account exists (404)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * Cancel active virtual account
 * Allows user to create a new deposit with a different amount
 */
export async function cancelNairaVirtualAccount(): Promise<void> {
  await api.delete('/naira/virtual-account');
}

/**
 * Get list of Naira deposits with pagination
 */
export async function getNairaDeposits(
  page: number = 1,
  limit: number = 10
): Promise<NairaDepositsResponse> {
  const response = await api.get<NairaDepositsResponse>('/naira/deposits', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Get a single Naira deposit by ID
 */
export async function getNairaDeposit(depositId: string): Promise<NairaDeposit> {
  const response = await api.get<NairaDeposit>(`/naira/deposits/${depositId}`);
  return response.data;
}

// ==========================================
// NAIRA WITHDRAWAL/PAYOUT API
// ==========================================

// Cache for Nigerian banks (valid for 1 hour)
let banksCache: { banks: NigerianBank[]; timestamp: number } | null = null;
const BANKS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get list of Nigerian banks
 * Cached for 1 hour to reduce API calls
 */
export async function getNigerianBanks(): Promise<NigerianBank[]> {
  // Check cache first
  if (banksCache && Date.now() - banksCache.timestamp < BANKS_CACHE_DURATION) {
    return banksCache.banks;
  }

  const response = await api.get<{ banks: NigerianBank[] }>('/naira/banks');
  const banks = response.data.banks;

  // Update cache
  banksCache = { banks, timestamp: Date.now() };

  return banks;
}

/**
 * Validate bank account (name enquiry)
 * Returns account holder name for verification
 */
export async function validateBankAccount(
  bankCode: string,
  accountNumber: string
): Promise<NameEnquiryResult> {
  const response = await api.post<NameEnquiryResult>('/naira/payout/name-enquiry', {
    bankCode,
    accountNumber,
  });
  return response.data;
}

/**
 * Initiate Naira payout (withdrawal to bank)
 */
export async function initiateNairaPayout(
  params: InitiateNairaPayoutParams
): Promise<NairaPayout> {
  const response = await api.post<NairaPayout>('/naira/payout', params);
  return response.data;
}

/**
 * Get list of Naira payouts with pagination
 */
export async function getNairaPayouts(
  page: number = 1,
  limit: number = 10
): Promise<NairaPayoutsResponse> {
  const response = await api.get<NairaPayoutsResponse>('/naira/payouts', {
    params: { page, limit },
  });
  return response.data;
}

/**
 * Get a single Naira payout by ID
 */
export async function getNairaPayout(payoutId: number): Promise<NairaPayout> {
  const response = await api.get<NairaPayout>(`/naira/payouts/${payoutId}`);
  return response.data;
}

// ==========================================
// MOCK DATA FOR DEVELOPMENT
// ==========================================

// Mock cryptocurrencies list (matching mobile app)
export const MOCK_CRYPTO_CURRENCIES: CryptoCurrencyListItem[] = [
  // USDT variants
  {
    id: 'usdt-trc20',
    name: 'Tether',
    symbol: 'USDT',
    currency: 'usdttrc20',
    network: 'trc20',
    networkName: 'Tron (TRC20)',
    logo: '₮',
    minAmount: 1,
  },
  {
    id: 'usdt-erc20',
    name: 'Tether',
    symbol: 'USDT',
    currency: 'usdterc20',
    network: 'erc20',
    networkName: 'Ethereum (ERC20)',
    logo: '₮',
    minAmount: 10,
  },
  {
    id: 'usdt-bep20',
    name: 'Tether',
    symbol: 'USDT',
    currency: 'usdtbsc',
    network: 'bep20',
    networkName: 'BNB Smart Chain (BEP20)',
    logo: '₮',
    minAmount: 1,
  },
  // USDC variants
  {
    id: 'usdc-base',
    name: 'USD Coin',
    symbol: 'USDC',
    currency: 'usdcbase',
    network: 'base',
    networkName: 'Base',
    logo: '$',
    minAmount: 1,
  },
  {
    id: 'usdc-erc20',
    name: 'USD Coin',
    symbol: 'USDC',
    currency: 'usdcerc20',
    network: 'erc20',
    networkName: 'Ethereum (ERC20)',
    logo: '$',
    minAmount: 10,
  },
  {
    id: 'usdc-sol',
    name: 'USD Coin',
    symbol: 'USDC',
    currency: 'usdcsol',
    network: 'sol',
    networkName: 'Solana',
    logo: '$',
    minAmount: 1,
  },
  // BTC
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    currency: 'btc',
    network: 'btc',
    networkName: 'Bitcoin',
    logo: '₿',
    minAmount: 0.0001,
  },
  // ETH
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    currency: 'eth',
    network: 'eth',
    networkName: 'Ethereum',
    logo: 'Ξ',
    minAmount: 0.001,
  },
  // SOL
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    currency: 'sol',
    network: 'sol',
    networkName: 'Solana',
    logo: '◎',
    minAmount: 0.01,
  },
  // BNB
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    currency: 'bnb',
    network: 'bep20',
    networkName: 'BNB Smart Chain',
    logo: '⬡',
    minAmount: 0.01,
  },
  // SONIC
  {
    id: 'sonic',
    name: 'Sonic',
    symbol: 'SONIC',
    currency: 'sonic',
    network: 'sonic',
    networkName: 'Sonic',
    logo: '🔊',
    minAmount: 1,
  },
  // TON
  {
    id: 'ton',
    name: 'Toncoin',
    symbol: 'TON',
    currency: 'ton',
    network: 'ton',
    networkName: 'TON',
    logo: '💎',
    minAmount: 0.1,
  },
  // TRX
  {
    id: 'trx',
    name: 'Tron',
    symbol: 'TRX',
    currency: 'trx',
    network: 'trc20',
    networkName: 'Tron',
    logo: '⧫',
    minAmount: 10,
  },
  // XRP
  {
    id: 'xrp',
    name: 'Ripple',
    symbol: 'XRP',
    currency: 'xrp',
    network: 'xrp',
    networkName: 'XRP Ledger',
    logo: '✕',
    minAmount: 1,
  },
  // DOGE
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    currency: 'doge',
    network: 'doge',
    networkName: 'Dogecoin',
    logo: 'Ð',
    minAmount: 10,
  },
  // LTC
  {
    id: 'ltc',
    name: 'Litecoin',
    symbol: 'LTC',
    currency: 'ltc',
    network: 'ltc',
    networkName: 'Litecoin',
    logo: 'Ł',
    minAmount: 0.01,
  },
];

// Mock exchange rate
export const MOCK_EXCHANGE_RATE: NairaExchangeRate = {
  rate: 1550, // ₦1550 per $1
  minAmountNGN: 1000,
  maxAmountNGN: 10000000,
  minAmountUSD: 0.65,
  maxAmountUSD: 6451.61,
  updatedAt: new Date().toISOString(),
};

// Helper to generate mock address
export function generateMockCryptoAddress(currency: string): string {
  const prefixes: Record<string, string> = {
    btc: 'bc1q',
    eth: '0x',
    ltc: 'ltc1q',
    doge: 'D',
    sol: '',
    trx: 'T',
    xrp: 'r',
    ton: 'EQ',
    bnb: '0x',
    sonic: '0x',
    usdttrc20: 'T',
    usdterc20: '0x',
    usdtbsc: '0x',
    usdcbase: '0x',
    usdcerc20: '0x',
    usdcsol: '',
  };

  const prefix = prefixes[currency.toLowerCase()] || '0x';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let address = prefix;

  const length =
    currency === 'btc' || currency === 'ltc'
      ? 42
      : currency === 'sol' || currency === 'usdcsol'
        ? 44
        : currency === 'ton'
          ? 48
          : 42;

  for (let i = prefix.length; i < length; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }

  return address;
}

// Mock Nigerian banks
export const MOCK_NIGERIAN_BANKS: NigerianBank[] = [
  {
    _id: '1',
    name: 'Access Bank',
    slug: 'access-bank',
    code: '044',
    longCode: '044150149',
    nipCode: '044',
    isActive: true,
  },
  {
    _id: '2',
    name: 'Guaranty Trust Bank',
    slug: 'gtbank',
    code: '058',
    longCode: '058152036',
    nipCode: '058',
    isActive: true,
  },
  {
    _id: '3',
    name: 'First Bank of Nigeria',
    slug: 'first-bank',
    code: '011',
    longCode: '011151003',
    nipCode: '011',
    isActive: true,
  },
  {
    _id: '4',
    name: 'United Bank for Africa',
    slug: 'uba',
    code: '033',
    longCode: '033153513',
    nipCode: '033',
    isActive: true,
  },
  {
    _id: '5',
    name: 'Zenith Bank',
    slug: 'zenith-bank',
    code: '057',
    longCode: '057150013',
    nipCode: '057',
    isActive: true,
  },
  {
    _id: '6',
    name: 'Opay',
    slug: 'opay',
    code: '999992',
    longCode: '999992',
    nipCode: '999992',
    isActive: true,
  },
  {
    _id: '7',
    name: 'PalmPay',
    slug: 'palmpay',
    code: '999991',
    longCode: '999991',
    nipCode: '999991',
    isActive: true,
  },
  {
    _id: '8',
    name: 'Kuda Bank',
    slug: 'kuda-bank',
    code: '50211',
    longCode: '50211',
    nipCode: '50211',
    isActive: true,
  },
  {
    _id: '9',
    name: 'Moniepoint MFB',
    slug: 'moniepoint',
    code: '50515',
    longCode: '50515',
    nipCode: '50515',
    isActive: true,
  },
  {
    _id: '10',
    name: 'Stanbic IBTC Bank',
    slug: 'stanbic-ibtc',
    code: '221',
    longCode: '221159522',
    nipCode: '221',
    isActive: true,
  },
];
