import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  VirtualCard,
  CardTransaction,
  CardPreOrder,
  CardLimits,
  BillingAddress,
} from '@/types/card';
import * as cardApi from '@/lib/api/cards';
import { useAuth } from './AuthContext';

// State Types
interface VirtualCardState {
  cards: VirtualCard[];
  selectedCard: VirtualCard | null;
  transactions: Record<string, CardTransaction[]>;
  preOrders: CardPreOrder[];
  isLoading: boolean;
  isLoadingTransactions: boolean;
  isCreatingCard: boolean;
  isProcessingPreOrder: boolean;
  error: string | null;
  lastSync: Date | null;
}

// Action Types
type VirtualCardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_TRANSACTIONS'; payload: boolean }
  | { type: 'SET_CREATING_CARD'; payload: boolean }
  | { type: 'SET_PROCESSING_PRE_ORDER'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CARDS'; payload: VirtualCard[] }
  | { type: 'SET_SELECTED_CARD'; payload: VirtualCard | null }
  | { type: 'UPDATE_CARD'; payload: VirtualCard }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: { cardId: string; transactions: CardTransaction[] } }
  | { type: 'ADD_TRANSACTION'; payload: { cardId: string; transaction: CardTransaction } }
  | { type: 'SET_PRE_ORDERS'; payload: CardPreOrder[] }
  | { type: 'ADD_PRE_ORDER'; payload: CardPreOrder }
  | { type: 'UPDATE_PRE_ORDER'; payload: CardPreOrder }
  | { type: 'REMOVE_PRE_ORDER'; payload: string }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'RESET_STATE' };

// Initial State
const initialState: VirtualCardState = {
  cards: [],
  selectedCard: null,
  transactions: {},
  preOrders: [],
  isLoading: false,
  isLoadingTransactions: false,
  isCreatingCard: false,
  isProcessingPreOrder: false,
  error: null,
  lastSync: null,
};

// Reducer
function virtualCardReducer(
  state: VirtualCardState,
  action: VirtualCardAction
): VirtualCardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_LOADING_TRANSACTIONS':
      return { ...state, isLoadingTransactions: action.payload };

    case 'SET_CREATING_CARD':
      return { ...state, isCreatingCard: action.payload };

    case 'SET_PROCESSING_PRE_ORDER':
      return { ...state, isProcessingPreOrder: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CARDS':
      return {
        ...state,
        cards: action.payload,
        // Update selected card if it exists in the new list
        selectedCard: state.selectedCard
          ? action.payload.find((c) => c.id === state.selectedCard?.id) || null
          : action.payload[0] || null,
      };

    case 'SET_SELECTED_CARD':
      return { ...state, selectedCard: action.payload };

    case 'UPDATE_CARD': {
      const updatedCards = state.cards.map((card) =>
        card.id === action.payload.id ? action.payload : card
      );
      return {
        ...state,
        cards: updatedCards,
        selectedCard:
          state.selectedCard?.id === action.payload.id
            ? action.payload
            : state.selectedCard,
      };
    }

    case 'REMOVE_CARD': {
      const filteredCards = state.cards.filter((c) => c.id !== action.payload);
      return {
        ...state,
        cards: filteredCards,
        selectedCard:
          state.selectedCard?.id === action.payload
            ? filteredCards[0] || null
            : state.selectedCard,
        transactions: Object.fromEntries(
          Object.entries(state.transactions).filter(([key]) => key !== action.payload)
        ),
      };
    }

    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.cardId]: action.payload.transactions,
        },
      };

    case 'ADD_TRANSACTION': {
      const existingTransactions = state.transactions[action.payload.cardId] || [];
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.payload.cardId]: [action.payload.transaction, ...existingTransactions],
        },
      };
    }

    case 'SET_PRE_ORDERS':
      return { ...state, preOrders: action.payload };

    case 'ADD_PRE_ORDER':
      return { ...state, preOrders: [action.payload, ...state.preOrders] };

    case 'UPDATE_PRE_ORDER': {
      const updatedPreOrders = state.preOrders.map((po) =>
        po.id === action.payload.id ? action.payload : po
      );
      return { ...state, preOrders: updatedPreOrders };
    }

    case 'REMOVE_PRE_ORDER':
      return {
        ...state,
        preOrders: state.preOrders.filter((po) => po.id !== action.payload),
      };

    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context Type
