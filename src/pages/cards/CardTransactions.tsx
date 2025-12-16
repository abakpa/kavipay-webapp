import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TransactionList } from '@/components/cards/TransactionList';
import { TransactionDetail } from '@/components/cards/TransactionDetail';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import type { CardTransaction } from '@/types/card';
import { cn } from '@/lib/utils';

export function CardTransactions() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const {
    cards,
    selectedCard,
    selectCard,
    transactions,
    loadTransactions,
    isLoadingTransactions,
    error,
  } = useVirtualCards();

  const [selectedTransaction, setSelectedTransaction] = useState<CardTransaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Find and select the card from URL params
  useEffect(() => {
    if (cardId && cards.length > 0) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        selectCard(card);
      }
    }
  }, [cardId, cards, selectCard]);

  // Load transactions when card is selected
  useEffect(() => {
    if (selectedCard && cardId) {
      loadTransactions(cardId).catch(console.error);
    }
  }, [selectedCard, cardId, loadTransactions]);

  const currentCard = selectedCard;
  const cardTransactions = cardId ? transactions[cardId] || [] : [];

  const handleBack = () => {
    navigate('/cards');
  };

  const handleRefresh = async () => {
    if (!cardId) return;
    setIsRefreshing(true);
    try {
      await loadTransactions(cardId);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTransactionClick = (transaction: CardTransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  // Loading state
  if (!currentCard && cards.length > 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
        </div>
      </div>
    );
  }

  // No card found
  if (!currentCard) {
    return (
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Card Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The card you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" onClick={handleBack}>
            Go to Cards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cards
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingTransactions}
            className="gap-2"
          >
            <RefreshCw
              className={cn('h-4 w-4', (isRefreshing || isLoadingTransactions) && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all transactions for your virtual card
        </p>
      </div>

      {/* Card Info */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-kaviBlue/10">
            <CreditCard className="h-6 w-6 text-kaviBlue" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{currentCard.cardholderName}</p>
            <p className="font-mono text-sm text-muted-foreground">
              •••• •••• •••• {currentCard.cardNumber.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold text-foreground">
              ${currentCard.balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoadingTransactions && cardTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-kaviBlue" />
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      ) : (
        /* Transaction List */
        <TransactionList
          transactions={cardTransactions}
          onTransactionClick={handleTransactionClick}
          showFilters={true}
          showSummary={true}
          emptyMessage="No transactions yet"
        />
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

export default CardTransactions;
