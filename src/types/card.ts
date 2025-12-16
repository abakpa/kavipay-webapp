export type TabType = 'assets' | 'nfts' | 'activity';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: number;
  price?: number;
  change?: number;
  type?: 'increase' | 'decrease';
  gradient?: string;
  isPltl?: boolean;
  isNative?: boolean;
  tokenAddress?: string;
  decimals?: number;
  logoUrl?: string;
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
}

export interface Transaction {
  id: string;
  type: 'received' | 'sent';
  amount: string;
  symbol: string;
  date: string;
  from?: string;
  to?: string;
  hash?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  fee?: string;
  feeSymbol?: string;
  usdValue?: string;
  chain?: string;
  tokenAddress?: string;
  timestamp?: number;
  memo?: string;
}

export interface WalletData {
  addresses: {
    bitcoin?: string;
    ethereum?: string;
    solana?: string;
  };
  label: string;
  isActive: boolean;
  hasBackedUp?: boolean;
  backupDate?: string;
}

// Card Provider Types (Internal - not displayed to users)
export const CardProvider = {
  PAYSCRIBE: 'payscribe',
  SUDO: 'sudo',
} as const;
export type CardProvider = (typeof CardProvider)[keyof typeof CardProvider];

export interface CardCustomer {
  id: string;
  business: string;
  type: string;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  status: string;
  individual?: {
    firstName: string;
    lastName: string;
    dob: string;
  };
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface CardAccount {
  id: string;
  business: string;
  type: string;
  currency: string;
  accountName: string;
  bankCode: string;
  accountType: string;
  accountNumber: string;
  currentBalance: number;
  availableBalance: number;
  provider: string;
  providerReference: string;
  referenceCode: string;
  reloadable: boolean;
  isDefault: boolean;
}

export interface CardFundingSource {
  id: string;
  business: string;
  type: string;
  status: string;
  isDefault: boolean;
}

export const CardStatus = {
  ACTIVE: 'active',
  FROZEN: 'frozen',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  EXPIRED: 'expired',
  PENDING: 'pending',
  TERMINATED: 'terminated',
} as const;
export type CardStatus = (typeof CardStatus)[keyof typeof CardStatus];

export const CardType = {
  VIRTUAL: 'virtual',
  PHYSICAL: 'physical',
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export const TransactionCategory = {
  GROCERY: 'grocery',
  RESTAURANT: 'restaurant',
  GAS: 'gas',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  TRAVEL: 'travel',
  HEALTHCARE: 'healthcare',
  UTILITIES: 'utilities',
  OTHER: 'other',
} as const;
export type TransactionCategory = (typeof TransactionCategory)[keyof typeof TransactionCategory];

// Virtual Card Types
export interface VirtualCard {
  id: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  cardholderName: string;
  pin?: string;
  status: CardStatus;
  type: CardType;
  brand?: string;
  label?: string;
  balance: number;
  currency: string;
  limits: CardLimits;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  billingAddress?: BillingAddress;
  customer?: CardCustomer;
  account?: CardAccount;
  fundingSource?: CardFundingSource;
  metadata?: Record<string, unknown>;
  expiryMonth?: string;
  expiryYear?: string;
  maskedPan?: string;
  is2FAEnabled?: boolean;
  is2FAEnrolled?: boolean;
  isDefaultPINChanged?: boolean;
  spendingControls?: SpendingControls;
  provider: CardProvider;
  providerCardId: string;
}

export interface CardLimits {
  daily: number;
  monthly: number;
  perTransaction: number;
  allowedCategories: TransactionCategory[];
  allowedCurrencies: string[];
  onlineEnabled: boolean;
  offlineEnabled: boolean;
}

export interface SpendingLimit {
  amount: number;
  interval: string;
  categories?: string[];
}

export interface ChannelControls {
  atm: boolean;
  pos: boolean;
  web: boolean;
  mobile: boolean;
}

export interface SpendingControls {
  allowedCategories?: string[];
  blockedCategories?: string[];
  channels?: ChannelControls;
  spendingLimits?: SpendingLimit[];
}

export const TransactionStatus = {
  SUCCESS: 'success',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  FAIL: 'fail',
  CANCELLED: 'cancelled',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const CardTransactionType = {
  PURCHASE: 'purchase',
  REFUND: 'refund',
  WITHDRAWAL: 'withdrawal',
  FEE: 'fee',
} as const;
export type CardTransactionType = (typeof CardTransactionType)[keyof typeof CardTransactionType];

export interface CardTransaction {
  id: string;
  cardId?: string;
  amount: number;
  currency: string;
  fee: number;
  merchantName?: string;
  merchantCategory?: TransactionCategory;
  description: string;
  date: string;
  status: TransactionStatus;
  type?: CardTransactionType;
  ref?: string;
  service?: string;
  serviceId?: string;
  location?: string;
  receiptUrl?: string;
  isDisputed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BillingAddress {
  cardholderName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const CardPreOrderStatus = {
  PENDING_KYC: 'pending_kyc',
  KYC_APPROVED: 'kyc_approved',
  PROCESSING: 'processing',
  CREATION_FAILED: 'creation_failed',
  PENDING_SYNC: 'pending_sync',
  COMPLETED: 'completed',
  REFUND_ELIGIBLE: 'refund_eligible',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  VERIFICATION_REJECTED: 'verification_rejected',
} as const;
export type CardPreOrderStatus = (typeof CardPreOrderStatus)[keyof typeof CardPreOrderStatus];

export interface CardPreOrder {
  id: string;
  userId: number;
  type?: string;
  currency: string;
  brand: string;
  initialAmount: number;
  cardFeePaid: number;
  kycFee: number;
  status: CardPreOrderStatus;
  refundRequestedAt?: string;
  refundProcessedAt?: string;
  createdAt: string;
  processedAt?: string;
  cardId?: string;
  rejectionReason?: string;
  rejectionDetails?: string;
  provider?: CardProvider;
  requires3dSecure?: boolean;
  dailyLimitRequired?: number;
  monthlyLimitRequired?: number;
  singleTransactionLimit?: number;
  autoTopupEnabled?: boolean;
  cardNickname?: string;
}

// KYC Types
export const KYCStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  PENDING_REVIEW: 'pending_review',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_RESUBMISSION: 'requires_resubmission',
  EXPIRED: 'expired',
} as const;
export type KYCStatus = (typeof KYCStatus)[keyof typeof KYCStatus];

// Unified KYC status for frontend display
export type UnifiedKYCStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'requires_resubmission';

export const DocumentType = {
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  NATIONAL_ID: 'national_id',
  VOTERS_CARD: 'voters_card',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface KYCData {
  id: string;
  userId: string;
  status: KYCStatus;
  personalInfo: PersonalInfo;
  documentInfo: DocumentInfo;
  addressInfo: AddressInfo;
  submittedAt?: string;
  reviewedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
}

export interface KYCStatusResponse {
  kycStatus: 'not_verified' | 'pending' | 'verified' | 'rejected';
  kycVerifiedAt?: string;
  rejectionReason?: string;
  kycData?: {
    firstName: string;
    lastName: string;
    dob: string;
    country: string;
    address: AddressInfo;
    identificationType: string;
    identificationNumber: string;
    photoURL: string;
    identityDocumentURL: string;
  };
  hasPayscribeCustomer: boolean;
}

// KYCAID Session Types
export interface KYCAIDSession {
  applicantId: string;
  verificationId: string;
  formId: string;
  formUrl: string;
  formToken: string;
}

export interface KYCAIDVerification {
  verificationId: string;
  applicantId: string;
  status: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  declineReasons?: string[];
  comment?: string;
}

export interface KYCAIDSyncResponse {
  verificationId: string;
  applicantId: string;
  status: string;
  verified: boolean;
  kycStatus: string;
  synced: boolean;
  syncedAt: string;
  completedAt?: string;
  declineReasons?: string[];
}

// KYCAID Form Data
export interface KYCAIDFormData {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD format
  country: string; // ISO alpha-2 country code
  phoneNumber: string;
}

export interface KYCAIDAddressData {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  nationality: string;
  phoneNumber: string;
  email: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
}

export interface DocumentInfo {
  documentType: DocumentType;
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  issuingCountry: string;
  frontImageUrl: string;
  backImageUrl?: string;
}

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  transactionCount: number;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface CreateCardRequest {
  type: string;
  currency: string;
  brand: string;
  amount: number;
}

export const SupportedCurrency = {
  USD: 'USD',
  NGN: 'NGN',
} as const;
export type SupportedCurrency = (typeof SupportedCurrency)[keyof typeof SupportedCurrency];

export const SupportedBrand = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  VERVE: 'verve',
  AFRIGO: 'afrigo',
} as const;
export type SupportedBrand = (typeof SupportedBrand)[keyof typeof SupportedBrand];

export interface ServerTransaction {
  TransID: string;
  Ref: string;
  Amount: number;
  Fee: number;
  Currency: string;
  Description: string;
  Service: string;
  ServiceID: string;
  CreatedAt: {
    wall: number;
    ext: number;
    loc: unknown;
  };
  Status: string;
}

export interface TransactionResponse {
  transactions: ServerTransaction[];
  Pagination: {
    CurrentPage: number;
    TotalPages: number;
    PageSize: number;
    TotalCount: number;
  };
}

// Utility function to convert server transaction to client format
export const convertServerTransaction = (serverTx: ServerTransaction, cardId?: string): CardTransaction => {
  const merchantName = parseMerchantName(serverTx.Description);
  const merchantCategory = parseMerchantCategory(serverTx.Description);
  const transactionType = parseTransactionType(serverTx.Description);
  const date = new Date(serverTx.CreatedAt.ext * 1000).toISOString();

  return {
    id: serverTx.TransID,
    cardId: cardId,
    amount: serverTx.Amount,
    currency: serverTx.Currency,
    fee: serverTx.Fee,
    merchantName,
    merchantCategory,
    description: serverTx.Description,
    date,
    status: serverTx.Status as TransactionStatus,
    type: transactionType,
    ref: serverTx.Ref,
    service: serverTx.Service,
    serviceId: serverTx.ServiceID,
  };
};

export const parseMerchantName = (description: string): string => {
  if (description.includes(' on ')) {
    const parts = description.split(' on ');
    if (parts.length > 1) {
      return parts[1].split('.')[0].trim();
    }
  }

  if (description.includes('VISA (') && description.includes(') virtual card issue')) {
    return 'Card Issuance';
  }

  return description.split('.')[0].trim();
};

export const parseMerchantCategory = (description: string): TransactionCategory => {
  const desc = description.toLowerCase();

  if (desc.includes('openai')) return TransactionCategory.ENTERTAINMENT;
  if (desc.includes('grocery') || desc.includes('food')) return TransactionCategory.GROCERY;
  if (desc.includes('restaurant') || desc.includes('dining')) return TransactionCategory.RESTAURANT;
  if (desc.includes('gas') || desc.includes('fuel')) return TransactionCategory.GAS;
  if (desc.includes('shop') || desc.includes('store')) return TransactionCategory.SHOPPING;
  if (desc.includes('travel') || desc.includes('hotel') || desc.includes('flight')) return TransactionCategory.TRAVEL;
  if (desc.includes('health') || desc.includes('medical')) return TransactionCategory.HEALTHCARE;
  if (desc.includes('utility') || desc.includes('electric') || desc.includes('water')) return TransactionCategory.UTILITIES;

  return TransactionCategory.OTHER;
};

export const parseTransactionType = (description: string): CardTransactionType => {
  const desc = description.toLowerCase();

  if (desc.includes('refund')) return CardTransactionType.REFUND;
  if (desc.includes('withdrawal') || desc.includes('atm')) return CardTransactionType.WITHDRAWAL;
  if (desc.includes('fee') || desc.includes('card issue') || desc.includes('topup')) return CardTransactionType.FEE;

  return CardTransactionType.PURCHASE;
};
