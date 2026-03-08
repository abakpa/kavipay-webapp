import { useState, useCallback, useRef } from 'react';
import { useVerification } from '@/contexts/VerificationContext';
import {
  verifyPINForTransaction,
  verifyTOTPForTransaction,
  sendEmailOTP,
  verifyEmailOTP,
  type VerificationMethod,
} from '@/lib/api/verification';

export type VerificationModal = 'none' | 'pin' | 'totp' | 'email_otp' | 'method_select';

interface UseTransactionVerificationResult {
  /** Trigger verification flow. Returns verification_token or null if cancelled. */
  requestVerification: () => Promise<string | null>;

  /** Current active modal */
  activeModal: VerificationModal;
  /** Close the active modal (cancels verification) */
  closeModal: () => void;

  /** PIN handlers */
  onPinSubmit: (pin: string) => Promise<void>;
  pinError: string | null;

  /** TOTP handlers */
  onTOTPSubmit: (code: string) => Promise<void>;
  totpError: string | null;

  /** Email OTP handlers */
  onEmailOTPRequest: () => Promise<void>;
  onEmailOTPSubmit: (code: string) => Promise<void>;
  emailOTPError: string | null;
  emailOTPSent: boolean;
  maskedEmail: string | null;

  /** Method selection */
  onMethodSelect: (method: VerificationMethod) => void;
  availableMethods: VerificationMethod[];

  /** Loading state */
  isVerifying: boolean;
}

/**
 * Hook for server-verified transaction authentication.
 *
 * Usage:
 * ```tsx
 * const { requestVerification, activeModal, ... } = useTransactionVerification();
 *
 * const handlePayout = async () => {
 *   const token = await requestVerification();
 *   if (!token) return; // cancelled
 *   await initiateNairaPayout(data, token);
 * };
 * ```
 */
export function useTransactionVerification(): UseTransactionVerificationResult {
  const { preferredMethod, availableMethods, setVerificationToken } = useVerification();

  const [activeModal, setActiveModal] = useState<VerificationModal>('none');
  const pendingResolveRef = useRef<((token: string | null) => void) | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [emailOTPError, setEmailOTPError] = useState<string | null>(null);
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const resolveWith = useCallback(
    (token: string | null) => {
      if (token) setVerificationToken(token);
      if (pendingResolveRef.current) {
        pendingResolveRef.current(token);
        pendingResolveRef.current = null;
      }
      setActiveModal('none');
      setIsVerifying(false);
    },
    [setVerificationToken]
  );

  const resetErrors = useCallback(() => {
    setPinError(null);
    setTotpError(null);
    setEmailOTPError(null);
    setEmailOTPSent(false);
    setMaskedEmail(null);
  }, []);

  const requestVerification = useCallback(async (): Promise<string | null> => {
    if (availableMethods.length === 0) {
      // No verification methods available - user needs to set up PIN
      alert('Please set up a transaction PIN in Settings to perform secure operations.');
      return null;
    }

    // Pick the preferred method if available, otherwise first available
    const method = availableMethods.includes(preferredMethod)
      ? preferredMethod
      : availableMethods[0];

    return new Promise<string | null>((resolve) => {
      pendingResolveRef.current = resolve;
      setIsVerifying(true);
      resetErrors();
      setActiveModal(method as VerificationModal);
    });
  }, [preferredMethod, availableMethods, resetErrors]);

  const onPinSubmit = useCallback(
    async (pin: string) => {
      setPinError(null);
      setIsVerifying(true);
      try {
        const token = await verifyPINForTransaction(pin);
        resolveWith(token);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setPinError(error?.response?.data?.error || 'Incorrect PIN. Try again.');
        setIsVerifying(false);
      }
    },
    [resolveWith]
  );

  const onTOTPSubmit = useCallback(
    async (code: string) => {
      setTotpError(null);
      setIsVerifying(true);
      try {
        const token = await verifyTOTPForTransaction(code);
        resolveWith(token);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setTotpError(error?.response?.data?.error || 'Invalid code');
        setIsVerifying(false);
      }
    },
    [resolveWith]
  );

  const onEmailOTPRequest = useCallback(async () => {
    setEmailOTPError(null);
    setIsVerifying(true);
    try {
      const result = await sendEmailOTP();
      setEmailOTPSent(true);
      setMaskedEmail(result.email);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setEmailOTPError(error?.response?.data?.error || 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const onEmailOTPSubmit = useCallback(
    async (code: string) => {
      setEmailOTPError(null);
      setIsVerifying(true);
      try {
        const token = await verifyEmailOTP(code);
        resolveWith(token);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } } };
        setEmailOTPError(error?.response?.data?.error || 'Invalid code');
        setIsVerifying(false);
      }
    },
    [resolveWith]
  );

  const onMethodSelect = useCallback(
    (method: VerificationMethod) => {
      resetErrors();
      setActiveModal(method as VerificationModal);
    },
    [resetErrors]
  );

  const closeModal = useCallback(() => {
    resolveWith(null);
  }, [resolveWith]);

  return {
    requestVerification,
    activeModal,
    closeModal,
    onPinSubmit,
    pinError,
    onTOTPSubmit,
    totpError,
    onEmailOTPRequest,
    onEmailOTPSubmit,
    emailOTPError,
    emailOTPSent,
    maskedEmail,
    onMethodSelect,
    availableMethods,
    isVerifying,
  };
}
