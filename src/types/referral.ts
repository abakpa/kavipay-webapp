// Share platform types
export type SharePlatform = 'twitter' | 'whatsapp' | 'telegram' | 'facebook' | 'copy' | 'native';

// Referral configuration
export const REFERRAL_CONFIG = {
  BOT_USERNAME: 'kavi_labs_bot',
  TELEGRAM_BASE_URL: 'https://t.me',
  WEB_REFERRAL_BASE_URL: 'https://referral.kavipay.io/ref',
  APP_URL: 'https://app.kavipay.io',
} as const;

// Share message templates
export interface ShareMessageTemplates {
  twitter: string;
  whatsapp: string;
  telegram: string;
  general: string;
}

// Generate share messages for different platforms
export const generateShareMessages = (
  referralCode: string,
  referralLink: string
): ShareMessageTemplates => ({
  twitter: `Join KaviPay and start earning crypto rewards!\n\nUse code: ${referralCode}\n${referralLink}\n\n#KaviPay #Crypto`,

  whatsapp: `Hey! Check out KaviPay - I'm earning crypto rewards daily!\n\nWe both get bonuses when you join!\n\nUse my referral code: *${referralCode}*\n\nJoin here: ${referralLink}`,

  telegram: `*Join KaviPay and start earning crypto rewards!*\n\nUse my referral code: \`${referralCode}\`\n\nJoin now: ${referralLink}`,

  general: `Join KaviPay and start earning crypto rewards!\n\nUse my referral code: ${referralCode}\nJoin here: ${referralLink}`,
});

// Default share message
export const getDefaultShareMessage = (referralCode: string, referralLink: string): string =>
  `Join KaviPay and start earning crypto rewards!\n\nUse my referral code: ${referralCode}\nJoin now: ${referralLink}`;
