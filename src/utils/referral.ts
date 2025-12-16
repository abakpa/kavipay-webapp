import {
  REFERRAL_CONFIG,
  generateShareMessages,
  getDefaultShareMessage,
  type SharePlatform,
} from '@/types/referral';

/**
 * Generate Telegram bot referral link
 */
export const generateTelegramReferralLink = (telegramId: string): string => {
  if (!telegramId) {
    console.warn('No Telegram ID provided for referral link generation');
    return '';
  }
  return `${REFERRAL_CONFIG.TELEGRAM_BASE_URL}/${REFERRAL_CONFIG.BOT_USERNAME}?start=${telegramId}`;
};

/**
 * Generate web referral link
 */
export const generateWebReferralLink = (referralCode: string): string => {
  if (!referralCode) {
    console.warn('No referral code provided for link generation');
    return REFERRAL_CONFIG.APP_URL;
  }
  return `${REFERRAL_CONFIG.WEB_REFERRAL_BASE_URL}/${referralCode}`;
};

/**
 * Generate app registration link with referral code
 */
export const generateAppReferralLink = (referralCode: string): string => {
  if (!referralCode) {
    return REFERRAL_CONFIG.APP_URL;
  }
  return `${REFERRAL_CONFIG.APP_URL}/auth?ref=${referralCode}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
};

/**
 * Share using Web Share API (native sharing)
 */
export const shareNative = async (
  referralCode: string,
  referralLink: string
): Promise<boolean> => {
  if (!('share' in navigator)) {
    return false;
  }

  try {
    await navigator.share({
      title: 'Join KaviPay',
      text: getDefaultShareMessage(referralCode, referralLink),
      url: referralLink,
    });
    return true;
  } catch (error) {
    // User cancelled or share failed
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
};

/**
 * Generate share URL for specific platform
 */
export const getShareUrl = (
  platform: SharePlatform,
  referralCode: string,
  referralLink: string
): string => {
  const messages = generateShareMessages(referralCode, referralLink);
  const encodedMessage = encodeURIComponent(messages.general);
  const encodedLink = encodeURIComponent(referralLink);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`;

    case 'telegram':
      return `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(messages.telegram)}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`;

    default:
      return referralLink;
  }
};

/**
 * Open share URL in new window/tab
 */
export const openShareWindow = (
  platform: SharePlatform,
  referralCode: string,
  referralLink: string
): void => {
  const url = getShareUrl(platform, referralCode, referralLink);

  // Open in popup for social sharing
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );
};

/**
 * Format referral bonus amount
 */
export const formatReferralBonus = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format referral count with proper pluralization
 */
export const formatReferralCount = (count: number): string => {
  if (count === 0) return 'No referrals yet';
  if (count === 1) return '1 referral';
  return `${count} referrals`;
};

/**
 * Check if Web Share API is available
 */
export const isNativeShareSupported = (): boolean => {
  return 'share' in navigator;
};

/**
 * Generate a shortened display version of referral code
 */
export const formatReferralCodeDisplay = (code: string | undefined | null): string => {
  if (!code || typeof code !== 'string') return '';
  return code.toUpperCase();
};
