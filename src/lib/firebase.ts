import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get Firebase ID token for API authentication
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  const token = await user.getIdToken(true); // force refresh
  return token;
};

// Reset password using custom backend endpoint for branded emails
export const resetPassword = async (email: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://test-api.ploutoslabs.io';

  try {
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send password reset email');
    }

    return await response.json();
  } catch (error) {
    // Fallback to Firebase default if custom backend fails
    console.warn('Custom reset failed, falling back to Firebase:', error);
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  }
};

export default app;
