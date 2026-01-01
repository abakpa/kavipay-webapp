// Utility Types and Interfaces

export enum TransactionTypes {
  FundTransfer = 1,
  BuyPower = 2,
  BuyAirtime = 3,
  BuyData = 4,
  TvSubscription = 5,
  ElectricityBill = 6,
}

export interface NetworkProvider {
  name: string;
  id: string;
}

export interface ServiceProvider {
  serviceId: string;
  name: string;
  minimumAmount?: number;
}

export interface DataBundle {
  variationCode: string;
  name: string;
  amount: number;
  fixedPrice: string;
}

export interface TvProvider {
  serviceId: string;
  name: string;
}

export interface TvPackage {
  variationCode: string;
  name: string;
  amount: number;
  fixedPrice: string;
}

export interface ElectricityProvider {
  serviceId: string;
  name: string;
  shortName: string;
}

export interface UtilityTransaction {
  type: TransactionTypes;
  networkProvider?: string;
  phoneNumber?: string;
  amount: number;
  amountInNaira?: number;
  paymentMethod: 'crypto' | 'wallet';
  token?: string;
  network?: string;
  serviceId?: string;
  serviceType?: string;
  meterNumber?: string;
  meterType?: 'prepaid' | 'postpaid';
  cardNumber?: string;
  packageId?: string;
  variationCode?: string;
  customerName?: string;
  customerAddress?: string;
}

export interface TransactionResponse {
  success: boolean;
  message?: string;
  data: {
    transactionId: string;
    reference: string;
    status: 'pending' | 'success' | 'failed' | 'completed';
    message: string;
    amount?: number;
    token?: string;
  };
}

export interface UtilityTransactionRecord {
  id: string;
  reference: string;
  type: TransactionTypes;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  serviceId?: string;
  phoneNumber?: string;
  meterNumber?: string;
  cardNumber?: string;
  token?: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface MeterVerificationResponse {
  success: boolean;
  data: {
    customerName: string;
    customerAddress: string;
    meterNumber: string;
  };
}

export interface SmartCardVerificationResponse {
  success: boolean;
  data: {
    customerName: string;
    cardNumber: string;
    currentPackage: string;
    dueDate?: string;
  };
}

export interface PowerTokenResponse {
  success: boolean;
  data: {
    token: string;
    amount: string;
    units: string;
    meterNumber: string;
  };
}

export interface UtilityService {
  id: string;
  title: string;
  description: string;
  icon: 'phone' | 'wifi' | 'zap' | 'tv' | 'globe';
  route: string;
  isActive: boolean;
}

export type PaymentMethod = 'wallet' | 'crypto';

export interface CryptoPaymentDetails {
  network: string;
  token: string;
  address: string;
  amount: number;
}
