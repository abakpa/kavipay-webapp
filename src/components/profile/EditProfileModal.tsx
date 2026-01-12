import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserAvatar } from './UserAvatar';
import { profileSchema, type ProfileFormData } from '@/types/profile';
import { cn } from '@/lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<boolean>;
  user: {
    name: string;
    email: string;
    phoneNumber?: string;
  };
}

export function EditProfileModal({ isOpen, onClose, onSave, user }: EditProfileModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phoneNumber: user.phoneNumber || '',
    },
  });

  // Reset form when modal opens with fresh user data
  useEffect(() => {
    if (isOpen) {
      reset({
        name: user.name,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [isOpen, user, reset]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSaving, onClose]);

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const success = await onSave(data);
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg p-2 hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <UserAvatar name={user.name} size="xl" />
          <button
            type="button"
            className="mt-2 text-sm text-kaviBlue hover:underline"
            disabled
          >
            Change photo (Coming soon)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name
            </label>
            <Input
              {...register('name')}
              placeholder="Enter your full name"
              disabled={isSaving}
              error={errors.name?.message}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email Address
            </label>
            <div className={cn(
              'flex items-center gap-3 rounded-lg border border-input bg-muted/50 px-4 py-3',
              'text-muted-foreground'
            )}>
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number
            </label>
            <Input
              {...register('phoneNumber')}
              placeholder="e.g., 08012345678"
              disabled={isSaving}
              error={errors.phoneNumber?.message}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used for account recovery and notifications
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
