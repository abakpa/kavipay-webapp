import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useKYC } from '@/contexts/KYCContext';
import { TotalValueCard } from '@/components/dashboard/TotalValueCard';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';
import { CardsOverviewCard } from '@/components/dashboard/CardsOverviewCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { QuickLinksRow } from '@/components/dashboard/QuickLinksRow';
import { KYCStatusBanner } from '@/components/kyc/KYCStatusBanner';
import { getNairaExchangeRate } from '@/lib/api/deposit';
import { getWalletTransactions } from '@/lib/api/wallet';
import type { CardTransaction } from '@/types/card';
import type { WalletTransaction } from '@/types/wallet';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cards, transactions: transactionsMap } = useVirtualCards();
  const { kycStatus, loadKYCStatus } = useKYC();
  const [exchangeRate, setExchangeRate] = useState(1500); // Default fallback
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

  // Refresh KYC status when dashboard mounts to ensure we have the latest status
  useEffect(() => {
    loadKYCStatus();
  }, [loadKYCStatus]);

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rateData = await getNairaExchangeRate();
        if (rateData?.rate) {
          setExchangeRate(rateData.rate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Keep default fallback rate
      }
    };
    fetchExchangeRate();
  }, []);

  // Fetch wallet transactions on mount
  const fetchWalletTransactions = useCallback(async () => {
    try {
      const response = await getWalletTransactions({ limit: 10 });
      setWalletTransactions(response.transactions || []);
    } catch (error) {
      console.error('Failed to fetch wallet transactions:', error);
    }
  }, []);

  useEffect(() => {
    fetchWalletTransactions();
  }, [fetchWalletTransactions]);

  // Flatten transactions from all cards into a single array
  const allCardTransactions = useMemo((): CardTransaction[] => {
    return Object.values(transactionsMap).flat();
  }, [transactionsMap]);

  // Calculate active cards count
  const activeCardsCount = useMemo(() => {
    return cards.filter((card) => card.status === 'active').length;
  }, [cards]);

  // Calculate monthly spending from card transactions
  const monthlySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allCardTransactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear &&
          tx.amount < 0 // Only count spending (negative amounts)
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [allCardTransactions]);

  // Wallet balances from user context
  const dollarBalance = user?.dollarBalance ?? 0;
  const nairaBalance = user?.nairaBalance ?? 0;

  // Navigation handlers
  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleSend = () => {
    navigate('/send');
  };

  const handleSpend = () => {
    navigate('/utilities');
  };

  const handleAddCard = () => {
    if (kycStatus?.kycStatus !== 'verified') {
      navigate('/kyc');
    } else {
      navigate('/cards/create');
    }
  };

  const handleViewAllCards = () => {
    navigate('/cards');
  };

  const handleViewAllTransactions = () => {
    navigate('/transactions');
  };

  const handleTransactionPress = (transaction: WalletTransaction) => {
    // Navigate to transaction detail page (if implemented)
    navigate(`/transactions/${transaction.id}`);
  };

  // Quick links handlers
  const handleAirtime = () => {
    navigate('/airtime');
  };

  const handleData = () => {
    navigate('/data');
  };

  const handleElectricity = () => {
    navigate('/electricity');
  };

  const handleTv = () => {
    navigate('/tv');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your account</p>
      </div>

      {/* Total Balance Card */}
      <TotalValueCard
        dollarBalance={dollarBalance}
        nairaBalance={nairaBalance}
        exchangeRate={exchangeRate}
      />

      {/* KYC Status Banner */}
      <KYCStatusBanner />

      {/* Quick Action Buttons */}
      <QuickActionButtons onDeposit={handleDeposit} onSend={handleSend} onSpend={handleSpend} />

      {/* Cards Overview */}
      <CardsOverviewCard
        totalCards={activeCardsCount}
        monthlySpending={monthlySpending}
        onAddCard={handleAddCard}
        onViewAllCards={handleViewAllCards}
      />

      {/* Recent Activity - Now using wallet transactions */}
      <RecentActivityList
        transactions={walletTransactions}
        onViewAll={handleViewAllTransactions}
        onTransactionPress={handleTransactionPress}
      />

      {/* Quick Links */}
      <QuickLinksRow
        onAirtimePress={handleAirtime}
        onDataPress={handleData}
        onElectricityPress={handleElectricity}
        onTvPress={handleTv}
      />
    </div>
  );
}

export default Dashboard;
