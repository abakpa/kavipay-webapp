import axios from 'axios';
import { miningApi, API_BASE_URL, MINING_JWT_TOKEN_KEY } from './index';

// Types
export interface MiningUserData {
  id?: string;
  name?: string;
  odessaId?: string;
  odessa_id?: string;
  odessa_email?: string;
  telegramId?: string;
  balance?: number;
  gameWalletBalance?: number;
  dollarWalletBalance?: number; // USD wallet balance
  nairaWalletBalance?: number; // NGN wallet balance
  level?: number;
  username?: string;
  miningRate?: number;
  referralCode?: string;
  referralBonus?: number;
  referralCount?: number;
  isInChannel?: boolean;
  checkInStreak?: number;
  lastClaimAt?: string;
  lastCheckInAt?: string;
  miningFrequency?: number;
  payscribeCustomerId?: string;
  sudoCustomerId?: string;
  pltlBalance?: number;
  kycStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected';
  phoneNumber?: string;
  kyc_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  kyc_country?: {
    name?: string;
    code?: string;
  };
}

export interface MiningAuthResponse {
  token: string;
  user: MiningUserData;
  isNewUser: boolean;
}

// Device verification required response
export interface DeviceVerificationRequired {
  status: 'verification_required';
  session_id: number;
  email?: string;
  totp_available?: boolean;
}

// Union type for auth responses
export type MiningAuthResult = MiningAuthResponse | DeviceVerificationRequired;

// Type guard to check if device verification is required
export const isDeviceVerificationRequired = (
  response: MiningAuthResult
): response is DeviceVerificationRequired => {
  return 'status' in response && response.status === 'verification_required';
};

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

/**
 * Authenticate with mining app using Firebase ID token.
 * Called after Firebase login to get mining-specific user data and JWT.
 *
 * Returns either:
 * - MiningAuthResponse (token + user) for trusted devices
 * - DeviceVerificationRequired for new/untrusted devices
 */
export const authenticateWithMiningApp = async (): Promise<MiningAuthResult> => {
  const response = await miningApi.post('/auth/firebase');

  // Check if this is a successful auth (trusted device)
  if (response.data.token) {
    localStorage.setItem(MINING_JWT_TOKEN_KEY, response.data.token);
  }

  return response.data;
};

/**
 * Fetch user data by ID from mining app.
 */
export const getUserById = async (userId: string): Promise<MiningUserData> => {
  const response = await miningApi.get(`/user/${userId}`);
  return response.data;
};

/**
 * Register a new user (creates both Firebase and mining app accounts).
 */
export const registerUserConsolidated = async (data: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}): Promise<{
  message: string;
  firebase_uid: string;
  user: RegisteredUser;
  token: string;
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode || null,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      throw new Error(errorData?.error || 'Registration failed');
    }
    throw new Error('Network error during registration');
  }
};
