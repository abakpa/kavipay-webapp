import { api } from './index';
import type {
  WalletTransaction,
  WalletTransactionsResponse,
  GetWalletTransactionsParams,
} from '@/types/wallet';

/**
 * Fetch wallet transactions with optional filters
 */
export async function getWalletTransactions(
  params: GetWalletTransactionsParams = {}
): Promise<WalletTransactionsResponse> {
  const response = await api.get<WalletTransactionsResponse>('/transactions', { params });
  return response.data;
}

/**
 * Fetch a single wallet transaction by ID
 */
export async function getWalletTransactionById(id: string): Promise<WalletTransaction> {
  const response = await api.get<WalletTransaction>(`/transactions/${id}`);
  return response.data;
}
