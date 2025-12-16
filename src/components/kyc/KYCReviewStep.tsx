import { useState } from 'react';
import { ClipboardCheck, User, FileText, MapPin, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useKYC } from '@/contexts/KYCContext';
import { cn } from '@/lib/utils';

interface KYCReviewStepProps {
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  GH: 'Ghana',
  KE: 'Kenya',
  ZA: 'South Africa',
  DE: 'Germany',
  FR: 'France',
  AU: 'Australia',
};

// Document type labels
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'International Passport',
  national_id: 'National ID Card',
  drivers_license: "Driver's License",
  voters_card: "Voter's Card",
};

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, icon, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-kaviBlue hover:bg-kaviBlue/10"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

interface ReviewItemProps {
  label: string;
  value: string | undefined;
  className?: string;
}

function ReviewItem({ label, value, className }: ReviewItemProps) {
  return (
    <div className={cn('py-1', className)}>
      <span className="text-sm text-muted-foreground">{label}: </span>
      <span className="text-sm font-medium text-foreground">{value || '-'}</span>
    </div>
  );
}

export function KYCReviewStep({ onSubmit, onBack, onEditStep }: KYCReviewStepProps) {
  const { formData, isSubmitting, error, validationErrors } = useKYC();
  const [isAgreed, setIsAgreed] = useState(false);

  const { personalInfo, documentInfo, addressInfo } = formData;

  const hasValidationErrors =
    Object.keys(validationErrors.personalInfo || {}).length > 0 ||
    Object.keys(validationErrors.documentInfo || {}).length > 0 ||
    Object.keys(validationErrors.addressInfo || {}).length > 0;

  const handleSubmit = async () => {
    if (!isAgreed) return;
    await onSubmit();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <ClipboardCheck className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Review Your Information</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your details before submitting
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {/* Validation Errors */}
      {hasValidationErrors && (
        <div className="rounded-xl bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-600">
            Some required fields are missing. Please review and complete all sections.
          </p>
        </div>
      )}

      {/* Personal Information Section */}
      <ReviewSection
        title="Personal Information"
        icon={<User className="h-5 w-5 text-kaviBlue" />}
        onEdit={() => onEditStep(0)}
      >
        <div className="grid gap-1 sm:grid-cols-2">
          <ReviewItem label="First Name" value={personalInfo?.firstName} />
          <ReviewItem label="Last Name" value={personalInfo?.lastName} />
          {personalInfo?.middleName && (
            <ReviewItem label="Middle Name" value={personalInfo.middleName} />
          )}
          <ReviewItem label="Date of Birth" value={formatDate(personalInfo?.dateOfBirth)} />
          <ReviewItem
            label="Nationality"
            value={
              personalInfo?.nationality
                ? COUNTRY_NAMES[personalInfo.nationality] || personalInfo.nationality
                : undefined
            }
          />
          <ReviewItem label="Phone Number" value={personalInfo?.phoneNumber} />
          <ReviewItem label="Email" value={personalInfo?.email} className="sm:col-span-2" />
        </div>
      </ReviewSection>

      {/* Document Information Section */}
      <ReviewSection
        title="Document Information"
        icon={<FileText className="h-5 w-5 text-kaviBlue" />}
        onEdit={() => onEditStep(1)}
      >
        <div className="space-y-4">
          <div className="grid gap-1 sm:grid-cols-2">
            <ReviewItem
              label="Document Type"
              value={
                documentInfo?.documentType
                  ? DOCUMENT_TYPE_LABELS[documentInfo.documentType] || documentInfo.documentType
                  : undefined
              }
            />
            <ReviewItem label="Document Number" value={documentInfo?.documentNumber} />
            <ReviewItem label="Issue Date" value={formatDate(documentInfo?.issuedDate)} />
            <ReviewItem label="Expiry Date" value={formatDate(documentInfo?.expiryDate)} />
            <ReviewItem
              label="Issuing Country"
              value={
                documentInfo?.issuingCountry
                  ? COUNTRY_NAMES[documentInfo.issuingCountry] || documentInfo.issuingCountry
                  : undefined
              }
            />
          </div>

          {/* Document Images Preview */}
          <div className="grid gap-4 sm:grid-cols-2">
            {documentInfo?.frontImageUrl && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Front of Document</p>
                <img
                  src={documentInfo.frontImageUrl}
                  alt="Document front"
                  className="h-32 w-full rounded-lg border border-border object-cover"
                />
              </div>
            )}
            {documentInfo?.backImageUrl && (
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Back of Document</p>
                <img
                  src={documentInfo.backImageUrl}
                  alt="Document back"
                  className="h-32 w-full rounded-lg border border-border object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </ReviewSection>

      {/* Address Information Section */}
      <ReviewSection
        title="Address Information"
        icon={<MapPin className="h-5 w-5 text-kaviBlue" />}
        onEdit={() => onEditStep(2)}
      >
        <div className="grid gap-1 sm:grid-cols-2">
          <ReviewItem
            label="Address"
            value={addressInfo?.addressLine1}
            className="sm:col-span-2"
          />
          {addressInfo?.addressLine2 && (
            <ReviewItem
              label="Address Line 2"
              value={addressInfo.addressLine2}
              className="sm:col-span-2"
            />
          )}
          <ReviewItem label="City" value={addressInfo?.city} />
          <ReviewItem label="State" value={addressInfo?.state} />
          <ReviewItem label="Postal Code" value={addressInfo?.postalCode} />
          <ReviewItem
            label="Country"
            value={
              addressInfo?.country
                ? COUNTRY_NAMES[addressInfo.country] || addressInfo.country
                : undefined
            }
          />
        </div>
      </ReviewSection>

      {/* Agreement Checkbox */}
      <div className="rounded-xl bg-accent/50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-kaviBlue focus:ring-kaviBlue"
          />
          <span className="text-sm text-muted-foreground">
            I confirm that all the information provided is accurate and matches my official
            identification documents. I understand that providing false information may result in
            the rejection of my verification request.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={!isAgreed || isSubmitting || hasValidationErrors}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit for Verification'
          )}
        </Button>
      </div>
    </div>
  );
}

export default KYCReviewStep;
