import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  CryptoCurrency,
  CryptoDeposit,
  CryptoEstimate,
  Withdrawal,
  WalletTransaction,
} from '@/types/wallet';
import { POPULAR_CRYPTOCURRENCIES } from '@/types/wallet';

interface WalletContextType {
  // State
  currencies: CryptoCurrency[];
  deposits: CryptoDeposit[];
  withdrawals: Withdrawal[];
  transactions: WalletTransaction[];
  gameWalletAddress: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCurrencies: () => Promise<void>;
  getCryptoEstimate: (amount: number, currency: string) => Promise<CryptoEstimate | null>;
  createDeposit: (amount: number, currency: string) => Promise<CryptoDeposit | null>;
  getDepositStatus: (depositId: number) => Promise<CryptoDeposit | null>;
  loadGameWalletAddress: () => Promise<string | null>;
  submitWithdrawal: (amount: number, address: string) => Promise<Withdrawal | null>;
  loadTransactions: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [currencies, setCurrencies] = useState<CryptoCurrency[]>(POPULAR_CRYPTOCURRENCIES);
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [gameWalletAddress, setGameWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load available cryptocurrencies
  const loadCurrencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/crypto/currencies');
      // setCurrencies(response.data);

      // Mock - using predefined currencies
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCurrencies(POPULAR_CRYPTOCURRENCIES);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load currencies';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get crypto estimate for USD amount
  const getCryptoEstimate = useCallback(
    async (amount: number, currency: string): Promise<CryptoEstimate | null> => {
      try {
        // TODO: Replace with actual API call
        // const response = await api.get('/crypto/estimate', { params: { amount, currency } });
        // return response.data;

        // Mock estimate
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock exchange rates
        const rates: Record<string, number> = {
          btc: 0.000024,
          eth: 0.00042,
          ltc: 0.012,
          doge: 12.5,
          sol: 0.05,
          usdttrc20: 1.0,
          usdcbase: 1.0,
          trx: 8.5,
        };

        const rate = rates[currency] || 1;
        return {
          estimatedAmount: amount * rate,
          currency,
          rate,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get estimate';
        setError(message);
        return null;
      }
    },
    []
  );

  // Create a new crypto deposit
  const createDeposit = useCallback(
    async (amount: number, currency: string): Promise<CryptoDeposit | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        // const response = await api.post('/crypto/deposit', { amount, currency });
        // const deposit = response.data;

        // Mock deposit creation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const estimate = await getCryptoEstimate(amount, currency);
        if (!estimate) throw new Error('Failed to get estimate');

        const mockDeposit: CryptoDeposit = {
          id: Date.now(),
          paymentId: `PAY_${Date.now()}`,
          payAddress: generateMockAddress(currency),
          payCurrency: currency.toUpperCase(),
          payAmount: estimate.estimatedAmount,
          priceAmount: amount,
          priceCurrency: 'USD',
          status: 'waiting',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        setDeposits((prev) => [mockDeposit, ...prev]);
        return mockDeposit;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create deposit';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getCryptoEstimate]
  );

  // Get deposit status
  const getDepositStatus = useCallback(
    async (depositId: number): Promise<CryptoDeposit | null> => {
      try {
        // TODO: Replace with actual API call
        // const response = await api.get(`/crypto/deposit/${depositId}`);
        // return response.data;

        // Mock - return existing deposit with potential status update
        await new Promise((resolve) => setTimeout(resolve, 500));

        const existingDeposit = deposits.find((d) => d.id === depositId);
        if (!existingDeposit) return null;

        // Simulate status progression (for demo purposes)
        // In production, this would come from the API
        return existingDeposit;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to get deposit status';
        setError(message);
        return null;
      }
    },
    [deposits]
  );

  // Load game wallet deposit address
  const loadGameWalletAddress = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/game-deposit-address');
      // setGameWalletAddress(response.data.address);
      // return response.data.address;

      // Mock address
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f8b2E1';
      setGameWalletAddress(mockAddress);
      return mockAddress;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet address';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit withdrawal request
  const submitWithdrawal = useCallback(
    async (amount: number, address: string): Promise<Withdrawal | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API call
        // const response = await api.post('/submit-game-withdrawal', {
        //   amount,
        //   destinationAddress: address,
        // });
        // const withdrawal = response.data;

        // Mock withdrawal
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockWithdrawal: Withdrawal = {
          id: `WD_${Date.now()}`,
          userId: 'user_123',
          usdAmount: amount,
          walletAddress: address,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        setWithdrawals((prev) => [mockWithdrawal, ...prev]);
        return mockWithdrawal;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit withdrawal';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load transaction history
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/wallet/transactions');
      // setTransactions(response.data);

      // Mock transactions
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTransactions([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: WalletContextType = {
    currencies,
    deposits,
    withdrawals,
    transactions,
    gameWalletAddress,
    isLoading,
    error,
    loadCurrencies,
    getCryptoEstimate,
    createDeposit,
    getDepositStatus,
    loadGameWalletAddress,
    submitWithdrawal,
    loadTransactions,
    clearError,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Helper function to generate mock addresses
function generateMockAddress(currency: string): string {
  const prefixes: Record<string, string> = {
    btc: 'bc1q',
    eth: '0x',
    ltc: 'ltc1q',
    doge: 'D',
    sol: '',
    usdttrc20: 'T',
    usdcbase: '0x',
    trx: 'T',
  };

  const prefix = prefixes[currency] || '0x';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let address = prefix;

  const length = currency === 'btc' || currency === 'ltc' ? 39 : currency === 'sol' ? 44 : 40;

  for (let i = prefix.length; i < length; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }

  return address;
}

export default WalletContext;
