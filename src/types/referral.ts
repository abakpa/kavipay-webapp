// Referral user data (from AuthContext user)
export interface ReferralUserData {
  referralCode: string;
  referralBonus: number;
  referralCount: number;
  telegramId?: string;
}

// Referral/Downline user
export interface ReferralUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  joinedAt: string;
  isActive: boolean;
  earnings?: number;
  status?: 'active' | 'pending' | 'inactive';
  avatarUrl?: string;
}

// Referral stats
export interface ReferralStats {
  totalReferrals: number;
  directReferrals: number;
  level2Referrals: number;
  level3Referrals: number;
  activeReferrals: number;
  totalEarnings: number;
  thisMonthReferrals: number;
  lastReferralDate?: string;
  conversionRate: number;
  // Legacy fields for backward compatibility
  totalBonus: number;
  pendingBonus: number;
  rank?: number;
  tier?: string;
}

// Referral link types
export type ReferralLinkType = 'telegram' | 'web' | 'code';

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
  twitter: `🚀 Join the crypto mining revolution with @KaviPay!

💰 Earn daily rewards
⛏️ Easy mining - no hardware needed
🎁 Get bonus tokens when you join

Use code: ${referralCode}
${referralLink}

#KaviPay #CryptoMining #PassiveIncome #Crypto`,

  whatsapp: `🚀 Hey! Check out KaviPay - I'm earning crypto rewards daily!

💰 Earn daily rewards just by mining
⛏️ Super easy - no expensive hardware needed
🎁 We both get bonuses when you join!

Use my referral code: *${referralCode}*

Join here: ${referralLink}`,

  telegram: `🚀 *Join the crypto mining revolution with KaviPay!*

💰 Earn daily rewards just by mining
⛏️ Easy mining - no expensive hardware needed
🎁 Earn referral bonuses together

Use my referral code: \`${referralCode}\`

Join now: ${referralLink}`,

  general: `🚀 Join KaviPay and start earning crypto rewards!

💰 Earn daily rewards
⛏️ Easy mining - no hardware needed
🎁 Get bonus tokens when you join

Use my referral code: ${referralCode}
Join here: ${referralLink}`,
});

// Default share message
export const getDefaultShareMessage = (referralCode: string, referralLink: string): string => `
🚀 Join the crypto mining revolution with KaviPay!

💰 Earn daily rewards just by mining
⛏️ Easy mining - no expensive hardware needed
🎁 Earn referral bonuses together

Use my referral code: ${referralCode}
Join now: ${referralLink}
`.trim();
