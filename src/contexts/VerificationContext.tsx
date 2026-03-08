import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  getVerificationStatus,
  type VerificationStatus,
  type VerificationMethod,
} from '@/lib/api/verification';
import { useAuth } from './AuthContext';

interface VerificationContextType {
  // Status
  status: VerificationStatus | null;
  preferredMethod: VerificationMethod;
  availableMethods: VerificationMethod[];
  isLoading: boolean;

  // Token management
  currentToken: string | null;
  setVerificationToken: (token: string) => void;
  clearVerificationToken: () => void;
  getTokenHeader: () => Record<string, string>;

  // Refresh
  refreshStatus: () => Promise<void>;
}

const VerificationContext = createContext<VerificationContextType | null>(null);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [currentToken, setCurrentTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const s = await getVerificationStatus();
      setStatus(s);
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load verification status when user changes
  useEffect(() => {
    if (user) {
      refreshStatus();
    } else {
      setStatus(null);
      setCurrentTokenState(null);
    }
  }, [user, refreshStatus]);

  const setVerificationToken = useCallback((token: string) => {
    setCurrentTokenState(token);
  }, []);

  const clearVerificationToken = useCallback(() => {
    setCurrentTokenState(null);
  }, []);

  const getTokenHeader = useCallback((): Record<string, string> => {
    if (!currentToken) return {};
    return { 'X-Verification-Token': currentToken };
  }, [currentToken]);

  const preferredMethod = status?.preferred_method || 'pin';
  const availableMethods = status?.available_methods || [];

  return (
    <VerificationContext.Provider
      value={{
        status,
        preferredMethod,
        availableMethods,
        isLoading,
        currentToken,
        setVerificationToken,
        clearVerificationToken,
        getTokenHeader,
        refreshStatus,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
}
