import { useEffect, useMemo } from 'react';
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
import type { CardTransaction } from '@/types/card';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cards, transactions: transactionsMap } = useVirtualCards();
  const { kycStatus, loadKYCStatus } = useKYC();

  // Refresh KYC status when dashboard mounts to ensure we have the latest status
  useEffect(() => {
    loadKYCStatus();
  }, [loadKYCStatus]);

  // Flatten transactions from all cards into a single array
  const allTransactions = useMemo((): CardTransaction[] => {
    return Object.values(transactionsMap).flat();
  }, [transactionsMap]);

  // Calculate active cards count
  const activeCardsCount = useMemo(() => {
    return cards.filter((card) => card.status === 'active').length;
  }, [cards]);

  // Calculate monthly spending
  const monthlySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allTransactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear &&
          tx.amount < 0 // Only count spending (negative amounts)
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [allTransactions]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...allTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [allTransactions]);

  // Wallet balance from user context
  const walletBalance = user?.gameWalletBalance ?? 0;

  // Navigation handlers
  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleSend = () => {
    navigate('/send');
  };

  const handleEarn = () => {
    navigate('/referral');
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
    navigate('/cards');
  };

  const handleTransactionPress = (transaction: CardTransaction) => {
    // Navigate to card transactions page
    if (transaction.cardId) {
      navigate(`/cards/${transaction.cardId}/transactions`);
    } else {
      navigate('/cards');
    }
  };

  // Quick links handlers (placeholder - these features may not be implemented yet)
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
      <TotalValueCard balance={walletBalance} currency="USD" />

      {/* KYC Status Banner */}
      <KYCStatusBanner />

      {/* Quick Action Buttons */}
      <QuickActionButtons onDeposit={handleDeposit} onSend={handleSend} onEarn={handleEarn} />

      {/* Cards Overview */}
      <CardsOverviewCard
        totalCards={activeCardsCount}
        monthlySpending={monthlySpending}
        onAddCard={handleAddCard}
        onViewAllCards={handleViewAllCards}
      />

      {/* Recent Activity */}
      <RecentActivityList
        transactions={recentTransactions}
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