interface VirtualCardContextType extends VirtualCardState {
  // Card Operations
  loadCards: (forceSync?: boolean) => Promise<void>;
  selectCard: (card: VirtualCard | null) => void;
  getCardDetails: (cardId: string, reveal?: boolean) => Promise<VirtualCard>;
  freezeCard: (cardId: string) => Promise<void>;
  unfreezeCard: (cardId: string) => Promise<void>;
  updateCardLimits: (cardId: string, limits: CardLimits) => Promise<void>;
  updateBillingAddress: (cardId: string, address: BillingAddress) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  updateCardPIN: (cardId: string, oldPin: string, newPin: string) => Promise<void>;
  generateCardToken: (cardId: string) => Promise<string>;

  // Transaction Operations
  loadTransactions: (
    cardId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<void>;
  topupCard: (cardId: string, amount: number) => Promise<void>;
  withdrawFromCard: (cardId: string, amount: number) => Promise<void>;

  // Pre-order Operations
  loadPreOrders: () => Promise<void>;
  createPreOrder: (data: {
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
  }) => Promise<CardPreOrder>;
  processPreOrder: (preOrderId: string, bvn?: string) => Promise<VirtualCard>;

  // Utility
  clearError: () => void;
  refreshAll: () => Promise<void>;

  // Computed values
  activeCards: VirtualCard[];
  frozenCards: VirtualCard[];
  pendingPreOrders: CardPreOrder[];
  totalBalance: number;
  hasCards: boolean;
}

// Create Context
const VirtualCardContext = createContext<VirtualCardContextType | null>(null);

// Provider Component
interface VirtualCardProviderProps {
  children: ReactNode;
}

export function VirtualCardProvider({ children }: VirtualCardProviderProps) {
  const [state, dispatch] = useReducer(virtualCardReducer, initialState);
  const { user, loading } = useAuth();

  // Clear state on logout
  useEffect(() => {
    if (!loading && !user) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [loading, user]);

  // Card Operations
  const loadCards = useCallback(async (forceSync = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const cards = await cardApi.getVirtualCards(forceSync);
      dispatch({ type: 'SET_CARDS', payload: cards });
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load cards';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectCard = useCallback((card: VirtualCard | null) => {
    dispatch({ type: 'SET_SELECTED_CARD', payload: card });
  }, []);

  const getCardDetails = useCallback(async (cardId: string, reveal = false) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const card = await cardApi.getCardById(cardId, reveal);
      dispatch({ type: 'UPDATE_CARD', payload: card });
      return card;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get card details';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const freezeCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await cardApi.freezeCard(cardId);
      // Refresh card details
      const card = await cardApi.getCardById(cardId);
      dispatch({ type: 'UPDATE_CARD', payload: card });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to freeze card';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const unfreezeCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await cardApi.unfreezeCard(cardId);
      // Refresh card details
      const card = await cardApi.getCardById(cardId);
      dispatch({ type: 'UPDATE_CARD', payload: card });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unfreeze card';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const updateCardLimits = useCallback(async (cardId: string, limits: CardLimits) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updatedCard = await cardApi.updateCardLimits(cardId, limits);
      dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update card limits';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const updateBillingAddress = useCallback(
    async (cardId: string, address: BillingAddress) => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const updatedCard = await cardApi.updateBillingAddress(cardId, address);
        dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update billing address';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },
    []
  );

  const deleteCard = useCallback(async (cardId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await cardApi.deleteCard(cardId);
      dispatch({ type: 'REMOVE_CARD', payload: cardId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete card';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const updateCardPIN = useCallback(
    async (cardId: string, oldPin: string, newPin: string) => {
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        await cardApi.updateCardPIN(cardId, oldPin, newPin);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update PIN';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      }
    },
    []
  );

  const generateCardToken = useCallback(async (cardId: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      return await cardApi.generateCardToken(cardId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate card token';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // Transaction Operations
  const loadTransactions = useCallback(
    async (
      cardId: string,
      options?: {
        limit?: number;
        offset?: number;
        startDate?: string;
        endDate?: string;
      }
    ) => {
      dispatch({ type: 'SET_LOADING_TRANSACTIONS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const transactions = await cardApi.getCardTransactions(cardId, options);
        dispatch({ type: 'SET_TRANSACTIONS', payload: { cardId, transactions } });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load transactions';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING_TRANSACTIONS', payload: false });
      }
    },
    []
  );

  const topupCard = useCallback(async (cardId: string, amount: number) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const transaction = await cardApi.topupCard(cardId, amount);
      dispatch({ type: 'ADD_TRANSACTION', payload: { cardId, transaction } });
      // Refresh card to update balance
      const card = await cardApi.getCardById(cardId);
      dispatch({ type: 'UPDATE_CARD', payload: card });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to top up card';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  const withdrawFromCard = useCallback(async (cardId: string, amount: number) => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const transaction = await cardApi.withdrawFromCard(cardId, amount);
      dispatch({ type: 'ADD_TRANSACTION', payload: { cardId, transaction } });
      // Refresh card to update balance
      const card = await cardApi.getCardById(cardId);
      dispatch({ type: 'UPDATE_CARD', payload: card });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to withdraw from card';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, []);

  // Pre-order Operations
  const loadPreOrders = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const preOrders = await cardApi.getCardPreOrders();
      // Ensure we only set valid pre-orders array
      dispatch({ type: 'SET_PRE_ORDERS', payload: Array.isArray(preOrders) ? preOrders : [] });
    } catch (error) {
      // Don't throw - just set empty pre-orders to prevent stuck loading states
      console.error('Failed to load pre-orders:', error);
      dispatch({ type: 'SET_PRE_ORDERS', payload: [] });
    }
  }, []);

  const createPreOrder = useCallback(
    async (data: {
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
    }) => {
      dispatch({ type: 'SET_CREATING_CARD', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const preOrder = await cardApi.createCardPreOrder(data);
        dispatch({ type: 'ADD_PRE_ORDER', payload: preOrder });
        return preOrder;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create pre-order';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw error;
      } finally {
        dispatch({ type: 'SET_CREATING_CARD', payload: false });
      }
    },
    []
  );

  const processPreOrder = useCallback(async (preOrderId: string, bvn?: string) => {
    dispatch({ type: 'SET_PROCESSING_PRE_ORDER', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('[VirtualCardContext] Processing pre-order:', preOrderId);
      const result = await cardApi.processCardPreOrder(preOrderId, bvn);
      console.log('[VirtualCardContext] processCardPreOrder result:', result);

      dispatch({ type: 'UPDATE_PRE_ORDER', payload: result.preOrder });

      // Reload cards to include the new one
      console.log('[VirtualCardContext] Reloading cards...');
      const cards = await cardApi.getVirtualCards(true);
      console.log('[VirtualCardContext] getVirtualCards returned:', cards.length, 'cards', cards);

      dispatch({ type: 'SET_CARDS', payload: cards });
      return result.card;
    } catch (error) {
      console.error('[VirtualCardContext] processPreOrder error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to process pre-order';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_PROCESSING_PRE_ORDER', payload: false });
    }
  }, []);

  // Utility
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadCards(true), loadPreOrders()]);
  }, [loadCards, loadPreOrders]);

  // Computed values
  const activeCards = useMemo(
    () => state.cards.filter((c) => c.status === 'active'),
    [state.cards]
  );

  const frozenCards = useMemo(
    () => state.cards.filter((c) => c.status === 'frozen'),
    [state.cards]
  );

  const pendingPreOrders = useMemo(
    () =>
      state.preOrders.filter(
        (po) =>
          po.status === 'pending_kyc' ||
          po.status === 'kyc_approved' ||
          po.status === 'processing' ||
          po.status === 'pending_sync'
      ),
    [state.preOrders]
  );

  const totalBalance = useMemo(
    () => state.cards.reduce((sum, card) => sum + (card.balance || 0), 0),
    [state.cards]
  );

  const hasCards = useMemo(() => state.cards.length > 0, [state.cards]);

  // Auto-load cards when authenticated
  useEffect(() => {
    if (!loading && user) {
      loadCards().catch(console.error);
      loadPreOrders().catch(console.error);
    }
  }, [loading, user, loadCards, loadPreOrders]);

  const value: VirtualCardContextType = {
    ...state,
    loadCards,
    selectCard,
    getCardDetails,
    freezeCard,
    unfreezeCard,
    updateCardLimits,
    updateBillingAddress,
    deleteCard,
    updateCardPIN,
    generateCardToken,
    loadTransactions,
    topupCard,
    withdrawFromCard,
    loadPreOrders,
    createPreOrder,
    processPreOrder,
    clearError,
    refreshAll,
    activeCards,
    frozenCards,
    pendingPreOrders,
    totalBalance,
    hasCards,
  };

  return (
    <VirtualCardContext.Provider value={value}>{children}</VirtualCardContext.Provider>
  );
}

// Hook
export function useVirtualCards() {
  const context = useContext(VirtualCardContext);
  if (!context) {
    throw new Error('useVirtualCards must be used within a VirtualCardProvider');
  }
  return context;
}

export default VirtualCardContext;
