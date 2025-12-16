import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  shareNative,
  openShareWindow,
  isNativeShareSupported,
} from '@/utils/referral';
import type { SharePlatform } from '@/types/referral';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  referralCode: string;
  referralLink: string;
  className?: string;
}

interface ShareOption {
  platform: SharePlatform;
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    bgColor: 'bg-[#25D366]/10 hover:bg-[#25D366]/20',
    textColor: 'text-[#25D366]',
  },
  {
    platform: 'telegram',
    label: 'Telegram',
    icon: '✈️',
    bgColor: 'bg-[#0088cc]/10 hover:bg-[#0088cc]/20',
    textColor: 'text-[#0088cc]',
  },
  {
    platform: 'twitter',
    label: 'Twitter',
    icon: '𝕏',
    bgColor: 'bg-foreground/10 hover:bg-foreground/20',
    textColor: 'text-foreground',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    icon: 'f',
    bgColor: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20',
    textColor: 'text-[#1877F2]',
  },
];

export function ShareButtons({
  referralCode,
  referralLink,
  className,
}: ShareButtonsProps) {
  const handleNativeShare = async () => {
    await shareNative(referralCode, referralLink);
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    openShareWindow(platform, referralCode, referralLink);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-foreground">Share via</h3>

      {/* Native Share Button (Mobile) */}
      {isNativeShareSupported() && (
        <Button
          variant="default"
          className="w-full gap-2"
          onClick={handleNativeShare}
        >
          <Share2 className="h-4 w-4" />
          Share Link
        </Button>
      )}

      {/* Platform Share Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {SHARE_OPTIONS.map((option) => (
          <button
            key={option.platform}
            onClick={() => handlePlatformShare(option.platform)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl p-4 transition-colors',
              option.bgColor
            )}
          >
            <span className="text-xl">{option.icon}</span>
            <span className={cn('font-medium', option.textColor)}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ShareButtons;
