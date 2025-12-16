import { useEffect, useRef, useCallback, useState } from 'react';

interface UseSessionTimeoutOptions {
  /** Timeout duration in milliseconds (default: 15 minutes) */
  timeout?: number;
  /** Warning duration before timeout in milliseconds (default: 1 minute) */
  warningDuration?: number;
  /** Callback when session times out */
  onTimeout: () => void;
  /** Callback when warning should be shown */
  onWarning?: () => void;
  /** Whether the timeout is enabled */
  enabled?: boolean;
}

interface UseSessionTimeoutReturn {
  /** Time remaining until timeout (in milliseconds) */
  timeRemaining: number;
  /** Whether the warning is currently showing */
  isWarningVisible: boolean;
  /** Reset the timeout (e.g., when user confirms they're still active) */
  resetTimeout: () => void;
  /** Manually trigger timeout */
  triggerTimeout: () => void;
  /** Dismiss warning and reset timeout */
  dismissWarning: () => void;
}

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
] as const;

const STORAGE_KEY = 'kavipay_last_activity';

export function useSessionTimeout({
  timeout = 15 * 60 * 1000, // 15 minutes default
  warningDuration = 60 * 1000, // 1 minute warning
  onTimeout,
  onWarning,
  enabled = true,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Update last activity in localStorage (for cross-tab sync)
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(STORAGE_KEY, now.toString());
  }, []);

  // Start the countdown interval
  const startCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, timeout - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearAllTimers();
        onTimeout();
      }
    }, 1000);
  }, [timeout, onTimeout, clearAllTimers]);

  // Reset timeout and hide warning
  const resetTimeout = useCallback(() => {
    if (!enabled) return;

    clearAllTimers();
    setIsWarningVisible(false);
    updateLastActivity();
    setTimeRemaining(timeout);

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      onWarning?.();
      startCountdown();
    }, timeout - warningDuration);

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      onTimeout();
    }, timeout);
  }, [enabled, timeout, warningDuration, onTimeout, onWarning, clearAllTimers, updateLastActivity, startCountdown]);

  // Trigger timeout manually
  const triggerTimeout = useCallback(() => {
    clearAllTimers();
    setIsWarningVisible(false);
    onTimeout();
  }, [clearAllTimers, onTimeout]);

  // Dismiss warning and reset
  const dismissWarning = useCallback(() => {
    setIsWarningVisible(false);
    resetTimeout();
  }, [resetTimeout]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (!enabled) return;

    // Only reset if warning is not visible
    // When warning is visible, user must explicitly click "Stay Logged In"
    if (!isWarningVisible) {
      resetTimeout();
    }
  }, [enabled, isWarningVisible, resetTimeout]);

  // Check for activity in other tabs
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      const lastActivity = parseInt(event.newValue, 10);
      if (!isNaN(lastActivity) && lastActivity > lastActivityRef.current) {
        lastActivityRef.current = lastActivity;
        if (!isWarningVisible) {
          resetTimeout();
        }
      }
    }
  }, [isWarningVisible, resetTimeout]);

  // Handle visibility change (tab switching)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && enabled) {
      // Check if session should have timed out while tab was hidden
      const storedActivity = localStorage.getItem(STORAGE_KEY);
      if (storedActivity) {
        const lastActivity = parseInt(storedActivity, 10);
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= timeout) {
          // Session has expired
          clearAllTimers();
          onTimeout();
        } else if (elapsed >= timeout - warningDuration) {
          // Should show warning
          setIsWarningVisible(true);
          lastActivityRef.current = lastActivity;
          startCountdown();
        } else {
          // Still active, sync the timer
          lastActivityRef.current = lastActivity;
          setTimeRemaining(timeout - elapsed);
        }
      }
    }
  }, [enabled, timeout, warningDuration, onTimeout, clearAllTimers, startCountdown]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      return;
    }

    // Initialize
    resetTimeout();

    // Add activity listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Add storage listener for cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, resetTimeout, handleActivity, handleStorageChange, handleVisibilityChange, clearAllTimers]);

  return {
    timeRemaining,
    isWarningVisible,
    resetTimeout,
    triggerTimeout,
    dismissWarning,
  };
}
