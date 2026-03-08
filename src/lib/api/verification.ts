import { miningApi, MINING_JWT_TOKEN_KEY } from './index';
import { getIdToken } from '../firebase';

// ============================================================================
// Types
// ============================================================================

export type VerificationMethod = 'pin' | 'totp' | 'email_otp';

export interface VerificationStatus {
  pin_set: boolean;
  totp_enabled: boolean;
  email_set: boolean;
  preferred_method: VerificationMethod;
  biometrics_for_transactions: boolean;
  available_methods: VerificationMethod[];
}

export interface VerificationPreferences {
  preferred_method: VerificationMethod;
  biometrics_for_transactions: boolean;
  available_methods: VerificationMethod[];
}

export interface LoginSession {
  id: number;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  city: string;
  country: string;
  trusted: boolean;
  lastLoginAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface DeviceVerificationRequired {
  status: 'verification_required';
  session_id: number;
  email?: string;
  totp_available?: boolean;
}

export interface AuthSuccessResponse {
  token: string;
  user: Record<string, unknown>;
  isNewUser: boolean;
}

export interface TOTPSetupResponse {
  secret: string;
  provisioning_uri: string;
}

export interface TOTPVerifyResponse {
  message: string;
  backup_codes: string[];
}

// ============================================================================
// Device Verification (Login from new device)
// ============================================================================

/**
 * Verify a new device using TOTP or email OTP.
 * Called after authenticateWithMiningApp returns verification_required.
 * Requires Firebase ID token in Authorization header.
 */
export const verifyDevice = async (
  code: string,
  sessionId: number,
  method?: 'totp' | 'email_otp'
): Promise<AuthSuccessResponse> => {
  const firebaseToken = await getIdToken();
  const response = await miningApi.post(
    '/auth/verify-device',
    {
      code,
      sessionId,
      ...(method && { method }),
    },
    {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    }
  );

  if (response.data.token) {
    localStorage.setItem(MINING_JWT_TOKEN_KEY, response.data.token);
  }

  return response.data;
};

/**
 * Resend email OTP for device verification.
 * Requires Firebase ID token in Authorization header.
 */
export const resendDeviceOTP = async (sessionId: number): Promise<{ message: string; expires_in: string }> => {
  const firebaseToken = await getIdToken();
  const response = await miningApi.post(
    '/auth/resend-device-otp',
    { sessionId },
    {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    }
  );
  return response.data;
};

// ============================================================================
// Transaction Verification
// ============================================================================

/**
 * Get verification status - what methods are available for the user.
 */
export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  const response = await miningApi.get('/auth/verification-status');
  return response.data;
};

/**
 * Verify PIN to get a transaction verification token.
 */
export const verifyPINForTransaction = async (pin: string): Promise<string> => {
  const response = await miningApi.post('/auth/verify-pin', { pin });
  return response.data.verification_token;
};

/**
 * Verify TOTP code to get a transaction verification token.
 */
export const verifyTOTPForTransaction = async (code: string): Promise<string> => {
  const response = await miningApi.post('/auth/2fa/verify-transaction', { code });
  return response.data.verification_token;
};

/**
 * Send email OTP for transaction verification.
 */
export const sendEmailOTP = async (): Promise<{ message: string; email: string }> => {
  const response = await miningApi.post('/auth/email-otp/send');
  return response.data;
};

/**
 * Verify email OTP to get a transaction verification token.
 */
export const verifyEmailOTP = async (code: string): Promise<string> => {
  const response = await miningApi.post('/auth/email-otp/verify', { code });
  return response.data.verification_token;
};

// ============================================================================
// Verification Preferences
// ============================================================================

/**
 * Get user's verification preferences.
 */
export const getVerificationPreferences = async (): Promise<VerificationPreferences> => {
  const response = await miningApi.get('/auth/verification-preferences');
  return response.data;
};

/**
 * Update user's verification preferences.
 */
export const updateVerificationPreferences = async (prefs: {
  preferred_method?: VerificationMethod;
  biometrics_for_transactions?: boolean;
}): Promise<void> => {
  await miningApi.put('/auth/verification-preferences', prefs);
};

// ============================================================================
// PIN Management
// ============================================================================

/**
 * Set or update transaction PIN.
 */
export const setTransactionPIN = async (pin: string, currentPin?: string): Promise<void> => {
  await miningApi.post('/auth/transaction-pin', {
    pin,
    ...(currentPin && { currentPin }),
  });
};

// ============================================================================
// TOTP (2FA) Setup
// ============================================================================

/**
 * Start TOTP setup - generates secret and QR code URI.
 * WARNING: Calling this again invalidates the previous secret.
 */
export const setup2FA = async (): Promise<TOTPSetupResponse> => {
  const response = await miningApi.post('/auth/2fa/setup');
  return response.data;
};

/**
 * Verify TOTP setup with a code from the authenticator app.
 * Returns backup codes on success.
 */
export const verify2FASetup = async (code: string): Promise<TOTPVerifyResponse> => {
  const response = await miningApi.post('/auth/2fa/verify', { code });
  return response.data;
};

/**
 * Disable TOTP. Requires current TOTP code or backup code.
 */
export const disable2FA = async (code: string): Promise<void> => {
  await miningApi.post('/auth/2fa/disable', { code });
};

// ============================================================================
// Session Management
// ============================================================================

/**
 * Get all login sessions for the current user.
 */
export const getSessions = async (): Promise<LoginSession[]> => {
  const response = await miningApi.get('/sessions');
  return response.data.sessions;
};

/**
 * Revoke a session (log out that device).
 * Cannot revoke the current session.
 */
export const revokeSession = async (sessionId: number): Promise<void> => {
  await miningApi.delete(`/sessions/${sessionId}`);
};

// ============================================================================
// Helper to check if response requires verification
// ============================================================================

export const isVerificationRequired = (
  response: unknown
): response is DeviceVerificationRequired => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    (response as DeviceVerificationRequired).status === 'verification_required'
  );
};
