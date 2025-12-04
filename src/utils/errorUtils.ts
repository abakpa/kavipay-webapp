import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
  endpoint?: string;
  authStatus?: {
    hasFirebaseToken: boolean;
    hasMiningToken: boolean;
  };
}

/**
 * Checks if mining JWT token exists in localStorage
 */
export const checkMiningTokenExists = (): boolean => {
  try {
    const token = localStorage.getItem('mining_jwt_token');
    return !!token;
  } catch (error) {
    console.error('Error checking mining token:', error);
    return false;
  }
};

/**
 * Gets current authentication status
 */
export const getAuthStatus = () => {
  try {
    const miningToken = localStorage.getItem('mining_jwt_token');
    const user = localStorage.getItem('user');

    return {
      hasMiningToken: !!miningToken,
      hasUser: !!user,
      miningTokenPreview: miningToken ? `${miningToken.substring(0, 20)}...` : null,
    };
  } catch (error) {
    console.error('Error getting auth status:', error);
    return {
      hasMiningToken: false,
      hasUser: false,
      miningTokenPreview: null,
    };
  }
};

/**
 * Parses Axios errors into a standardized format
 */
export const parseApiError = (
  error: AxiosError,
  endpoint: string
): ApiError => {
  const timestamp = new Date().toISOString();
  const authStatus = getAuthStatus();

  // Log essential error information
  if (error.response?.status) {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${endpoint} - ${error.response.status}:`,
      (error.response.data as any)?.error || (error.response.data as any)?.message || 'Unknown error');
  }

  // Handle different error scenarios
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data as any;

    let message = 'An error occurred';
    let code = 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        // Use server's error message if available
        message = data?.error || data?.message || 'Bad request. Please check your input.';
        code = 'BAD_REQUEST';

        // Special handling for auth-related 400 errors
        if (!authStatus.hasMiningToken) {
          message = 'Authentication required. Please log in again.';
          code = 'AUTH_REQUIRED';
        }
        break;

      case 401:
        message = 'Authentication failed. Please log in again.';
        code = 'UNAUTHORIZED';
        break;

      case 403:
        message = 'Access denied. You do not have permission to perform this action.';
        code = 'FORBIDDEN';
        break;

      case 404:
        message = data?.message || 'Resource not found.';
        code = 'NOT_FOUND';
        break;

      case 422:
        message = data?.message || 'Invalid data provided.';
        code = 'VALIDATION_ERROR';
        break;

      case 500:
        message = 'Server error. Please try again later.';
        code = 'SERVER_ERROR';
        break;

      case 502:
      case 503:
      case 504:
        message = 'Service temporarily unavailable. Please try again later.';
        code = 'SERVICE_UNAVAILABLE';
        break;

      default:
        message = data?.message || `Request failed with status ${status}`;
        code = `HTTP_${status}`;
    }

    return {
      message,
      status,
      code,
      details: data,
      timestamp,
      endpoint,
      authStatus: {
        hasFirebaseToken: true, // Assumed if we're making API calls
        hasMiningToken: authStatus.hasMiningToken,
      },
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      timestamp,
      endpoint,
      authStatus: {
        hasFirebaseToken: true,
        hasMiningToken: authStatus.hasMiningToken,
      },
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'Failed to make request',
      code: 'REQUEST_SETUP_ERROR',
      timestamp,
      endpoint,
      authStatus: {
        hasFirebaseToken: true,
        hasMiningToken: authStatus.hasMiningToken,
      },
    };
  }
};

/**
 * Logs API errors with context (simplified)
 */
export const logApiError = (
  functionName: string,
  error: ApiError,
  _additionalContext?: any
) => {
  // Simplified logging - essential info only
  console.error(`[${functionName}] ${error.message}`);
};

/**
 * Checks if error is authentication related
 */
export const isAuthError = (error: ApiError): boolean => {
  return (
    error.code === 'UNAUTHORIZED' ||
    error.code === 'AUTH_REQUIRED' ||
    (error.status === 401) ||
    (error.status === 400 && !error.authStatus?.hasMiningToken)
  );
};

/**
 * Gets user-friendly error message for API errors
 */
export const getUserFriendlyErrorMessage = (error: ApiError): string => {
  if (isAuthError(error)) {
    return 'Please log in to continue.';
  }

  // Return the parsed message, which is already user-friendly
  return error.message;
};

/**
 * Maps Firebase authentication error codes to user-friendly messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/invalid-credential':
    'Invalid email or password. Please check your credentials and try again.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled':
    'This account has been disabled. Please contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed':
    'Network error. Please check your internet connection.',

  // Registration errors
  'auth/email-already-in-use':
    'An account with this email already exists. Try signing in instead.',
  'auth/weak-password':
    'Password is too weak. Please choose a stronger password.',
  'auth/invalid-password': 'Password must be at least 6 characters long.',
  'auth/missing-password': 'Please enter a password.',
  'auth/requires-recent-login':
    'Please sign out and sign in again to complete this action.',

  // General errors
  'auth/operation-not-allowed':
    'This sign-in method is not enabled. Please contact support.',
  'auth/account-exists-with-different-credential':
    'An account already exists with this email using a different sign-in method.',
  'auth/credential-already-in-use':
    'This credential is already associated with a different account.',
  'auth/timeout': 'The request timed out. Please try again.',
};

/**
 * Extracts user-friendly error message from Firebase authentication errors
 */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const errorMessage = error.message;

    // Extract Firebase error code from the message
    const firebaseCodeMatch = errorMessage.match(/\(([^)]+)\)/);
    if (firebaseCodeMatch) {
      const errorCode = firebaseCodeMatch[1];
      return (
        AUTH_ERROR_MESSAGES[errorCode] ||
        'An authentication error occurred. Please try again.'
      );
    }

    // Check if the error message itself contains known patterns
    if (
      errorMessage.toLowerCase().includes('invalid-credential') ||
      errorMessage.toLowerCase().includes('invalid credential')
    ) {
      return AUTH_ERROR_MESSAGES['auth/invalid-credential'];
    }

    if (
      errorMessage.toLowerCase().includes('email-already-in-use') ||
      errorMessage.toLowerCase().includes('email already in use')
    ) {
      return AUTH_ERROR_MESSAGES['auth/email-already-in-use'];
    }

    if (errorMessage.toLowerCase().includes('weak-password')) {
      return AUTH_ERROR_MESSAGES['auth/weak-password'];
    }

    if (errorMessage.toLowerCase().includes('network')) {
      return AUTH_ERROR_MESSAGES['auth/network-request-failed'];
    }

    // Return the original message if it's already user-friendly
    if (
      !errorMessage.includes('http://') &&
      !errorMessage.includes('at ') &&
      errorMessage.length < 100
    ) {
      return errorMessage;
    }
  }

  // Default fallback message
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Specific error handler for login attempts
 */
export const getLoginErrorMessage = (error: unknown): string => {
  const message = getAuthErrorMessage(error);

  // Add specific context for login
  if (message === AUTH_ERROR_MESSAGES['auth/invalid-credential']) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  return message;
};

/**
 * Specific error handler for registration attempts
 */
export const getRegistrationErrorMessage = (error: unknown): string => {
  const message = getAuthErrorMessage(error);

  // Add specific context for registration
  if (message.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  return message;
};
