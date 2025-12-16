import axios from 'axios';
import { api, miningApi } from './index';
import { parseApiError } from '../../utils/errorUtils';
import {
  CardProvider,
  CardStatus,
  CardType,
  CardTransactionType,
  TransactionCategory,
  TransactionStatus,
} from '../../types/card';
import type {
  BillingAddress,
  CardLimits,
  VirtualCard,
  CardTransaction,
  CardPreOrder,
} from '../../types/card';

// Internal types for API responses
interface CardApiResponse {
  id?: string;
  _id?: string;
  provider?: string;
  masked_pan?: string;
  maskedPan?: string;
  MaskedPAN?: string;
  customer?: VirtualCard['customer'];
  name?: string;
  expiryMonth?: string;
  expiryYear?: string;
  expiry?: string;
  Expiry?: string;
  billing?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  status?: string;
  type?: string;
  brand?: string;
  account?: VirtualCard['account'];
  balance?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  provider_card_id?: string;
  providerReference?: string;
  providerCardId?: string;
  is2FAEnabled?: boolean;
  is2FAEnrolled?: boolean;
  isDefaultPINChanged?: boolean;
  spendingControls?: VirtualCard['spendingControls'];
  fundingSource?: VirtualCard['fundingSource'];
}

interface TransactionApiResponse {
  trans_id?: string;
  id?: string;
  amount?: string | number;
  currency?: string;
  fee?: string | number;
  description?: string;
  created_at?: string | number;
  status?: string;
  ref?: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

interface EnhancedError extends Error {
  apiError?: ReturnType<typeof parseApiError>;
  isUserError?: boolean;
  statusCode?: number;
  details?: unknown;
}

// Helper to build billing address from API response
function buildBillingAddress(
  customer: VirtualCard['customer'] | undefined,
  billing: CardApiResponse['billing'] | undefined,
  customerName: string
): BillingAddress | undefined {
  if (customer?.billingAddress) {
    return {
      cardholderName: customerName,
      addressLine1: customer.billingAddress.line1 || '',
      addressLine2: undefined,
      city: customer.billingAddress.city || '',
      state: customer.billingAddress.state || '',
      country: customer.billingAddress.country || '',
      postalCode: customer.billingAddress.postalCode || '',
    };
  }
  if (billing) {
    return {
      cardholderName: customerName,
      addressLine1: billing.street || '',
      addressLine2: undefined,
      city: billing.city || '',
      state: billing.state || '',
      country: billing.country || '',
      postalCode: billing.postal_code || '',
    };
  }
  return undefined;
}

// Helper to map API card to VirtualCard
function mapApiCardToVirtualCard(card: CardApiResponse): VirtualCard {
  const cardProvider = (card.provider || 'sudo') as CardProvider;
  const cardNumber = card.masked_pan || card.maskedPan || card.MaskedPAN || '****';
  const customerName = card.customer?.name || card.name || 'Cardholder';

  let expiryDate = '';
  if (card.expiryMonth && card.expiryYear) {
    expiryDate = `${card.expiryMonth}/${card.expiryYear}`;
  } else {
    expiryDate = card.expiry || card.Expiry || '';
  }

  return {
    id: card.id || card._id || '',
    createdAt: card.created_at || card.createdAt || '',
    updatedAt: card.updated_at || card.updatedAt || '',
    cardNumber,
    cvv: '***',
    expiryDate,
    cardholderName: customerName,
    status: (card.status || 'pending') as CardStatus,
    type: (card.type || 'virtual') as CardType,
    brand: card.brand || 'visa',
    balance: card.account?.availableBalance || card.balance || 0,
    currency: card.currency || 'USD',
    limits: {
      daily: 0,
      monthly: 0,
      perTransaction: 0,
      allowedCategories: [],
      allowedCurrencies: [card.currency || 'USD'],
      onlineEnabled: true,
      offlineEnabled: true,
    },
    isActive: (card.status || 'pending').toLowerCase() === 'active',
    label: `${(card.type || 'Virtual').toUpperCase()} ${cardNumber}`.trim(),
    billingAddress: buildBillingAddress(card.customer, card.billing, customerName),
    customer: card.customer,
    account: card.account,
    fundingSource: card.fundingSource,
    metadata: card.metadata,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    maskedPan: card.maskedPan,
    is2FAEnabled: card.is2FAEnabled,
    is2FAEnrolled: card.is2FAEnrolled,
    isDefaultPINChanged: card.isDefaultPINChanged,
    spendingControls: card.spendingControls,
    provider: cardProvider,
    providerCardId:
      card.provider_card_id || card.providerReference || card.providerCardId || '',
  };
}

/**
 * Fetch all virtual cards for authenticated user.
 */
export const getVirtualCards = async (sync = false): Promise<VirtualCard[]> => {
  try {
    const response = await api.get('/cards', {
      params: sync ? { sync: 'true' } : {},
    });

    const cards = response.data.cards || response.data;
    if (!Array.isArray(cards) || cards.length === 0) {
      return [];
    }

    return cards.map(mapApiCardToVirtualCard);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const parsedError = parseApiError(error, '/cards');
      const enhancedError = new Error(parsedError.message) as Error & {
        apiError: typeof parsedError;
      };
      enhancedError.apiError = parsedError;
      throw enhancedError;
    }
    throw error;
  }
};

