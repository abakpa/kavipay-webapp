import { useState, useEffect, useRef } from 'react';
import { FileText, X, Camera, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';
import { DocumentType } from '@/types/card';
import { cn } from '@/lib/utils';

interface DocumentUploadStepProps {
  onNext: () => void;
  onBack: () => void;
}

const DOCUMENT_TYPES = [
  { value: DocumentType.PASSPORT, label: 'International Passport', requiresBack: false },
  { value: DocumentType.NATIONAL_ID, label: 'National ID Card', requiresBack: true },
  { value: DocumentType.DRIVERS_LICENSE, label: "Driver's License", requiresBack: true },
];

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
];

export function DocumentUploadStep({ onNext, onBack }: DocumentUploadStepProps) {
  const { formData, setDocumentInfo, validationErrors, validateStep } = useKYC();

  const [localData, setLocalData] = useState({
    documentType: formData.documentInfo?.documentType || DocumentType.PASSPORT,
    documentNumber: formData.documentInfo?.documentNumber || '',
    issuedDate: formData.documentInfo?.issuedDate || '',
    expiryDate: formData.documentInfo?.expiryDate || '',
    issuingCountry: formData.documentInfo?.issuingCountry || 'NG',
    frontImageUrl: formData.documentInfo?.frontImageUrl || '',
    backImageUrl: formData.documentInfo?.backImageUrl || '',
  });

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Sync with context
  useEffect(() => {
    if (formData.documentInfo) {
      setLocalData({
        documentType: formData.documentInfo.documentType || DocumentType.PASSPORT,
        documentNumber: formData.documentInfo.documentNumber || '',
        issuedDate: formData.documentInfo.issuedDate || '',
        expiryDate: formData.documentInfo.expiryDate || '',
        issuingCountry: formData.documentInfo.issuingCountry || 'NG',
        frontImageUrl: formData.documentInfo.frontImageUrl || '',
        backImageUrl: formData.documentInfo.backImageUrl || '',
      });
      if (formData.documentInfo.frontImageUrl) {
        setFrontPreview(formData.documentInfo.frontImageUrl);
      }
      if (formData.documentInfo.backImageUrl) {
        setBackPreview(formData.documentInfo.backImageUrl);
      }
    }
  }, [formData.documentInfo]);

  const selectedDocType = DOCUMENT_TYPES.find((t) => t.value === localData.documentType);

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

  const handleFileChange = (type: 'front' | 'back', file: File | null) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLocalErrors((prev) => ({
        ...prev,
        [type === 'front' ? 'frontImageUrl' : 'backImageUrl']:
          'Please upload a valid image (JPEG, PNG, or WebP)',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setLocalErrors((prev) => ({
        ...prev,
        [type === 'front' ? 'frontImageUrl' : 'backImageUrl']:
          'Image size must be less than 5MB',
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'front') {
        setFrontPreview(result);
        setLocalData((prev) => ({ ...prev, frontImageUrl: result }));
      } else {
        setBackPreview(result);
        setLocalData((prev) => ({ ...prev, backImageUrl: result }));
      }
    };
    reader.readAsDataURL(file);

    // Clear error
    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[type === 'front' ? 'frontImageUrl' : 'backImageUrl'];
      return newErrors;
    });
  };

  const removeImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontPreview(null);
      setLocalData((prev) => ({ ...prev, frontImageUrl: '' }));
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else {
      setBackPreview(null);
      setLocalData((prev) => ({ ...prev, backImageUrl: '' }));
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    setDocumentInfo(localData);

    if (validateStep(1)) {
      onNext();
    } else {
      setLocalErrors(validationErrors.documentInfo || {});
    }
  };

  const errors = { ...localErrors, ...validationErrors.documentInfo };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <FileText className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Document Upload</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a clear photo of your identification document
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-kaviBlue/10 p-4">
        <p className="text-sm text-muted-foreground">
          Ensure your document is clearly visible, well-lit, and all corners are within
          the frame. Accepted formats: JPEG, PNG, WebP (max 5MB).
        </p>
      </div>

      {/* Document Type Selection */}
      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">
          Document Type *
        </label>
        <div className="space-y-2">
          {DOCUMENT_TYPES.map((docType) => (
            <button
              key={docType.value}
              type="button"
              onClick={() => handleChange('documentType', docType.value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                localData.documentType === docType.value
                  ? 'border-kaviBlue bg-kaviBlue/10'
                  : 'border-border hover:bg-accent/50'
              )}
            >
              <FileText
                className={cn(
                  'h-5 w-5',
                  localData.documentType === docType.value
                    ? 'text-kaviBlue'
                    : 'text-muted-foreground'
                )}
              />
              <span className="font-medium text-foreground">{docType.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload - Front */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Front of Document *
        </label>
        <input
          ref={frontInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
          className="hidden"
        />
        {frontPreview ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            <img
              src={frontPreview}
              alt="Document front"
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage('front')}
              className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-white hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => frontInputRef.current?.click()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors',
              errors.frontImageUrl
                ? 'border-destructive bg-destructive/5'
                : 'border-border hover:border-kaviBlue hover:bg-kaviBlue/5'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              Click to upload front of document
            </span>
          </button>
        )}
        {errors.frontImageUrl && (
          <p className="mt-1 text-sm text-destructive">{errors.frontImageUrl}</p>
        )}
      </div>

      {/* Image Upload - Back (conditional) */}
      {selectedDocType?.requiresBack && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Back of Document *
          </label>
          <input
            ref={backInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
            className="hidden"
          />
          {backPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={backPreview}
                alt="Document back"
                className="h-48 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage('back')}
                className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-white hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => backInputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors',
                errors.backImageUrl
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border hover:border-kaviBlue hover:bg-kaviBlue/5'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                Click to upload back of document
              </span>
            </button>
          )}
          {errors.backImageUrl && (
            <p className="mt-1 text-sm text-destructive">{errors.backImageUrl}</p>
          )}
        </div>
      )}

      {/* Document Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Document Information</h3>

        {/* Document Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Document Number *
          </label>
          <input
            type="text"
            value={localData.documentNumber}
            onChange={(e) => handleChange('documentNumber', e.target.value.toUpperCase())}
            placeholder="Enter document number"
            className={cn(
              'w-full rounded-xl border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
              errors.documentNumber ? 'border-destructive' : 'border-border'
            )}
          />
          {errors.documentNumber && (
            <p className="mt-1 text-sm text-destructive">{errors.documentNumber}</p>
          )}
        </div>

        {/* Issue and Expiry Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Issue Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={localData.issuedDate}
                onChange={(e) => handleChange('issuedDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                  errors.issuedDate ? 'border-destructive' : 'border-border'
                )}
              />
            </div>
            {errors.issuedDate && (
              <p className="mt-1 text-sm text-destructive">{errors.issuedDate}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Expiry Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={localData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={cn(
                  'w-full rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                  errors.expiryDate ? 'border-destructive' : 'border-border'
                )}
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-destructive">{errors.expiryDate}</p>
            )}
          </div>
        </div>

        {/* Issuing Country */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Issuing Country *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={localData.issuingCountry}
              onChange={(e) => handleChange('issuingCountry', e.target.value)}
              className={cn(
                'w-full appearance-none rounded-xl border bg-card py-3 pl-10 pr-4 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20',
                errors.issuingCountry ? 'border-destructive' : 'border-border'
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
          {errors.issuingCountry && (
            <p className="mt-1 text-sm text-destructive">{errors.issuingCountry}</p>
          )}
        </div>
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

export default DocumentUploadStep;
