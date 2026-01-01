import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  UtilityTransaction,
  DataBundle,
  TvProvider,
  TvPackage,
  MeterVerificationResponse,
  SmartCardVerificationResponse,
} from '@/types/utilities';
import { TransactionTypes } from '@/types/utilities';
import * as utilitiesApi from '@/lib/api/utilities';

interface UtilitiesContextType {
  // State
  currentTransaction: UtilityTransaction | null;
  transactions: utilitiesApi.UtilityTransaction[];
  dataBundles: DataBundle[];
  tvProviders: TvProvider[];
  tvPackages: TvPackage[];
  meterVerification: MeterVerificationResponse['data'] | null;
  smartCardVerification: SmartCardVerificationResponse['data'] | null;
  isLoading: boolean;
  error: string | null;

  // Transaction Actions
  setCurrentTransaction: (transaction: UtilityTransaction) => void;
  clearCurrentTransaction: () => void;
  loadTransactionHistory: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => Promise<void>;

  // Airtime Actions
  buyAirtime: (data: {
    network: string;
    phoneNumber: string;
    amountInNaira: number;
    paymentMethod: string;
  }) => Promise<{ success: boolean; message: string; transactionId?: string }>;

  // Data Actions
  loadDataBundles: (serviceId: string) => Promise<void>;
  buyData: (data: {
    phoneNumber: string;
    amountInNaira: number;
    network: string;
    variationCode: string;
    paymentMethod: string;
  }) => Promise<{ success: boolean; message: string; transactionId?: string }>;

  // Electricity Actions
  verifyMeterNumber: (data: {
    meterNumber: string;
    serviceId: string;
    serviceType: string;
  }) => Promise<MeterVerificationResponse | null>;
  buyPower: (data: {
    meterNumber: string;
    amountInNaira: number;
    serviceId: string;
    serviceType: string;
    phoneNumber: string;
    paymentMethod: string;
  }) => Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
    data?: { token?: string; units?: string };
  }>;
  clearMeterVerification: () => void;

  // TV Actions
  loadTvProviders: () => Promise<void>;
  loadTvPackages: (providerId: string) => Promise<void>;
  verifySmartCardNumber: (data: {
    cardNumber: string;
    serviceId: string;
  }) => Promise<SmartCardVerificationResponse | null>;
  subscribeTv: (data: {
    cardNumber: string;
    amountInNaira: number;
    serviceId: string;
    variationCode: string;
    phoneNumber: string;
    paymentMethod: string;
  }) => Promise<{ success: boolean; message: string; transactionId?: string }>;
  clearSmartCardVerification: () => void;

  // Utility
  clearError: () => void;
}

const UtilitiesContext = createContext<UtilitiesContextType | null>(null);

export function useUtilities(): UtilitiesContextType {
  const context = useContext(UtilitiesContext);
  if (!context) {
    throw new Error('useUtilities must be used within a UtilitiesProvider');
  }
  return context;
}

interface UtilitiesProviderProps {
  children: ReactNode;
}

