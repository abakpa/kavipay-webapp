import axios from 'axios';
import { api } from './index';
import type { KYCStatusResponse } from '../../types/card';

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface KYCVerifyPayload {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  identificationType: string;
  identificationNumber: string;
  photoURL: string;
  identityDocumentURL: string;
}

export const getKYCStatus = async (): Promise<KYCStatusResponse | null> => {
  try {
    const response = await api.get('/kyc/status');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateUserAddress = async (addressData: {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put('/kyc/address', addressData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      if (errorData?.error) {
        throw new Error(errorData.error);
      }
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to update address');
  }
};

export const verifyKYC = async (
  payload: KYCVerifyPayload
): Promise<{ message: string; status: string }> => {
  try {
    const response = await api.post('/kyc/verify', payload);
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to verify KYC';

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as ApiErrorResponse | undefined;
      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    const serverError = new Error(errorMessage);
    serverError.name = 'KYCVerificationError';
    throw serverError;
  }
};

/**
 * Create a KYCAID verification session for document verification.
 */
export const createKYCAIDSession = async (sessionData: {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  phoneNumber: string;
}): Promise<{
  applicantId: string;
  verificationId: string;
  formId: string;
  formUrl: string;
  formToken: string;
}> => {
  const response = await api.post('/kyc/session', sessionData);
  return response.data;
};

export const getKYCAIDVerification = async (): Promise<{
  verificationId: string;
  applicantId: string;
  status: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  declineReasons?: string[];
  comment?: string;
} | null> => {
  try {
    const response = await api.get('/kyc/verification/user');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const syncKYCAIDVerification = async (): Promise<{
  verificationId: string;
  applicantId: string;
  status: string;
  verified: boolean;
  kycStatus: string;
  synced: boolean;
  syncedAt: string;
  completedAt?: string;
  declineReasons?: string[];
  createdAt: string;
}> => {
  const response = await api.post('/kyc/verification/sync');
  return response.data;
};

export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> => {
  const response = await api.post('/kyc/presigned-url', { fileName, contentType });
  return response.data;
};
