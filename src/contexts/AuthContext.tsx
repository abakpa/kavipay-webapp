/**
 * AuthContext handles two authentication layers:
 * 1. Firebase Auth - handles login/signup, provides ID tokens
 * 2. Mining App Auth - syncs user data and provides JWT for API calls
 *
 * Flow: Firebase login → Mining app authentication → User data merged
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, getIdToken } from '@/lib/firebase';
import {
  authenticateWithMiningApp,
  registerUserConsolidated,
  getUserById,
  type MiningUserData,
  type MiningAuthResponse,
} from '@/lib/api/auth';
import { getMiningToken, clearMiningToken } from '@/lib/api';

const USER_STORAGE_KEY = 'kavipay_user';
const MINING_JWT_TOKEN_KEY = 'mining_jwt_token';

interface KYCAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface KYCCountry {
  code?: string;
  name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  balance: number;
  gameWalletBalance: number;
  pltlBalance: number;
  userId: string;
  payscribeCustomerId: string;
  sudoCustomerId?: string;
  telegramId: string;
  username: string;
  miningRate: number;
  referralCode: string;
  referralBonus: number;
  referralCount: number;
  isInChannel: boolean;
  level?: number;
  checkInStreak?: number;
  lastClaimAt?: string;
  lastCheckInAt?: string;
  miningFrequency?: number;
  kycStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected';
  kyc_address?: KYCAddress;
  kyc_country?: KYCCountry;
  isNewMiningUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  getMiningToken: () => string | null;
  isNewMiningUser: () => boolean;
  refreshUserData: () => Promise<void>;
  retryMiningAuthentication: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const updateUserStorage = (userData: User | null, miningToken?: string) => {
  if (userData) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  if (miningToken) {
    localStorage.setItem(MINING_JWT_TOKEN_KEY, miningToken);
  }
};

// Merge Firebase user with mining app data
const convertFirebaseUser = (
  firebaseUser: FirebaseUser,
  miningData?: MiningUserData
): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'User',
    email: firebaseUser.email || '',
    phoneNumber: miningData?.phoneNumber,
    balance: miningData?.balance || 0,
    gameWalletBalance: miningData?.gameWalletBalance || 0,
    pltlBalance: miningData?.pltlBalance || 0,
    userId: miningData?.id || '',
    payscribeCustomerId: miningData?.payscribeCustomerId || '',
    sudoCustomerId: miningData?.sudoCustomerId,
    telegramId: miningData?.telegramId || '',
    username: miningData?.username || '',
    miningRate: miningData?.miningRate || 0,
    referralCode: miningData?.referralCode || '',
    referralBonus: miningData?.referralBonus || 0,
    referralCount: miningData?.referralCount || 0,
    isInChannel: miningData?.isInChannel || false,
    level: miningData?.level || 0,
    checkInStreak: miningData?.checkInStreak || 0,
    lastClaimAt: miningData?.lastClaimAt || '',
    lastCheckInAt: miningData?.lastCheckInAt || '',
    miningFrequency: miningData?.miningFrequency || 1,
    kycStatus: miningData?.kycStatus,
    kyc_address: miningData?.kyc_address,
    kyc_country: miningData?.kyc_country,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const authenticateWithMining = async (): Promise<MiningAuthResponse | null> => {
    try {
      return await authenticateWithMiningApp();
    } catch (error) {
      console.error('Mining app authentication failed:', error);
      return null; // Don't fail login if mining auth fails
    }
  };

  // After Firebase login, sync with mining app to get user data
  const setupUserWithMining = useCallback(
    async (fbUser: FirebaseUser): Promise<User> => {
      const miningData = await authenticateWithMining();
      const userData = convertFirebaseUser(fbUser, miningData?.user);

      if (miningData) {
        userData.isNewMiningUser = miningData.isNewUser;
        updateUserStorage(userData, miningData.token);
      } else {
        updateUserStorage(userData);
      }

      setUser(userData);
      return userData;
    },
    []
  );

  // Listen for Firebase auth changes and sync with mining app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsInitializing(true);
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          await setupUserWithMining(fbUser);
        } else {
          setFirebaseUser(null);
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          clearMiningToken();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [setupUserWithMining]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => {
    setLoading(true);
    try {
      const registrationResult = await registerUserConsolidated({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        referralCode: userData.referralCode,
      });

      if (registrationResult.token) {
        localStorage.setItem(MINING_JWT_TOKEN_KEY, registrationResult.token);
      }

      await signInWithEmailAndPassword(auth, userData.email, userData.password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setFirebaseUser(null);
      setIsInitializing(false);
      localStorage.removeItem(USER_STORAGE_KEY);
      clearMiningToken();
      await signOut(auth);
    } catch (error) {
      console.error('Logout error (non-blocking):', error);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setLoading(false);
    }
  };

  const isNewMiningUser = () => {
    return user?.isNewMiningUser === true;
  };

  const refreshUserData = async () => {
    if (!user || !firebaseUser) return;

    try {
      const updatedMiningData = await getUserById(user.userId);
      const updatedUser = convertFirebaseUser(firebaseUser, updatedMiningData);

      updatedUser.id = user.id;
      updatedUser.name = user.name;
      updatedUser.email = user.email;

      updateUserStorage(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const retryMiningAuthentication = async () => {
    if (!firebaseUser) {
      throw new Error('No Firebase user found');
    }

    setLoading(true);
    try {
      await setupUserWithMining(firebaseUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isInitializing,
        login,
        register,
        logout,
        resetPassword,
        loginWithGoogle,
        getIdToken,
        getMiningToken,
        isNewMiningUser,
        refreshUserData,
        retryMiningAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
