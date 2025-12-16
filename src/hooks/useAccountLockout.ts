import { useState, useEffect, useCallback } from 'react';

interface LockoutState {
  attempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number | null;
}

interface UseAccountLockoutOptions {
  /** Maximum number of failed attempts before lockout (default: 5) */
  maxAttempts?: number;
  /** Lockout duration in milliseconds (default: 5 minutes) */
  lockoutDuration?: number;
  /** Time window to count attempts in milliseconds (default: 15 minutes) */
  attemptWindow?: number;
  /** Storage key for persisting lockout state */
  storageKey?: string;
}

interface UseAccountLockoutReturn {
  /** Whether the account is currently locked out */
  isLockedOut: boolean;
  /** Number of failed attempts */
  attempts: number;
  /** Remaining attempts before lockout */
  remainingAttempts: number;
  /** Time remaining on lockout in milliseconds */
  lockoutTimeRemaining: number;
  /** Record a failed login attempt */
  recordFailedAttempt: () => void;
  /** Reset attempts (call on successful login) */
  resetAttempts: () => void;
  /** Check if should show warning (e.g., 2 attempts left) */
  shouldShowWarning: boolean;
  /** Formatted time remaining (e.g., "4:30") */
  formattedTimeRemaining: string;
}

const DEFAULT_STORAGE_KEY = 'kavipay_lockout_state';

export function useAccountLockout({
  maxAttempts = 5,
  lockoutDuration = 5 * 60 * 1000, // 5 minutes
  attemptWindow = 15 * 60 * 1000, // 15 minutes
  storageKey = DEFAULT_STORAGE_KEY,
}: UseAccountLockoutOptions = {}): UseAccountLockoutReturn {
  const [state, setState] = useState<LockoutState>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as LockoutState;

        // Check if lockout has expired
        if (parsed.lockedUntil && Date.now() >= parsed.lockedUntil) {
          // Lockout expired, reset state
          const resetState: LockoutState = {
            attempts: 0,
            lockedUntil: null,
            lastAttemptAt: null,
          };
          localStorage.setItem(storageKey, JSON.stringify(resetState));
          return resetState;
        }

        // Check if attempts should be reset (outside window)
        if (parsed.lastAttemptAt && Date.now() - parsed.lastAttemptAt > attemptWindow) {
          const resetState: LockoutState = {
            attempts: 0,
            lockedUntil: null,
            lastAttemptAt: null,
          };
          localStorage.setItem(storageKey, JSON.stringify(resetState));
          return resetState;
        }

        return parsed;
      }
    } catch (error) {
      console.error('Error reading lockout state:', error);
    }

    return {
      attempts: 0,
      lockedUntil: null,
      lastAttemptAt: null,
    };
  });

  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Update lockout time remaining
  useEffect(() => {
    if (!state.lockedUntil) {
      setLockoutTimeRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, state.lockedUntil! - Date.now());
      setLockoutTimeRemaining(remaining);

      // Auto-unlock when time expires
      if (remaining <= 0) {
        setState({
          attempts: 0,
          lockedUntil: null,
          lastAttemptAt: null,
        });
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [state.lockedUntil]);

  // Check for stale attempts on mount and periodically
  useEffect(() => {
    const checkStaleAttempts = () => {
      if (state.lastAttemptAt && !state.lockedUntil) {
        const timeSinceLastAttempt = Date.now() - state.lastAttemptAt;
        if (timeSinceLastAttempt > attemptWindow) {
          setState({
            attempts: 0,
            lockedUntil: null,
            lastAttemptAt: null,
          });
        }
      }
    };

    checkStaleAttempts();
    const interval = setInterval(checkStaleAttempts, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.lastAttemptAt, state.lockedUntil, attemptWindow]);

  const isLockedOut = state.lockedUntil !== null && Date.now() < state.lockedUntil;

  const remainingAttempts = Math.max(0, maxAttempts - state.attempts);

  const shouldShowWarning = state.attempts >= maxAttempts - 2 && state.attempts < maxAttempts;

  const recordFailedAttempt = useCallback(() => {
    setState((prev) => {
      const newAttempts = prev.attempts + 1;
      const now = Date.now();

      // Check if we should lock out
      if (newAttempts >= maxAttempts) {
        return {
          attempts: newAttempts,
          lockedUntil: now + lockoutDuration,
          lastAttemptAt: now,
        };
      }

      return {
        ...prev,
        attempts: newAttempts,
        lastAttemptAt: now,
      };
    });
  }, [maxAttempts, lockoutDuration]);

  const resetAttempts = useCallback(() => {
    setState({
      attempts: 0,
      lockedUntil: null,
      lastAttemptAt: null,
    });
  }, []);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isLockedOut,
    attempts: state.attempts,
    remainingAttempts,
    lockoutTimeRemaining,
    recordFailedAttempt,
    resetAttempts,
    shouldShowWarning,
    formattedTimeRemaining: formatTime(lockoutTimeRemaining),
  };
}
