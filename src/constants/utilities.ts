// Utility Constants

import type { NetworkProvider, UtilityService, ElectricityProvider } from '@/types/utilities';

export const NetworkProviders: NetworkProvider[] = [
  { name: 'MTN', id: 'mtn' },
  { name: '9mobile', id: 'etisalat' },
  { name: 'Glo', id: 'glo' },
  { name: 'Airtel', id: 'airtel' },
];

export const DataNetworkProviders: NetworkProvider[] = [
  { name: 'MTN Data', id: 'mtn-data' },
  { name: '9mobile Data', id: 'etisalat-data' },
  { name: 'Glo Data', id: 'glo-data' },
  { name: 'Airtel Data', id: 'airtel-data' },
];

export const ElectricityProviders: ElectricityProvider[] = [
  { serviceId: 'eko-electric', name: 'Eko Electricity Distribution Company', shortName: 'EKEDC' },
  { serviceId: 'ikeja-electric', name: 'Ikeja Electricity Distribution Company', shortName: 'IKEDC' },
  { serviceId: 'ibadan-electric', name: 'Ibadan Electricity Distribution Company', shortName: 'IBEDC' },
  { serviceId: 'jos-electric', name: 'Jos Electricity Distribution Company', shortName: 'JED' },
  { serviceId: 'kaduna-electric', name: 'Kaduna Electricity Distribution Company', shortName: 'KAEDCO' },
  { serviceId: 'kano-electric', name: 'Kano Electricity Distribution Company', shortName: 'KEDCO' },
  { serviceId: 'portharcourt-electric', name: 'Port Harcourt Electricity Distribution Company', shortName: 'PHED' },
  { serviceId: 'abuja-electric', name: 'Abuja Electricity Distribution Company', shortName: 'AEDC' },
  { serviceId: 'enugu-electric', name: 'Enugu Electricity Distribution Company', shortName: 'EEDC' },
  { serviceId: 'benin-electric', name: 'Benin Electricity Distribution Company', shortName: 'BEDC' },
  { serviceId: 'yola-electric', name: 'Yola Electricity Distribution Company', shortName: 'YEDC' },
];

export const TvProviders: { serviceId: string; name: string }[] = [
  { serviceId: 'dstv', name: 'DSTV' },
  { serviceId: 'gotv', name: 'GOtv' },
  { serviceId: 'startimes', name: 'Startimes' },
  { serviceId: 'showmax', name: 'Showmax' },
];

export const UtilityServices: UtilityService[] = [
  {
    id: 'airtime',
    title: 'Airtime',
    description: 'Buy airtime for all networks',
    icon: 'phone',
    route: '/utilities/airtime',
    isActive: true,
  },
  {
    id: 'data',
    title: 'Data',
    description: 'Buy data bundles',
    icon: 'wifi',
    route: '/utilities/data',
    isActive: true,
  },
  {
    id: 'electricity',
    title: 'Electricity',
    description: 'Pay electricity bills',
    icon: 'zap',
    route: '/utilities/electricity',
    isActive: true,
  },
  {
    id: 'tv',
    title: 'TV Subscription',
    description: 'Pay for DSTV, GOtv & more',
    icon: 'tv',
    route: '/utilities/tv',
    isActive: true,
  },
];

// Validation patterns
export const ValidationPatterns = {
  phoneNumber: /^[0-9]{11}$/,
  meterNumber: /^[0-9]{11,13}$/,
  smartCardNumber: /^[0-9]{10,12}$/,
};

// Minimum amounts (in Naira)
export const MinimumAmounts = {
  airtime: 50,
  electricity: 800,
};

// Payment methods
export const PaymentMethods = [
  { id: 'wallet', name: 'Pay with Wallet', description: 'Use your wallet balance' },
  { id: 'crypto', name: 'Pay with Crypto', description: 'Pay using cryptocurrency' },
] as const;

// Crypto networks
export const CryptoNetworks = [
  { id: 'base', name: 'Base Network', symbol: 'BASE' },
] as const;

// Supported tokens
export const CryptoTokens = [
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
] as const;

// Transaction status colors
export const TransactionStatusColors = {
  pending: 'text-amber-500',
  completed: 'text-emerald-500',
  success: 'text-emerald-500',
  failed: 'text-red-500',
} as const;

// Transaction status backgrounds
export const TransactionStatusBg = {
  pending: 'bg-amber-500/10',
  completed: 'bg-emerald-500/10',
  success: 'bg-emerald-500/10',
  failed: 'bg-red-500/10',
} as const;