/**
 * Fetch a single card by ID. Pass reveal=true to get sensitive data.
 */
export const getCardById = async (
  cardId: string,
  reveal = false
): Promise<VirtualCard> => {
  try {
    const response = await api.get(
      `/cards/${cardId}${reveal ? '?reveal=true' : ''}`
    );

    const cardData = response.data.data || response.data.card || response.data;
    const customer = response.data.customer || cardData.customer;
    const account = response.data.account || cardData.account;
    const fundingSource = response.data.fundingSource || cardData.fundingSource;
    const metadata = response.data.metadata || cardData.metadata;
    const expiryMonth = response.data.expiryMonth || cardData.expiryMonth;
    const expiryYear = response.data.expiryYear || cardData.expiryYear;
    const maskedPan = response.data.maskedPan || cardData.maskedPan;
    const is2FAEnabled = response.data.is2FAEnabled ?? cardData.is2FAEnabled;
    const is2FAEnrolled = response.data.is2FAEnrolled ?? cardData.is2FAEnrolled;
    const isDefaultPINChanged =
      response.data.isDefaultPINChanged ?? cardData.isDefaultPINChanged;

    const cardProvider = response.data.provider || cardData.provider || 'sudo';
    const customerName = customer?.name || cardData.name || 'Cardholder';

    let cardNumber = '****';
    if (reveal && cardData.fullPAN) {
      cardNumber = cardData.fullPAN || cardData.FullPAN || cardData.number || '****';
    } else if (cardProvider === 'sudo') {
      cardNumber = cardData.maskedPan || cardData.MaskedPAN || '****';
    } else {
      cardNumber = cardData.card_number || cardData.masked || '****';
    }

    let expiryDate = '';
    if (expiryMonth && expiryYear) {
      expiryDate = `${expiryMonth}/${expiryYear}`;
    } else if (cardProvider === 'sudo') {
      expiryDate = cardData.expiry || cardData.Expiry || '';
    } else {
      expiryDate = cardData.expiry || '';
    }

    let cvv = '***';
    if (reveal && (cardData.cvv || cardData.CVV || cardData.cvv2)) {
      cvv = cardData.cvv || cardData.CVV || cardData.cvv2 || '***';
    }

    let pin: string | undefined;
    if (reveal && (cardData.pin || cardData.PIN || cardData.defaultPin)) {
      pin = cardData.pin || cardData.PIN || cardData.defaultPin;
    }

    return {
      id: cardId,
      createdAt: cardData.createdAt || cardData.CreatedAt,
      updatedAt: cardData.updatedAt || cardData.UpdatedAt,
      cardNumber,
      cvv,
      pin,
      expiryDate,
      cardholderName: customerName,
      status: (cardData.status || cardData.Status || 'pending') as CardStatus,
      type: (cardData.card_type ||
        cardData.type ||
        cardData.Type ||
        'virtual') as CardType,
      brand: cardData.brand || cardData.Brand || 'visa',
      balance: account?.availableBalance || cardData.balance || cardData.Balance || 0,
      currency: cardData.currency || cardData.Currency || 'USD',
      limits: {
        daily: 0,
        monthly: 0,
        perTransaction: 0,
        allowedCategories: [],
        allowedCurrencies: [cardData.currency || cardData.Currency || 'USD'],
        onlineEnabled: true,
        offlineEnabled: true,
      },
      isActive:
        (cardData.status || cardData.Status || 'pending').toLowerCase() === 'active',
      label: `${(
        cardData.type ||
        cardData.card_type ||
        cardData.Type ||
        'Virtual'
      ).toUpperCase()} ${cardNumber}`.trim(),
      billingAddress: buildBillingAddress(customer, cardData.billing, customerName),
      customer,
      account,
      fundingSource,
      metadata,
      expiryMonth,
      expiryYear,
      maskedPan,
      is2FAEnabled,
      is2FAEnrolled,
      isDefaultPINChanged,
      provider: cardProvider as CardProvider,
      providerCardId: cardData.providerReference || cardData.providerCardId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const parsedError = parseApiError(error, `/cards/${cardId}`);
      const enhancedError = new Error(parsedError.message) as Error & {
        apiError: typeof parsedError;
      };
      enhancedError.apiError = parsedError;
      throw enhancedError;
    }
    throw error;
  }
};

