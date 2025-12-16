import { useState } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/Button';
import { copyToClipboard, formatReferralCodeDisplay } from '@/utils/referral';
import { cn } from '@/lib/utils';

interface ReferralCodeCardProps {
  referralCode: string;
  referralLink: string;
  className?: string;
}

export function ReferralCodeCard({
  referralCode,
  referralLink,
  className,
}: ReferralCodeCardProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(referralCode);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!referralCode) {
    return (
      <div className={cn('rounded-2xl bg-card p-6 text-center', className)}>
        <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          Complete your profile to get your referral code
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl bg-card p-6', className)}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviBlue/10">
          <Gift className="h-8 w-8 text-kaviBlue" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Share & Earn</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite friends and earn rewards together
        </p>
      </div>

      {/* QR Code */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <QRCodeSVG
            value={referralLink}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Your Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl bg-accent/50 p-4 text-center">
            <span className="text-2xl font-bold tracking-wider text-foreground">
              {formatReferralCodeDisplay(referralCode)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="shrink-0"
          >
            {copiedCode ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Referral Link */}
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">
          Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card p-3">
            <p className="truncate font-mono text-sm text-foreground">
              {referralLink}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReferralCodeCard;
