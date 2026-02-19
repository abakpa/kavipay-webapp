import { miningApi } from './index';
import type { ProfileUpdateData } from '@/types/profile';

export interface ProfileUpdateResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    phoneNumber?: string;
  };
}

export interface DeleteAccountResponse {
  success: boolean;
  message?: string;
}

/**
 * Update user profile - matches mobile app API exactly
 * Throws error on failure (like mobile app)
 */
export async function updateUserProfile(profileData: {
  name: string;
  phone?: string;
}): Promise<{ success: boolean; user: Record<string, unknown> }> {
  try {
    console.log('[Profile API] Updating profile with:', profileData);
    const response = await miningApi.put('/users/profile', profileData);
    console.log('[Profile API] Response:', response.data);

    // Check if server returned success: false (some APIs return 200 with success: false)
    if (response.data && response.data.success === false) {
      throw new Error(response.data.error || response.data.message || 'Failed to update profile');
    }

    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
    console.error('[Profile API] Error updating user profile:', err);

    // Extract server error message if available
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    if (err.response?.data?.message) {
      throw new Error(err.response.data.message);
    }

    throw new Error(err.message || 'Failed to update profile');
  }
}

/**
 * Update user profile (name, phone number) - legacy function
 */
export async function updateProfile(
  _userId: string,
  data: ProfileUpdateData
): Promise<ProfileUpdateResponse> {
  try {
    const response = await miningApi.put('/users/profile', {
      name: data.name,
      phone: data.phoneNumber || null,
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      user: response.data?.user || response.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
    console.error('Profile update error:', err);
    return {
      success: false,
      message: err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update profile',
    };
  }
}

/**
 * Update phone number separately
 */
export async function updatePhoneNumber(
  userId: string,
  phoneNumber: string
): Promise<ProfileUpdateResponse> {
  try {
    const response = await miningApi.post(`/user/${userId}/update-phone-number`, {
      phoneNumber,
    });

    return {
      success: true,
      message: 'Phone number updated successfully',
      user: response.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to update phone number',
    };
  }
}

/**
 * Delete user account permanently
 */
export async function deleteAccount(): Promise<DeleteAccountResponse> {
  try {
    await miningApi.delete('/user/delete-account');

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to delete account',
    };
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://test-api.ploutoslabs.io';

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

    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      message: err.message || 'Failed to send password reset email',
    };
  }
}
