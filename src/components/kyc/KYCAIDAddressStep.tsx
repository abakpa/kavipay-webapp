import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

interface KYCAIDAddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function KYCAIDAddressStep({ onNext, onBack }: KYCAIDAddressStepProps) {
  const {
    kycaidAddressData,
    setKYCAIDAddressData,
    validateKYCAIDAddress,
    validationErrors,
    submitAddress,
    isSubmitting,
    error,
    clearError,
  } = useKYC();

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Merge context errors with local errors
  const errors = { ...localErrors, ...validationErrors.addressInfo };

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleFieldChange = (field: keyof typeof kycaidAddressData, value: string) => {
    setKYCAIDAddressData({ [field]: value });
    setLocalErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateKYCAIDAddress();
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      return;
    }

    const success = await submitAddress();
    if (success) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <MapPin className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Address Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your current residential address
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Street Address */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Street Address
          </label>
          <Input
            value={kycaidAddressData.street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            className={cn(errors.street && 'border-destructive')}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-destructive">{errors.street}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            City
          </label>
          <Input
            value={kycaidAddressData.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="Lagos"
            className={cn(errors.city && 'border-destructive')}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* State/Province */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            State / Province
          </label>
          <Input
            value={kycaidAddressData.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            placeholder="Lagos State"
            className={cn(errors.state && 'border-destructive')}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Country
          </label>
          <Input
            value={kycaidAddressData.country}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            placeholder="Nigeria"
            className={cn(errors.country && 'border-destructive')}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-destructive">{errors.country}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Postal / ZIP Code
          </label>
          <Input
            value={kycaidAddressData.postalCode}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            placeholder="100001"
            className={cn(errors.postalCode && 'border-destructive')}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default KYCAIDAddressStep;
