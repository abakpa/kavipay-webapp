import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type {
  KYCStatusResponse,
  PersonalInfo,
  DocumentInfo,
  AddressInfo,
  KYCAIDSession,
  KYCAIDVerification,
} from '@/types/card';
import * as kycApi from '@/lib/api/kyc';
import { type UnifiedKYCStatus, mapToUnifiedStatus } from '@/lib/api/kyc';

// KYC Steps for KYCAID flow
export const KYCAID_STEPS = [
  { id: 0, title: 'Personal Info', key: 'personal' },
  { id: 1, title: 'Address', key: 'address' },
  { id: 2, title: 'Verification', key: 'verification' },
] as const;

// Manual KYC Steps (fallback)
export const MANUAL_KYC_STEPS = [
  { id: 0, title: 'Personal Info', key: 'personal' },
  { id: 1, title: 'Document Upload', key: 'document' },
  { id: 2, title: 'Address', key: 'address' },
  { id: 3, title: 'Review', key: 'review' },
] as const;

export type KYCStepKey = 'personal' | 'address' | 'verification' | 'document' | 'review';

// Form data interfaces
export interface KYCFormData {
  personalInfo: Partial<PersonalInfo> | null;
  documentInfo: Partial<DocumentInfo> | null;
  addressInfo: Partial<AddressInfo> | null;
}

// KYCAID specific form data
export interface KYCAIDFormData {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  phoneNumber: string;
}

export interface KYCAIDAddressData {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Validation errors interface
export interface KYCValidationErrors {
  personalInfo?: Record<string, string>;
  documentInfo?: Record<string, string>;
  addressInfo?: Record<string, string>;
}

// Context interface
interface KYCContextType {
  // Status
  kycStatus: KYCStatusResponse | null;
  unifiedStatus: UnifiedKYCStatus;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // KYCAID specific
  kycaidSession: KYCAIDSession | null;
  kycaidVerification: KYCAIDVerification | null;
  hasExistingVerification: boolean;

  // Form state
  currentStep: number;
  formData: KYCFormData;
  kycaidFormData: KYCAIDFormData;
  kycaidAddressData: KYCAIDAddressData;
  validationErrors: KYCValidationErrors;

  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  // Form data setters
  setPersonalInfo: (data: Partial<PersonalInfo>) => void;
  setDocumentInfo: (data: Partial<DocumentInfo>) => void;
  setAddressInfo: (data: Partial<AddressInfo>) => void;
  setKYCAIDFormData: (data: Partial<KYCAIDFormData>) => void;
  setKYCAIDAddressData: (data: Partial<KYCAIDAddressData>) => void;
  setValidationErrors: (errors: KYCValidationErrors) => void;

  // KYCAID Actions
  createSession: () => Promise<KYCAIDSession | null>;
  syncVerification: () => Promise<void>;
  submitAddress: () => Promise<boolean>;

  // API actions
  loadKYCStatus: () => Promise<void>;
  loadVerification: () => Promise<void>;
  submitKYC: () => Promise<void>;
  createPaymentAccount: () => Promise<boolean>;
  resetKYC: () => void;
  clearError: () => void;

  // Validation
  isStepComplete: (step: number) => boolean;
  validateStep: (step: number) => boolean;
  canProceedToNext: () => boolean;
  validateKYCAIDPersonalInfo: () => Record<string, string>;
  validateKYCAIDAddress: () => Record<string, string>;

  // Status checks
  isKYCComplete: () => boolean;
  isKYCPending: () => boolean;
  isKYCRejected: () => boolean;
  isKYCNotStarted: () => boolean;
  isKYCInProgress: () => boolean;
  canCreateCard: () => boolean;
}

const initialFormData: KYCFormData = {
  personalInfo: null,
  documentInfo: null,
  addressInfo: null,
};

const initialKYCAIDFormData: KYCAIDFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  country: '',
  phoneNumber: '',
};

const initialKYCAIDAddressData: KYCAIDAddressData = {
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
};

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export function useKYC(): KYCContextType {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
}

