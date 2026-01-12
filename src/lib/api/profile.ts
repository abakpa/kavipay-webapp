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
 * Update user profile (name, phone number)
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<ProfileUpdateResponse> {
  try {
    const response = await miningApi.put(`/user/${userId}/profile`, {
      name: data.name,
      phoneNumber: data.phoneNumber || null,
    });

    return {
      success: true,
      message: 'Profile updated successfully',
      user: response.data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to update profile',
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