/**
 * Generate a secure token for displaying sensitive card data.
 */
export const generateCardToken = async (cardId: string): Promise<string> => {
  try {
    const response = await api.get(`/cards/${cardId}/token`);
    return response.data.token || response.data.cardToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const parsedError = parseApiError(error, `/cards/${cardId}/token`);
      const enhancedError = new Error(parsedError.message) as Error & {
        apiError: typeof parsedError;
      };
      enhancedError.apiError = parsedError;
      throw enhancedError;
    }
    throw error;
  }
};

export const freezeCard = async (cardId: string): Promise<VirtualCard> => {
  const response = await api.post(`/cards/${cardId}/freeze`);
  return response.data;
};

export const unfreezeCard = async (cardId: string): Promise<VirtualCard> => {
  const response = await api.post(`/cards/${cardId}/unfreeze`);
  return response.data;
};

export const updateCardLimits = async (
  cardId: string,
  limits: CardLimits
): Promise<VirtualCard> => {
  const response = await api.put(`/cards/${cardId}/limits`, limits);
  return response.data;
};

export const updateBillingAddress = async (
  cardId: string,
  billingAddress: BillingAddress
): Promise<VirtualCard> => {
  const response = await api.put(`/cards/${cardId}/billing-address`, billingAddress);
  return response.data;
};

export const deleteCard = async (cardId: string): Promise<void> => {
  await api.delete(`/cards/${cardId}`);
};

export const updateCardPIN = async (
  cardId: string,
  oldPin: string,
  newPin: string
): Promise<void> => {
  await api.put(`/cards/${cardId}/pin`, { oldPin, newPin });
};

/**
 * Fetch transactions for a specific card.
 */
export const getCardTransactions = async (
  cardId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    category?: TransactionCategory;
    status?: TransactionStatus;
  }
): Promise<CardTransaction[]> => {
  const params = new URLSearchParams();
  const pageSize = options?.limit ?? 20;
  const page =
    options?.offset && options.limit
      ? Math.floor(options.offset / options.limit) + 1
      : 1;
  params.append('page_size', String(pageSize));
  params.append('page', String(page));

  const startDate =
    options?.startDate ||
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = options?.endDate || new Date().toISOString().split('T')[0];
  params.append('start_date', startDate);
  params.append('end_date', endDate);

  const response = await api.get(`/cards/${cardId}/transactions?${params.toString()}`);
  const transactions = (response.data?.transactions ?? []) as TransactionApiResponse[];

  const mapStatus = (status: string): TransactionStatus => {
    switch ((status || '').toLowerCase()) {
      case 'success':
        return TransactionStatus.SUCCESS;
      case 'completed':
        return TransactionStatus.COMPLETED;
      case 'pending':
        return TransactionStatus.PENDING;
      case 'failed':
        return TransactionStatus.FAILED;
      case 'cancelled':
        return TransactionStatus.CANCELLED;
      default:
        return TransactionStatus.PENDING;
    }
  };

  const inferType = (description?: string): CardTransactionType => {
    const desc = (description || '').toLowerCase();
    if (desc.includes('topup') || desc.includes('top up') || desc.includes('card topup')) {
      return CardTransactionType.PURCHASE;
    }
    if (desc.includes('withdraw') || desc.includes('withdrawal')) {
      return CardTransactionType.WITHDRAWAL;
    }
    if (desc.includes('refund')) {
      return CardTransactionType.REFUND;
    }
    if (desc.includes('fee') || desc.includes('charge')) {
      return CardTransactionType.FEE;
    }
    return CardTransactionType.PURCHASE;
  };

  const extractMerchantName = (description: string): string => {
    if (description.toLowerCase().includes('card topup')) return 'Card Topup';
    if (description.toLowerCase().includes('declined')) return 'Declined Transaction';
    if (description.toLowerCase().includes('withdraw')) return 'Card Withdrawal';
    if (description.toLowerCase().includes('refund')) return 'Refund';

    const words = description.split(' ');
    if (words.length > 2) {
      const filtered = words.filter(
        (word) => !word.includes('****') && !word.match(/^\d{4}$/) && word.length > 2
      );
      return filtered.slice(0, 3).join(' ') || 'Merchant';
    }
    return description || 'Transaction';
  };

  const isPositiveTransaction = (description: string): boolean => {
    const desc = description.toLowerCase();
    return desc.includes('topup') || desc.includes('top up') || desc.includes('refund');
  };

  return transactions.map((tx) => {
    const amount =
      typeof tx.amount === 'string' ? parseFloat(tx.amount) || 0 : Number(tx.amount ?? 0);
    const description = tx.description || '';
    const merchantName = extractMerchantName(description);

    return {
      id: tx.trans_id || tx.id || `${cardId}-${tx.created_at || ''}-${tx.ref || ''}`,
      cardId,
      amount: isPositiveTransaction(description) ? Math.abs(amount) : -Math.abs(amount),
      currency: tx.currency || 'USD',
      fee: typeof tx.fee === 'string' ? parseFloat(tx.fee) || 0 : Number(tx.fee ?? 0),
      merchantName,
      merchantCategory: TransactionCategory.OTHER,
      description,
      date: typeof tx.created_at === 'string' ? tx.created_at : String(tx.created_at || ''),
      status: mapStatus(tx.status || ''),
      type: inferType(description),
      metadata: tx as unknown as Record<string, unknown>,
    };
  });
};