interface KYCProviderProps {
  children: ReactNode;
}

export function KYCProvider({ children }: KYCProviderProps) {
  const { user } = useAuth();

  // Status state
  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);
  const [kycaidSession, setKycaidSession] = useState<KYCAIDSession | null>(null);
  const [kycaidVerification, setKycaidVerification] = useState<KYCAIDVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<KYCFormData>(initialFormData);
  const [kycaidFormData, setKycaidFormDataState] = useState<KYCAIDFormData>(initialKYCAIDFormData);
  const [kycaidAddressData, setKycaidAddressDataState] = useState<KYCAIDAddressData>(initialKYCAIDAddressData);
  const [validationErrors, setValidationErrors] = useState<KYCValidationErrors>({});

  // Computed values
  const unifiedStatus = mapToUnifiedStatus(kycStatus?.kycStatus);
  const hasExistingVerification = kycaidVerification !== null;

  // Pre-fill KYCAID form data from user profile
  useEffect(() => {
    if (user) {
      // User has 'name' field, try to split into first/last name
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setKycaidFormDataState((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
      }));
    }
  }, [user]);

  // Load KYC status on mount
  const loadKYCStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await kycApi.getKYCStatus();
      setKycStatus(status);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load KYC status';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load KYCAID verification
  const loadVerification = useCallback(async () => {
    try {
      const verification = await kycApi.getKYCAIDVerification();
      setKycaidVerification(verification);
    } catch (err) {
      console.error('Failed to load verification:', err);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadKYCStatus();
    loadVerification();
  }, [loadKYCStatus, loadVerification]);

  // Navigation
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // Form data setters
  const setPersonalInfo = useCallback((data: Partial<PersonalInfo>) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
    setValidationErrors((prev) => ({ ...prev, personalInfo: undefined }));
  }, []);

  const setDocumentInfo = useCallback((data: Partial<DocumentInfo>) => {
    setFormData((prev) => ({
      ...prev,
      documentInfo: { ...prev.documentInfo, ...data },
    }));
    setValidationErrors((prev) => ({ ...prev, documentInfo: undefined }));
  }, []);

  const setAddressInfo = useCallback((data: Partial<AddressInfo>) => {
    setFormData((prev) => ({
      ...prev,
      addressInfo: { ...prev.addressInfo, ...data },
    }));
    setValidationErrors((prev) => ({ ...prev, addressInfo: undefined }));
  }, []);

  const setKYCAIDFormData = useCallback((data: Partial<KYCAIDFormData>) => {
    setKycaidFormDataState((prev) => ({ ...prev, ...data }));
  }, []);

  const setKYCAIDAddressData = useCallback((data: Partial<KYCAIDAddressData>) => {
    setKycaidAddressDataState((prev) => ({ ...prev, ...data }));
  }, []);

  // KYCAID Validation
  const validateKYCAIDPersonalInfo = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const data = kycaidFormData;

    if (!data.firstName?.trim()) errors.firstName = 'First name is required';
    if (!data.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!data.dob) errors.dob = 'Date of birth is required';
    else {
      const birthDate = new Date(data.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) errors.dob = 'You must be at least 18 years old';
    }
    if (!data.country?.trim()) errors.country = 'Country is required';
    if (!data.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';

    return errors;
  }, [kycaidFormData]);

  const validateKYCAIDAddress = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const data = kycaidAddressData;

    if (!data.street?.trim() || data.street.length < 5)
      errors.street = 'Street address is required (min 5 characters)';
    if (!data.city?.trim() || data.city.length < 2)
      errors.city = 'City is required (min 2 characters)';
    if (!data.state?.trim() || data.state.length < 2)
      errors.state = 'State is required (min 2 characters)';
    if (!data.country?.trim()) errors.country = 'Country is required';
    if (!data.postalCode?.trim()) errors.postalCode = 'Postal code is required';

    return errors;
  }, [kycaidAddressData]);

  // Create KYCAID session
  const createSession = useCallback(async (): Promise<KYCAIDSession | null> => {
    const errors = validateKYCAIDPersonalInfo();
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ personalInfo: errors });
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const session = await kycApi.createKYCAIDSession({
        firstName: kycaidFormData.firstName,
        lastName: kycaidFormData.lastName,
        dob: kycaidFormData.dob,
        country: kycaidFormData.country,
        phoneNumber: kycaidFormData.phoneNumber,
      });
      setKycaidSession(session);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create verification session';
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [kycaidFormData, validateKYCAIDPersonalInfo]);

  // Sync KYCAID verification
  const syncVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const syncResult = await kycApi.syncKYCAIDVerification();
      setKycaidVerification({
        verificationId: syncResult.verificationId,
        applicantId: syncResult.applicantId,
        status: syncResult.status,
        verified: syncResult.verified,
        createdAt: syncResult.createdAt,
        updatedAt: syncResult.syncedAt,
        completedAt: syncResult.completedAt,
        declineReasons: syncResult.declineReasons,
      });
      // Also reload KYC status
      await loadKYCStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync verification';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadKYCStatus]);

  // Submit address
  const submitAddress = useCallback(async (): Promise<boolean> => {
    const errors = validateKYCAIDAddress();
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ addressInfo: errors });
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await kycApi.updateUserAddress(kycaidAddressData);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save address';
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [kycaidAddressData, validateKYCAIDAddress]);

  // Manual KYC validation
  const validatePersonalInfo = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const info = formData.personalInfo;

    if (!info?.firstName?.trim()) errors.firstName = 'First name is required';
    if (!info?.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!info?.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!info?.nationality?.trim()) errors.nationality = 'Nationality is required';
    if (!info?.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    if (!info?.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
      errors.email = 'Invalid email address';
    }

    return errors;
  }, [formData.personalInfo]);

  const validateDocumentInfo = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const info = formData.documentInfo;

    if (!info?.documentType) errors.documentType = 'Document type is required';
    if (!info?.documentNumber?.trim()) errors.documentNumber = 'Document number is required';
    if (!info?.issuedDate) errors.issuedDate = 'Issue date is required';
    if (!info?.expiryDate) errors.expiryDate = 'Expiry date is required';
    if (!info?.issuingCountry?.trim()) errors.issuingCountry = 'Issuing country is required';
    if (!info?.frontImageUrl) errors.frontImageUrl = 'Front image is required';

    if (
      info?.documentType &&
      ['drivers_license', 'national_id'].includes(info.documentType) &&
      !info?.backImageUrl
    ) {
      errors.backImageUrl = 'Back image is required for this document type';
    }

    return errors;
  }, [formData.documentInfo]);

  const validateAddressInfo = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    const info = formData.addressInfo;

    if (!info?.addressLine1?.trim()) errors.addressLine1 = 'Address is required';
    if (!info?.city?.trim()) errors.city = 'City is required';
    if (!info?.state?.trim()) errors.state = 'State is required';
    if (!info?.postalCode?.trim()) errors.postalCode = 'Postal code is required';
    if (!info?.country?.trim()) errors.country = 'Country is required';

    return errors;
  }, [formData.addressInfo]);

  const validateStep = useCallback(
    (step: number): boolean => {
      let errors: Record<string, string> = {};

      switch (step) {
        case 0:
          errors = validatePersonalInfo();
          if (Object.keys(errors).length > 0) {
            setValidationErrors((prev) => ({ ...prev, personalInfo: errors }));
            return false;
          }
          break;
        case 1:
          errors = validateDocumentInfo();
          if (Object.keys(errors).length > 0) {
            setValidationErrors((prev) => ({ ...prev, documentInfo: errors }));
            return false;
          }
          break;
        case 2:
          errors = validateAddressInfo();
          if (Object.keys(errors).length > 0) {
            setValidationErrors((prev) => ({ ...prev, addressInfo: errors }));
            return false;
          }
          break;
      }

      return true;
    },
    [validatePersonalInfo, validateDocumentInfo, validateAddressInfo]
  );

  const isStepComplete = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0:
          return Object.keys(validatePersonalInfo()).length === 0 && formData.personalInfo !== null;
        case 1:
          return Object.keys(validateDocumentInfo()).length === 0 && formData.documentInfo !== null;
        case 2:
          return Object.keys(validateAddressInfo()).length === 0 && formData.addressInfo !== null;
        default:
          return false;
      }
    },
    [formData, validatePersonalInfo, validateDocumentInfo, validateAddressInfo]
  );

  const canProceedToNext = useCallback((): boolean => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  // Submit manual KYC
  const submitKYC = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // For KYCAID, just sync the verification
      if (kycaidSession || kycaidVerification) {
        await syncVerification();
      }
      // For manual KYC, submit the form data
      // This would be implemented if manual KYC is needed
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit KYC';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [kycaidSession, kycaidVerification, syncVerification]);

  // Create payment account after KYC approval
  const createPaymentAccount = useCallback(async (): Promise<boolean> => {
    if (unifiedStatus !== 'approved') {
      setError('KYC must be approved before creating payment account');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // User has 'name' field, try to split into first/last name
      const nameParts = user?.name?.split(' ') || [];
      const userFirstName = nameParts[0] || '';
      const userLastName = nameParts.slice(1).join(' ') || '';

      await kycApi.createPayscribeCustomer({
        firstName: kycaidFormData.firstName || userFirstName,
        lastName: kycaidFormData.lastName || userLastName,
        email: user?.email || '',
        phoneNumber: kycaidFormData.phoneNumber || user?.phoneNumber || '',
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment account';
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [unifiedStatus, kycaidFormData, user]);

  // Reset KYC
  const resetKYC = useCallback(() => {
    setFormData(initialFormData);
    setKycaidFormDataState(initialKYCAIDFormData);
    setKycaidAddressDataState(initialKYCAIDAddressData);
    setValidationErrors({});
    setCurrentStep(0);
    setError(null);
    setKycaidSession(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Status checks
  const isKYCComplete = useCallback((): boolean => {
    return unifiedStatus === 'approved';
  }, [unifiedStatus]);

  const isKYCPending = useCallback((): boolean => {
    return unifiedStatus === 'under_review' || unifiedStatus === 'pending_review';
  }, [unifiedStatus]);

  const isKYCRejected = useCallback((): boolean => {
    return unifiedStatus === 'rejected' || unifiedStatus === 'requires_resubmission';
  }, [unifiedStatus]);

  const isKYCNotStarted = useCallback((): boolean => {
    return unifiedStatus === 'not_started';
  }, [unifiedStatus]);

  const isKYCInProgress = useCallback((): boolean => {
    return unifiedStatus === 'in_progress';
  }, [unifiedStatus]);

  const canCreateCard = useCallback((): boolean => {
    return unifiedStatus === 'approved';
  }, [unifiedStatus]);

  const contextValue: KYCContextType = {
    kycStatus,
    unifiedStatus,
    isLoading,
    isSubmitting,
    error,
    kycaidSession,
    kycaidVerification,
    hasExistingVerification,
    currentStep,
    formData,
    kycaidFormData,
    kycaidAddressData,
    validationErrors,
    setCurrentStep,
    nextStep,
    previousStep,
    goToStep,
    setPersonalInfo,
    setDocumentInfo,
    setAddressInfo,
    setKYCAIDFormData,
    setKYCAIDAddressData,
    setValidationErrors,
    createSession,
    syncVerification,
    submitAddress,
    loadKYCStatus,
    loadVerification,
    submitKYC,
    createPaymentAccount,
    resetKYC,
    clearError,
    isStepComplete,
    validateStep,
    canProceedToNext,
    validateKYCAIDPersonalInfo,
    validateKYCAIDAddress,
    isKYCComplete,
    isKYCPending,
    isKYCRejected,
    isKYCNotStarted,
    isKYCInProgress,
    canCreateCard,
  };

  return <KYCContext.Provider value={contextValue}>{children}</KYCContext.Provider>;
}

export default KYCContext;
