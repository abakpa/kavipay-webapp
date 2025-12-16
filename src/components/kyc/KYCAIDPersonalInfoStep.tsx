import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, User, Calendar, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

// Common countries for quick selection
const POPULAR_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', phoneCode: '+234' },
  { code: 'US', name: 'United States', phoneCode: '+1' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', phoneCode: '+1' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254' },
  { code: 'ZA', name: 'South Africa', phoneCode: '+27' },
  { code: 'DE', name: 'Germany', phoneCode: '+49' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'IN', name: 'India', phoneCode: '+91' },
];

interface KYCAIDPersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function KYCAIDPersonalInfoStep({ onNext, onBack }: KYCAIDPersonalInfoStepProps) {
  const {
    kycaidFormData,
    setKYCAIDFormData,
    validateKYCAIDPersonalInfo,
    validationErrors,
    isSubmitting,
    error,
    clearError,
  } = useKYC();

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Merge context errors with local errors
  const errors = { ...localErrors, ...validationErrors.personalInfo };

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleFieldChange = (field: keyof typeof kycaidFormData, value: string) => {
    setKYCAIDFormData({ [field]: value });
    setLocalErrors((prev) => ({ ...prev, [field]: '' }));

    // Auto-update phone code when country changes
    if (field === 'country') {
      const selectedCountry = POPULAR_COUNTRIES.find((c) => c.code === value);
      if (selectedCountry && !kycaidFormData.phoneNumber) {
        setKYCAIDFormData({ phoneNumber: selectedCountry.phoneCode });
      }
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateKYCAIDPersonalInfo();
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      return;
    }
    onNext();
  };

  const selectedCountry = POPULAR_COUNTRIES.find((c) => c.code === kycaidFormData.country);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <User className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details exactly as they appear on your ID
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            First Name
          </label>
          <Input
            value={kycaidFormData.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            className={cn(errors.firstName && 'border-destructive')}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Last Name
          </label>
          <Input
            value={kycaidFormData.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            className={cn(errors.lastName && 'border-destructive')}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            <Calendar className="mr-1 inline h-4 w-4" />
            Date of Birth
          </label>
          <Input
            type="date"
            value={kycaidFormData.dob}
            onChange={(e) => handleFieldChange('dob', e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split('T')[0]}
            className={cn(errors.dob && 'border-destructive')}
          />
          {errors.dob && <p className="mt-1 text-sm text-destructive">{errors.dob}</p>}
        </div>

        {/* Country */}
        <div className="relative">
          <label className="mb-2 block text-sm font-medium text-foreground">
            <Globe className="mr-1 inline h-4 w-4" />
            Country
          </label>
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left',
              errors.country && 'border-destructive',
              showCountryDropdown && 'ring-2 ring-kaviBlue'
            )}
          >
            <span className={cn(!selectedCountry && 'text-muted-foreground')}>
              {selectedCountry?.name || 'Select your country'}
            </span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </button>

          {showCountryDropdown && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-border bg-card shadow-lg">
              {POPULAR_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    handleFieldChange('country', country.code);
                    setShowCountryDropdown(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent',
                    kycaidFormData.country === country.code && 'bg-kaviBlue/10'
                  )}
                >
                  <span>{country.name}</span>
                  <span className="text-sm text-muted-foreground">{country.code}</span>
                </button>
              ))}
            </div>
          )}
          {errors.country && (
            <p className="mt-1 text-sm text-destructive">{errors.country}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            <Phone className="mr-1 inline h-4 w-4" />
            Phone Number
          </label>
          <Input
            type="tel"
            value={kycaidFormData.phoneNumber}
            onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
            placeholder="+234 xxx xxx xxxx"
            className={cn(errors.phoneNumber && 'border-destructive')}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-destructive">{errors.phoneNumber}</p>
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

export default KYCAIDPersonalInfoStep;
