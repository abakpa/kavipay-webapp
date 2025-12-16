import { useState, useEffect } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

interface AddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
];

// US States
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia',
];

// Nigerian States
const NG_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

export function AddressStep({ onNext, onBack }: AddressStepProps) {
  const { formData, setAddressInfo, validationErrors, validateStep } = useKYC();

  const [localData, setLocalData] = useState({
    addressLine1: formData.addressInfo?.addressLine1 || '',
    addressLine2: formData.addressInfo?.addressLine2 || '',
    city: formData.addressInfo?.city || '',
    state: formData.addressInfo?.state || '',
    postalCode: formData.addressInfo?.postalCode || '',
    country: formData.addressInfo?.country || 'NG',
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Sync with context
  useEffect(() => {
    if (formData.addressInfo) {
      setLocalData({
        addressLine1: formData.addressInfo.addressLine1 || '',
        addressLine2: formData.addressInfo.addressLine2 || '',
        city: formData.addressInfo.city || '',
        state: formData.addressInfo.state || '',
        postalCode: formData.addressInfo.postalCode || '',
        country: formData.addressInfo.country || 'NG',
      });
    }
  }, [formData.addressInfo]);

  const handleChange = (field: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    if (localErrors[field]) {
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContinue = () => {
    setAddressInfo(localData);

    if (validateStep(2)) {
      onNext();
    } else {
      setLocalErrors(validationErrors.addressInfo || {});
    }
  };

  const errors = { ...localErrors, ...validationErrors.addressInfo };

  // Get states based on selected country
  const getStatesForCountry = () => {
    switch (localData.country) {
      case 'US':
        return US_STATES;
      case 'NG':
        return NG_STATES;
      default:
        return null;
    }
  };

  const states = getStatesForCountry();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <MapPin className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Address Verification</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please provide your current residential address
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Country *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={localData.country}
              onChange={(e) => {
                handleChange('country', e.target.value);
                // Reset state when country changes
                handleChange('state', '');
              }}
              className={cn(
                'w-full appearance-none rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.country ? 'border-destructive' : 'border-border'
              )}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          {errors.country && (
            <p className="mt-1 text-sm text-destructive">{errors.country}</p>
          )}
        </div>

        {/* Address Line 1 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={localData.addressLine1}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="Street address, P.O. box"
            className={cn(
              'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
              errors.addressLine1 ? 'border-destructive' : 'border-border'
            )}
          />
          {errors.addressLine1 && (
            <p className="mt-1 text-sm text-destructive">{errors.addressLine1}</p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={localData.addressLine2}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
          />
        </div>

        {/* City and State */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              City *
            </label>
            <input
              type="text"
              value={localData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
              className={cn(
                'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.city ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              State *
            </label>
            {states ? (
              <select
                value={localData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className={cn(
                  'w-full appearance-none rounded-xl border bg-card px-4 py-3 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                  errors.state ? 'border-destructive' : 'border-border'
                )}
              >
                <option value="">Select state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={localData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State/Province"
                className={cn(
                  'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                  errors.state ? 'border-destructive' : 'border-border'
                )}
              />
            )}
            {errors.state && (
              <p className="mt-1 text-sm text-destructive">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {localData.country === 'US' ? 'ZIP Code' : 'Postal Code'} *
          </label>
          <input
            type="text"
            value={localData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder={localData.country === 'US' ? '12345' : 'Postal code'}
            className={cn(
              'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
              errors.postalCode ? 'border-destructive' : 'border-border'
            )}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-accent/50 p-4">
        <p className="text-xs text-muted-foreground">
          Your address will be used for card verification during online purchases. Make
          sure it matches the address on your identification document for smooth
          verification.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export default AddressStep;
