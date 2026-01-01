import { api } from './index';

// Types
interface DataBundleApiResponse {
  variation_code?: string;
  name?: string;
  variation_amount?: string;
  fixedPrice?: string;
}

interface UtilityTransactionApiResponse {
  id?: number;
  type?: number;
  naira_amount?: number;
  status?: string;
  phone_number?: string;
  network?: string;
  package_id?: string;
  smart_card_number?: string;
  meter_number?: string;
  power_main_code?: string;
  payment_method?: string;
  date?: number;
  request_id?: string;
}

interface UtilityServiceDetails {
  phoneNumber?: string;
  network?: string;
  packageId?: string;
  smartCardNumber?: string;
  meterNumber?: string;
  powerToken?: string;
}

export interface UtilityTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  serviceDetails: UtilityServiceDetails;
  paymentMethod: string;
  createdAt: string;
  reference: string;
}

export interface DataBundle {
  variationCode: string;
  name: string;
  amount: number;
  fixedPrice: string;
}

// Airtime

export const buyAirtime = async (data: {
  network: string;
  phoneNumber: string;
  amountInNaira: number;
  currencyNetwork: string;
  currency: string;
  paymentMethod: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> => {
  const response = await api.post('/utilities/buy-aitime', data);
  return response.data;
};

// Data bundles

export const getDataBundles = async (
  serviceId: string
): Promise<{ success: boolean; data: DataBundle[] }> => {
  const response = await api.get(`/utilities/service-variations/${serviceId}`);
  const rawData = response.data;

  if (Array.isArray(rawData) && rawData.length > 0) {
    const transformedData = rawData.map((item: DataBundleApiResponse) => ({
      variationCode: item.variation_code || '',
      name: item.name || '',
      amount: parseInt(item.variation_amount || '0', 10),
      fixedPrice: item.fixedPrice || '',
    }));

    return { success: true, data: transformedData };
  }

  return { success: false, data: [] };
};

export const buyData = async (data: {
  phoneNumber: string;
  amountInNaira: number;
  network: string;
  variationCode: string;
  currency: string;
  paymentMethod: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> => {
  const response = await api.post('/utilities/buy-data', data);
  return response.data;
};

// Transaction history

export const getUserUtilityTransactions = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}): Promise<{
  success: boolean;
  data: {
    transactions: UtilityTransaction[];
    total: number;
    page: number;
    limit: number;
  };
}> => {
  const response = await api.get('/utilities/get-transactions', { params });
  const rawTransactions: UtilityTransactionApiResponse[] = Array.isArray(response.data)
    ? response.data
    : [];

  const getTypeString = (type: number | undefined): string => {
    switch (type) {
      case 1:
        return 'fund-transfer';
      case 6:
        return 'electricity-bill';
      default:
        return 'other';
    }
  };

  const transformedTransactions: UtilityTransaction[] = rawTransactions.map((tx) => {
    const serviceDetails: UtilityServiceDetails = {};
    if (tx.phone_number) serviceDetails.phoneNumber = tx.phone_number;
    if (tx.network) serviceDetails.network = tx.network;
    if (tx.package_id) serviceDetails.packageId = tx.package_id;
    if (tx.smart_card_number) serviceDetails.smartCardNumber = tx.smart_card_number;
    if (tx.meter_number) serviceDetails.meterNumber = tx.meter_number;
    if (tx.power_main_code) serviceDetails.powerToken = tx.power_main_code;

    return {
      id: tx.id?.toString() || '',
      type: getTypeString(tx.type),
      amount: tx.naira_amount || 0,
      status: tx.status || 'pending',
      serviceDetails,
      paymentMethod: tx.payment_method || 'wallet',
      createdAt: tx.date
        ? new Date(tx.date * 1000).toISOString()
        : new Date().toISOString(),
      reference: tx.request_id || tx.id?.toString() || '',
    };
  });

  // Apply filters
  let filteredTransactions = transformedTransactions;

  if (params?.type && params.type !== 'all') {
    filteredTransactions = filteredTransactions.filter((tx) => tx.type === params.type);
  }

  if (params?.status && params.status !== 'all') {
    filteredTransactions = filteredTransactions.filter(
      (tx) => tx.status.toLowerCase() === params.status?.toLowerCase()
    );
  }

  // Sort by date descending
  filteredTransactions = filteredTransactions.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Paginate
  const page = params?.page || 1;
  const limit = params?.limit || 50;
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: {
      transactions: paginatedTransactions,
      total: filteredTransactions.length,
      page,
      limit,
    },
  };
};

// Game wallet

export const getGameDepositAddress = async (): Promise<{
  address: string;
  network: string;
}> => {
  const response = await api.get('/game-deposit-address');
  return response.data;
};

export const submitGameWithdrawal = async (
  amount: number,
  destinationAddress: string
): Promise<{
  id: string;
  userId: string;
  usdAmount: number;
  walletAddress: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
}> => {
  const response = await api.post('/submit-game-withdrawal', {
    amount,
    destinationAddress,
  });
  return response.data;
};

// Electricity

export const verifyMeterNumber = async (data: {
  meterNumber: string;
  serviceId: string;
  serviceType: string;
}): Promise<{
  success: boolean;
  data: {
    customerName: string;
    customerAddress: string;
    meterNumber: string;
  };
}> => {
  const response = await api.post('/utilities/verify-meter-number', data);
  return response.data;
};

export const buyPower = async (data: {
  meterNumber: string;
  amountInNaira: number;
  serviceId: string;
  serviceType: string;
  currency: string;
  paymentMethod: string;
  phoneNumber: string;
}): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
  data?: {
    token?: string;
    units?: string;
  };
}> => {
  const response = await api.post('/utilities/buy-power', data);
  return response.data;
};

// TV Subscriptions

export const getTvProviders = async (): Promise<{
  success: boolean;
  data: Array<{
    serviceId: string;
    name: string;
  }>;
}> => {
  const response = await api.get('/utilities/tv-providers');
  return response.data;
};

export const getTvPackages = async (
  providerId: string
): Promise<{
  success: boolean;
  data: Array<{
    variationCode: string;
    name: string;
    amount: number;
    fixedPrice: string;
  }>;
}> => {
  const response = await api.get(`/utilities/tv-providers/${providerId}/bouquets`);
  const rawData = response.data;

  if (Array.isArray(rawData) && rawData.length > 0) {
    const transformedData = rawData.map((item: { variation_code?: string; name?: string; variation_amount?: string; fixedPrice?: string }) => ({
      variationCode: item.variation_code || '',
      name: item.name || '',
      amount: parseInt(item.variation_amount || '0', 10),
      fixedPrice: item.fixedPrice || '',
    }));

    return { success: true, data: transformedData };
  }

  return { success: false, data: [] };
};

export const verifySmartCardNumber = async (data: {
  cardNumber: string;
  serviceId: string;
}): Promise<{
  success: boolean;
  data: {
    customerName: string;
    cardNumber: string;
    currentPackage: string;
    dueDate?: string;
  };
}> => {
  const response = await api.post('/utilities/verify-smart-card-number', data);
  return response.data;
};

export const subscribeTv = async (data: {
  cardNumber: string;
  amountInNaira: number;
  serviceId: string;
  variationCode: string;
  phoneNumber: string;
  currency: string;
  paymentMethod: string;
}): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
}> => {
  const response = await api.post('/utilities/subscribe-tv', data);
  return response.data;
};
