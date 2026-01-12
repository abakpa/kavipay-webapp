import { z } from 'zod';

// Profile update data
export interface ProfileUpdateData {
  name: string;
  phoneNumber?: string;
}

// Delete account steps
export type DeleteAccountStep = 'warning' | 'confirm' | 'deleting' | 'deleted';

// Profile form validation schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{10,15}$/.test(val), {
      message: 'Phone number must be 10-15 digits',
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Avatar colors for consistent color generation
export const AVATAR_COLORS = [
  '#4DA6FF', // Blue (kaviBlue)
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#06B6D4', // Cyan
] as const;

// Get consistent color based on name
export function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// KYC Status display config
export const KYC_STATUS_CONFIG = {
  not_verified: {
    label: 'Not Verified',
    description: 'Verify your identity to unlock all features',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    action: 'Get Verified',
    actionRoute: '/kyc',
  },
  pending: {
    label: 'Pending Verification',
    description: 'Your verification is being reviewed (24-48 hours)',
    color: '#4DA6FF',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    action: 'View Status',
    actionRoute: '/kyc/status',
  },
  verified: {
    label: 'Verified',
    description: 'Your identity has been verified',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    action: null,
    actionRoute: null,
  },
  rejected: {
    label: 'Verification Failed',
    description: 'Your verification was unsuccessful. Please try again.',
    color: '#EF4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    action: 'Try Again',
    actionRoute: '/kyc',
  },
} as const;

export type KYCStatus = keyof typeof KYC_STATUS_CONFIG;