export const topupCard = async (
  cardId: string,
  amount: number
): Promise<CardTransaction> => {
  // Use miningApi for topup (requires mining JWT token)
  const response = await miningApi.post(`/cards/${cardId}/topup`, { amount });
  return response.data;
};

export const withdrawFromCard = async (
  cardId: string,
  amount: number
): Promise<CardTransaction> => {
  // Use miningApi for withdraw (requires mining JWT token)
  const response = await miningApi.post(`/cards/${cardId}/withdraw`, { amount });
  return response.data;
};

// Pre-order functions

export const createCardPreOrder = async (cardData: {
  type: string;
  currency: string;
  brand: string;
  amount: number;
  provider: string;
  requires3dSecure?: boolean;
  dailyLimitRequired?: number;
  monthlyLimitRequired?: number;
  singleTransactionLimit?: number;
  autoTopupEnabled?: boolean;
  cardNickname?: string;
}): Promise<CardPreOrder> => {
  try {
    const response = await api.post('/cards/pre-order', cardData);
    return response.data.preOrder;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      const status = error.response.status;

      if (status === 400 && errorData?.error) {
        const errorMessage = errorData.message || errorData.error;
        const userError = new Error(errorMessage) as EnhancedError;
        userError.isUserError = true;
        userError.statusCode = status;
        userError.details = errorData.details;
        throw userError;
      }

      const parsedError = parseApiError(error, '/cards/pre-order');
      const enhancedError = new Error(parsedError.message) as EnhancedError;
      enhancedError.apiError = parsedError;
      throw enhancedError;
    }
    throw error;
  }
};

export const getCardPreOrders = async (): Promise<CardPreOrder[]> => {
  try {
    const response = await api.get('/cards/pre-orders');
    return response.data?.preOrders || [];
  } catch (error) {
    // Return empty array if API fails to prevent stuck loading states
    console.error('Failed to load pre-orders:', error);
    return [];
  }
};

export const processCardPreOrder = async (
  preOrderId: string,
  bvn?: string
): Promise<{
  message: string;
  card: VirtualCard;
  preOrder: CardPreOrder;
}> => {
  try {
    const requestBody: { bvn?: string } = {};
    if (bvn) {
      requestBody.bvn = bvn;
    }
    const response = await api.post(`/cards/pre-orders/${preOrderId}/process`, requestBody);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      const status = error.response.status;

      // Extract user-friendly error message
      let errorMessage = 'Failed to process card. Please try again.';

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }

      // Check for BVN_REQUIRED error code
      const errorCode = (errorData as { code?: string })?.code;

      const enhancedError = new Error(errorMessage) as EnhancedError;
      enhancedError.isUserError = true;
      enhancedError.statusCode = status;
      enhancedError.details = { code: errorCode, ...errorData };
      throw enhancedError;
    }
    throw error;
  }
};
