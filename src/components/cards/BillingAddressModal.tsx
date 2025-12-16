import { useState, useEffect } from 'react';
import { X, MapPin, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import type { VirtualCard, BillingAddress } from '@/types/card';

interface BillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: VirtualCard;
}

// Common countries for the dropdown
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
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

export function BillingAddressModal({
  isOpen,
  onClose,
  card,
}: BillingAddressModalProps) {
  const { updateBillingAddress } = useVirtualCards();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<BillingAddress>({
    cardholderName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  // Initialize form with card's existing billing address
  useEffect(() => {
    if (card.billingAddress) {
      setFormData({
        cardholderName: card.billingAddress.cardholderName || card.cardholderName || '',
        addressLine1: card.billingAddress.addressLine1 || '',
        addressLine2: card.billingAddress.addressLine2 || '',
        city: card.billingAddress.city || '',
        state: card.billingAddress.state || '',
        postalCode: card.billingAddress.postalCode || '',
        country: card.billingAddress.country || 'US',
      });
    } else {
      setFormData({
        cardholderName: card.cardholderName || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      });
    }
  }, [card]);

  if (!isOpen) return null;

  const handleChange = (field: keyof BillingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.cardholderName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (!formData.addressLine1.trim()) {
      setError('Address line 1 is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.postalCode.trim()) {
      setError('Postal/ZIP code is required');
      return false;
    }
    if (!formData.country) {
      setError('Country is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateBillingAddress(card.id, formData);
      setSuccess('Billing address updated successfully');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update billing address';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Billing Address</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Info Card */}
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-kaviBlue/10 p-4">
            <MapPin className="h-5 w-5 flex-shrink-0 text-kaviBlue" />
            <div>
              <p className="font-medium text-foreground">Update Billing Address</p>
              <p className="text-sm text-muted-foreground">
                This address will be used for card verification during online purchases
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Cardholder Name *
              </label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleChange('cardholderName', e.target.value)}
                placeholder="Full name as shown on card"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                disabled={isLoading}
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                placeholder="Street address, P.O. box"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                disabled={isLoading}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressLine2 || ''}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                disabled={isLoading}
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  State *
                </label>
                {formData.country === 'US' ? (
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                    disabled={isLoading}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State/Province"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Postal Code and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {formData.country === 'US' ? 'ZIP Code' : 'Postal Code'} *
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder={formData.country === 'US' ? '12345' : 'Postal code'}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-kaviBlue focus:outline-none focus:ring-2 focus:ring-kaviBlue/20"
                  disabled={isLoading}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-accent/50 p-3">
            <Info className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Make sure your billing address matches the address associated with your
              payment method to avoid transaction declines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border p-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Address
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BillingAddressModal;
