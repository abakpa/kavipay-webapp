import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Snowflake,
  Play,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { useAuth } from '@/contexts/AuthContext';
import { CardList, BVNInputModal, SpendingAnalytics } from '@/components/cards';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { CardStatus } from '@/types/card';

export function CardDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cards,
    selectedCard,
    selectCard,
    isLoading,
    error,
    clearError,
    pendingPreOrders,
    freezeCard,
    unfreezeCard,
    loadCards,
    loadPreOrders,
    loadTransactions,
    transactions,
    isLoadingTransactions,
    processPreOrder,
  } = useVirtualCards();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isProcessingPreOrder, setIsProcessingPreOrder] = useState(false);
  const [showBvnModal, setShowBvnModal] = useState(false);
  const [pendingPreOrderId, setPendingPreOrderId] = useState<string | null>(null);

  // Check if user is Nigerian (requires BVN for card creation)
  const isNigerian = user?.kyc_country?.code?.toUpperCase() === 'NG';

  // Track if we've already shown the modal for this error to prevent loops
  const hasShownModalForError = useRef(false);

  // Watch for BVN-related errors and show modal automatically
  useEffect(() => {
    if (error && !hasShownModalForError.current) {
      const errorLower = error.toLowerCase();
      if (errorLower.includes('bvn') && errorLower.includes('required')) {
        hasShownModalForError.current = true;
        clearError();
        setShowBvnModal(true);
      }
    }
    // Reset the flag when error is cleared
    if (!error) {
      hasShownModalForError.current = false;
    }
  }, [error, clearError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadCards(true);
      if (selectedCard) {
        await loadTransactions(selectedCard.id);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateCard = () => {
    navigate('/cards/create');
  };

  const handleProcessPreOrder = async (preOrderId: string, bvn?: string) => {
    // Store the preOrderId for potential BVN modal use
    setPendingPreOrderId(preOrderId);

    // For Nigerian users without BVN provided, show BVN modal first
    if (isNigerian && !bvn) {
      setShowBvnModal(true);
      return;
    }

    setIsProcessingPreOrder(true);
    try {
      const result = await processPreOrder(preOrderId, bvn);
      console.log('[CardDashboard] processPreOrder result:', result);

      // Refresh both cards and pre-orders after successful processing
      await Promise.all([loadCards(true), loadPreOrders()]);

      setShowBvnModal(false);
      setPendingPreOrderId(null);
    } catch (err) {
      console.error('Failed to process pre-order:', err);
      // Error will be caught by useEffect and modal shown if BVN required
    } finally {
      setIsProcessingPreOrder(false);
    }
  };

  // Handle BVN submission from modal
  const handleBvnSubmit = async (bvn: string) => {
    if (!pendingPreOrderId) {
      // If no pending preOrderId, use the first kyc_approved pre-order
      const kycApprovedOrder = pendingPreOrders.find(p => p.status === 'kyc_approved');
      if (kycApprovedOrder) {
        setPendingPreOrderId(kycApprovedOrder.id);
        await handleProcessPreOrder(kycApprovedOrder.id, bvn);
      }
    } else {
      await handleProcessPreOrder(pendingPreOrderId, bvn);
    }
  };

  const handleFreezeUnfreeze = async () => {
    if (!selectedCard) return;

    const isFrozen =
      selectedCard.status === CardStatus.FROZEN ||
      selectedCard.status === CardStatus.INACTIVE;

    setActionLoading(isFrozen ? 'unfreeze' : 'freeze');
    try {
      if (isFrozen) {
        await unfreezeCard(selectedCard.id);
      } else {
        await freezeCard(selectedCard.id);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleTopup = () => {
    if (selectedCard) {
      navigate(`/cards/${selectedCard.id}/topup`);
    }
  };

  const handleWithdraw = () => {
    if (selectedCard) {
      navigate(`/cards/${selectedCard.id}/withdraw`);
    }
  };

  const handleSettings = () => {
    if (selectedCard) {
      navigate(`/cards/${selectedCard.id}/settings`);
    }
  };

  const handleViewTransactions = () => {
    if (selectedCard) {
      navigate(`/cards/${selectedCard.id}/transactions`);
    }
  };

  // Load transactions when card is selected
  const handleSelectCard = async (card: typeof selectedCard) => {
    if (card) {
      selectCard(card);
      await loadTransactions(card.id);
    }
  };

  const selectedCardTransactions = selectedCard
    ? transactions[selectedCard.id] || []
    : [];

  const isFrozen =
    selectedCard?.status === CardStatus.FROZEN ||
    selectedCard?.status === CardStatus.INACTIVE;

  const isCardActive = selectedCard?.status === CardStatus.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Virtual Cards</h1>
          <p className="text-sm text-muted-foreground">
            Manage your virtual cards and transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateCard} className="gap-2">
            <Plus className="h-4 w-4" />
            New Card
          </Button>
        </div>
      </div>

      {/* Error Banner - hide if it's a BVN error since we show modal instead */}
      {error && !error.toLowerCase().includes('bvn') && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* BVN Input Modal */}
      <BVNInputModal
        isOpen={showBvnModal}
        onClose={() => {
          setShowBvnModal(false);
          setPendingPreOrderId(null);
          clearError();
        }}
        onSubmit={handleBvnSubmit}
        isLoading={isProcessingPreOrder}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card Display Section */}
        <div className="lg:col-span-2">
          <CardList
            cards={cards}
            selectedCard={selectedCard}
            onSelectCard={handleSelectCard}
            isLoading={isLoading || isProcessingPreOrder}
            hasPendingPreOrders={pendingPreOrders.length > 0}
            pendingPreOrders={pendingPreOrders}
            onProcessCard={handleProcessPreOrder}
            onCreateCard={handleCreateCard}
          />

          {/* Quick Actions */}
          {selectedCard && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Button
                variant="outline"
                className="flex-col gap-1 py-4"
                onClick={handleTopup}
                disabled={!isCardActive}
              >
                <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
                <span className="text-xs">Top Up</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col gap-1 py-4"
                onClick={handleWithdraw}
                disabled={!isCardActive}
              >
                <ArrowUpRight className="h-5 w-5 text-orange-500" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <Button
                variant="outline"
                className="flex-col gap-1 py-4"
                onClick={handleFreezeUnfreeze}
                disabled={
                  actionLoading !== null ||
                  selectedCard.status === CardStatus.BLOCKED ||
                  selectedCard.status === CardStatus.EXPIRED ||
                  selectedCard.status === CardStatus.TERMINATED
                }
              >
                {isFrozen ? (
                  <>
                    <Play
                      className={cn(
                        'h-5 w-5 text-emerald-500',
                        actionLoading === 'unfreeze' && 'animate-pulse'
                      )}
                    />
                    <span className="text-xs">Unfreeze</span>
                  </>
                ) : (
                  <>
                    <Snowflake
                      className={cn(
                        'h-5 w-5 text-blue-500',
                        actionLoading === 'freeze' && 'animate-pulse'
                      )}
                    />
                    <span className="text-xs">Freeze</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-col gap-1 py-4"
                onClick={handleSettings}
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          )}

          {/* Spending Analytics */}
          {selectedCard && (
            <SpendingAnalytics
              transactions={selectedCardTransactions}
              className="mt-4"
            />
          )}
        </div>

        {/* Transactions Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              {selectedCard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewTransactions}
                  className="gap-1 text-xs"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedCard ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Select a card to view transactions
                </p>
              ) : isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : selectedCardTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCardTransactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-accent/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full',
                            tx.amount >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                          )}
                        >
                          {tx.amount >= 0 ? (
                            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {tx.merchantName || tx.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          tx.amount >= 0 ? 'text-emerald-500' : 'text-foreground'
                        )}
                      >
                        {tx.amount >= 0 ? '+' : ''}
                        {tx.currency === 'NGN' ? '₦' : '$'}
                        {Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Pre-Orders */}
          {pendingPreOrders.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingPreOrders.map((preOrder) => {
                    const isKycApproved = preOrder.status === 'kyc_approved';
                    const isProcessing = preOrder.status === 'processing' || preOrder.status === 'pending_sync';

                    return (
                      <div
                        key={preOrder.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3',
                          isKycApproved
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-amber-500/30 bg-amber-500/10'
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {preOrder.brand.toUpperCase()} Card
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {preOrder.currency} • {preOrder.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                        {isKycApproved ? (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPreOrder(preOrder.id)}
                            disabled={isProcessingPreOrder}
                            className="h-8 px-3 text-xs"
                          >
                            {isProcessingPreOrder ? 'Processing...' : 'Get Card'}
                          </Button>
                        ) : isProcessing ? (
                          <div className="flex items-center gap-2 text-xs text-amber-500">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