export function UtilitiesProvider({ children }: UtilitiesProviderProps) {
  const [currentTransaction, setCurrentTransactionState] = useState<UtilityTransaction | null>(null);
  const [transactions, setTransactions] = useState<utilitiesApi.UtilityTransaction[]>([]);
  const [dataBundles, setDataBundles] = useState<DataBundle[]>([]);
  const [tvProviders, setTvProviders] = useState<TvProvider[]>([]);
  const [tvPackages, setTvPackages] = useState<TvPackage[]>([]);
  const [meterVerification, setMeterVerification] = useState<MeterVerificationResponse['data'] | null>(null);
  const [smartCardVerification, setSmartCardVerification] = useState<SmartCardVerificationResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Transaction Actions
  const setCurrentTransaction = useCallback((transaction: UtilityTransaction) => {
    setCurrentTransactionState(transaction);
    setError(null);
  }, []);

  const clearCurrentTransaction = useCallback(() => {
    setCurrentTransactionState(null);
    setError(null);
  }, []);

  const loadTransactionHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.getUserUtilityTransactions(params);
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Airtime Actions
  const buyAirtime = useCallback(async (data: {
    network: string;
    phoneNumber: string;
    amountInNaira: number;
    paymentMethod: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.buyAirtime({
        network: data.network,
        phoneNumber: data.phoneNumber,
        amountInNaira: data.amountInNaira,
        currencyNetwork: 'base',
        currency: 'ETH',
        paymentMethod: data.paymentMethod,
      });

      if (response.success) {
        // Update current transaction
        setCurrentTransactionState({
          type: TransactionTypes.BuyAirtime,
          networkProvider: data.network,
          phoneNumber: data.phoneNumber,
          amount: data.amountInNaira,
          paymentMethod: data.paymentMethod as 'wallet' | 'crypto',
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy airtime';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Data Actions
  const loadDataBundles = useCallback(async (serviceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.getDataBundles(serviceId);
      if (response.success) {
        setDataBundles(response.data);
      } else {
        setDataBundles([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data bundles';
      setError(message);
      setDataBundles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyData = useCallback(async (data: {
    phoneNumber: string;
    amountInNaira: number;
    network: string;
    variationCode: string;
    paymentMethod: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.buyData({
        phoneNumber: data.phoneNumber,
        amountInNaira: data.amountInNaira,
        network: data.network,
        variationCode: data.variationCode,
        currency: 'ETH',
        paymentMethod: data.paymentMethod,
      });

      if (response.success) {
        setCurrentTransactionState({
          type: TransactionTypes.BuyData,
          networkProvider: data.network,
          phoneNumber: data.phoneNumber,
          amount: data.amountInNaira,
          variationCode: data.variationCode,
          paymentMethod: data.paymentMethod as 'wallet' | 'crypto',
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy data';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Electricity Actions
  const verifyMeterNumber = useCallback(async (data: {
    meterNumber: string;
    serviceId: string;
    serviceType: string;
  }): Promise<MeterVerificationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.verifyMeterNumber(data);
      if (response.success) {
        setMeterVerification(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify meter number';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyPower = useCallback(async (data: {
    meterNumber: string;
    amountInNaira: number;
    serviceId: string;
    serviceType: string;
    phoneNumber: string;
    paymentMethod: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.buyPower({
        meterNumber: data.meterNumber,
        amountInNaira: data.amountInNaira,
        serviceId: data.serviceId,
        serviceType: data.serviceType,
        currency: 'ETH',
        paymentMethod: data.paymentMethod,
        phoneNumber: data.phoneNumber,
      });

      if (response.success) {
        setCurrentTransactionState({
          type: TransactionTypes.BuyPower,
          meterNumber: data.meterNumber,
          amount: data.amountInNaira,
          serviceId: data.serviceId,
          serviceType: data.serviceType,
          paymentMethod: data.paymentMethod as 'wallet' | 'crypto',
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy power';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMeterVerification = useCallback(() => {
    setMeterVerification(null);
  }, []);

  // TV Actions
  const loadTvProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.getTvProviders();
      if (response.success) {
        setTvProviders(response.data.map(p => ({
          serviceId: p.serviceId,
          name: p.name,
        })));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load TV providers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTvPackages = useCallback(async (providerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.getTvPackages(providerId);
      if (response.success) {
        setTvPackages(response.data.map(p => ({
          variationCode: p.variationCode,
          name: p.name,
          amount: p.amount,
          fixedPrice: p.fixedPrice,
        })));
      } else {
        setTvPackages([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load TV packages';
      setError(message);
      setTvPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifySmartCardNumber = useCallback(async (data: {
    cardNumber: string;
    serviceId: string;
  }): Promise<SmartCardVerificationResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.verifySmartCardNumber(data);
      if (response.success) {
        setSmartCardVerification(response.data);
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify smart card number';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribeTv = useCallback(async (data: {
    cardNumber: string;
    amountInNaira: number;
    serviceId: string;
    variationCode: string;
    phoneNumber: string;
    paymentMethod: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await utilitiesApi.subscribeTv({
        cardNumber: data.cardNumber,
        amountInNaira: data.amountInNaira,
        serviceId: data.serviceId,
        variationCode: data.variationCode,
        phoneNumber: data.phoneNumber,
        currency: 'ETH',
        paymentMethod: data.paymentMethod,
      });

      if (response.success) {
        setCurrentTransactionState({
          type: TransactionTypes.TvSubscription,
          cardNumber: data.cardNumber,
          amount: data.amountInNaira,
          serviceId: data.serviceId,
          variationCode: data.variationCode,
          paymentMethod: data.paymentMethod as 'wallet' | 'crypto',
        });
      }

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe to TV';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSmartCardVerification = useCallback(() => {
    setSmartCardVerification(null);
  }, []);

  const value: UtilitiesContextType = {
    // State
    currentTransaction,
    transactions,
    dataBundles,
    tvProviders,
    tvPackages,
    meterVerification,
    smartCardVerification,
    isLoading,
    error,

    // Transaction Actions
    setCurrentTransaction,
    clearCurrentTransaction,
    loadTransactionHistory,

    // Airtime Actions
    buyAirtime,

    // Data Actions
    loadDataBundles,
    buyData,

    // Electricity Actions
    verifyMeterNumber,
    buyPower,
    clearMeterVerification,

    // TV Actions
    loadTvProviders,
    loadTvPackages,
    verifySmartCardNumber,
    subscribeTv,
    clearSmartCardVerification,

    // Utility
    clearError,
  };

  return <UtilitiesContext.Provider value={value}>{children}</UtilitiesContext.Provider>;
}

export default UtilitiesContext;
