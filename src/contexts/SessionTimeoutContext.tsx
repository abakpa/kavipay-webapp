import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuth } from '@/contexts/AuthContext';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';

interface SessionTimeoutContextType {
  /** Reset the session timeout (e.g., after user confirms activity) */
  resetTimeout: () => void;
  /** Time remaining until timeout (in milliseconds) */
  timeRemaining: number;
  /** Whether session timeout is enabled */
  isEnabled: boolean;
  /** Enable/disable session timeout */
  setEnabled: (enabled: boolean) => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | null>(null);

// Session timeout configuration
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION = 60 * 1000; // 1 minute warning before timeout

interface SessionTimeoutProviderProps {
  children: ReactNode;
}

export function SessionTimeoutProvider({ children }: SessionTimeoutProviderProps) {
  const { user, logout } = useAuth();
  const [isEnabled, setEnabled] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const handleTimeout = useCallback(() => {
    setShowWarning(false);
    logout();
  }, [logout]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
  }, []);

  const {
    timeRemaining,
    isWarningVisible,
    resetTimeout,
    dismissWarning,
    triggerTimeout,
  } = useSessionTimeout({
    timeout: SESSION_TIMEOUT,
    warningDuration: WARNING_DURATION,
    onTimeout: handleTimeout,
    onWarning: handleWarning,
    enabled: isEnabled && !!user, // Only enable when user is logged in
  });

  const handleStayLoggedIn = useCallback(() => {
    setShowWarning(false);
    dismissWarning();
  }, [dismissWarning]);

  const handleLogoutNow = useCallback(() => {
    setShowWarning(false);
    triggerTimeout();
  }, [triggerTimeout]);

  return (
    <SessionTimeoutContext.Provider
      value={{
        resetTimeout,
        timeRemaining,
        isEnabled,
        setEnabled,
      }}
    >
      {children}

      {/* Session Timeout Warning Modal */}
      <SessionTimeoutWarning
        isOpen={showWarning && isWarningVisible}
        timeRemaining={timeRemaining}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogoutNow}
      />
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeoutContext() {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error(
      'useSessionTimeoutContext must be used within a SessionTimeoutProvider'
    );
  }
  return context;
}
