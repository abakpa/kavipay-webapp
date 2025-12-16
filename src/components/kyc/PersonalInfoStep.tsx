import { useState, useEffect } from 'react';
import { User, Calendar, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack?: () => void;
}

// Common countries
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

export function PersonalInfoStep({ onNext, onBack }: PersonalInfoStepProps) {
  const { formData, setPersonalInfo, validationErrors, validateStep } = useKYC();

  const [localData, setLocalData] = useState({
    firstName: formData.personalInfo?.firstName || '',
    lastName: formData.personalInfo?.lastName || '',
    middleName: formData.personalInfo?.middleName || '',
    dateOfBirth: formData.personalInfo?.dateOfBirth || '',
    nationality: formData.personalInfo?.nationality || 'NG',
    phoneNumber: formData.personalInfo?.phoneNumber || '',
    email: formData.personalInfo?.email || '',
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Sync with context when form data changes
  useEffect(() => {
    if (formData.personalInfo) {
      setLocalData({
        firstName: formData.personalInfo.firstName || '',
        lastName: formData.personalInfo.lastName || '',
        middleName: formData.personalInfo.middleName || '',
        dateOfBirth: formData.personalInfo.dateOfBirth || '',
        nationality: formData.personalInfo.nationality || 'NG',
        phoneNumber: formData.personalInfo.phoneNumber || '',
        email: formData.personalInfo.email || '',
      });
    }
  }, [formData.personalInfo]);

  const handleChange = (field: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (localErrors[field]) {
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleContinue = () => {
    // Save to context
    setPersonalInfo(localData);

    // Validate
    if (validateStep(0)) {
      onNext();
    } else {
      // Set local errors from validation
      setLocalErrors(validationErrors.personalInfo || {});
    }
  };

  const errors = { ...localErrors, ...validationErrors.personalInfo };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <User className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please provide your personal details as they appear on your ID
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              First Name *
            </label>
            <input
              type="text"
              value={localData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className={cn(
                'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.firstName ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Last Name *
            </label>
            <input
              type="text"
              value={localData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className={cn(
                'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.lastName ? 'border-destructive' : 'border-border'
              )}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Middle Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Middle Name (Optional)
          </label>
          <input
            type="text"
            value={localData.middleName}
            onChange={(e) => handleChange('middleName', e.target.value)}
            placeholder="Enter middle name"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Date of Birth *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={localData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={cn(
                'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.dateOfBirth ? 'border-destructive' : 'border-border'
              )}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Nationality */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Nationality *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={localData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className={cn(
                'w-full appearance-none rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.nationality ? 'border-destructive' : 'border-border'
              )}
            >
              <option value="">Select nationality</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          {errors.nationality && (
            <p className="mt-1 text-sm text-destructive">{errors.nationality}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={localData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="+234 800 000 0000"
              className={cn(
                'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.phoneNumber ? 'border-destructive' : 'border-border'
              )}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-destructive">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={localData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className={cn(
                'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.email ? 'border-destructive' : 'border-border'
              )}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
        )}
        <Button className="flex-1" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export default PersonalInfoStep;
