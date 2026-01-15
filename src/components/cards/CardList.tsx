import { useState } from 'react';
import { ChevronDown, CreditCard, Check, Snowflake, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDisplay } from './CardDisplay';
import { CardEmptyState } from './CardEmptyState';
import { generateCardToken } from '@/lib/api/cards';
import type { VirtualCard, CardPreOrder } from '@/types/card';
import { CardStatus, CardProvider } from '@/types/card';

interface CardListProps {
  cards: VirtualCard[];
  selectedCard: VirtualCard | null;
  onSelectCard: (card: VirtualCard) => void;
  isLoading?: boolean;
  hasPendingPreOrders?: boolean;
  pendingPreOrders?: CardPreOrder[];
  onProcessCard?: (preOrderId: string, bvn?: string) => Promise<void>;
  onCreateCard?: () => void;
  className?: string;
}

// Helper functions
const getStatusColor = (status: CardStatus): string => {
  switch (status) {
    case CardStatus.ACTIVE:
      return 'text-emerald-500';
    case CardStatus.FROZEN:
    case CardStatus.INACTIVE:
      return 'text-blue-500';
    case CardStatus.BLOCKED:
      return 'text-red-500';
    case CardStatus.EXPIRED:
    case CardStatus.TERMINATED:
      return 'text-gray-500';
    case CardStatus.PENDING:
      return 'text-amber-500';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusText = (status: CardStatus): string => {
  switch (status) {
    case CardStatus.ACTIVE:
      return 'Active';
    case CardStatus.FROZEN:
    case CardStatus.INACTIVE:
      return 'Frozen';
    case CardStatus.BLOCKED:
      return 'Blocked';
    case CardStatus.EXPIRED:
      return 'Expired';
    case CardStatus.TERMINATED:
      return 'Terminated';
    case CardStatus.PENDING:
      return 'Pending';
    default:
      return status;
  }
};

const getStatusIcon = (status: CardStatus) => {
  switch (status) {
    case CardStatus.FROZEN:
    case CardStatus.INACTIVE:
      return <Snowflake className="h-3 w-3" />;
    case CardStatus.ACTIVE:
      return <Play className="h-3 w-3" />;
    default:
      return null;
  }
};

const formatCardNumber = (cardNumber: string): string => {
  if (cardNumber === '****') {
    return '•••• ••••';
  }
  return `•••• ${cardNumber.slice(-4)}`;
};

const getCardDisplayName = (card: VirtualCard): string => {
  if (card.label && card.label !== 'undefined' && !card.label.startsWith('undefined')) {
    return card.label;
  }
  const cardType = card.type ? card.type.toUpperCase() : 'VIRTUAL';
  const lastFour = card.cardNumber ? card.cardNumber.slice(-4) : '';
  return lastFour ? `${cardType} •••• ${lastFour}` : `${cardType} Card`;
};

const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case 'USD':
      return '$';
    case 'NGN':
      return '₦';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currency;
  }
};

export function CardList({
  cards,
  selectedCard,
  onSelectCard,
  isLoading = false,
  hasPendingPreOrders = false,
  pendingPreOrders = [],
  onProcessCard,
  onCreateCard,
  className,
}: CardListProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [isRevealingCard, setIsRevealingCard] = useState(false);

  const handleFlip = async () => {
    if (!isFlipped && selectedCard) {
      // Flipping to back - fetch card token for Sudo Secure Proxy
      setIsFlipped(true);
      setIsRevealingCard(true);
      try {
        // Check if this is a Sudo card - need to fetch secure token
        const isSudoCard = selectedCard.provider === CardProvider.SUDO;

        if (isSudoCard) {
          console.log('[CardList] Fetching card token for Sudo card:', selectedCard.id);
          const token = await generateCardToken(selectedCard.id);
          console.log('[CardList] Card token received:', token ? 'yes' : 'no');
          setCardToken(token);
        }

        setShowSensitiveData(true);
      } catch (error) {
        console.error('[CardList] Failed to get card token:', error);
        // Still show the back but sensitive data will show placeholder
        setShowSensitiveData(false);
      } finally {
        setIsRevealingCard(false);
      }
    } else {
      // Flipping to front - hide sensitive data
      setIsFlipped(false);
      setShowSensitiveData(false);
      setCardToken(null);
      setIsRevealingCard(false);
    }
  };

  const handleSelectCard = (card: VirtualCard) => {
    onSelectCard(card);
    setSelectorOpen(false);
    setIsFlipped(false);
    setShowSensitiveData(false);
    setCardToken(null);
    setIsRevealingCard(false);
  };

  // Empty state
  if (!isLoading && cards.length === 0) {
    return (
      <CardEmptyState
        onCreateCard={onCreateCard}
        isLoading={isLoading}
        hasPendingPreOrders={hasPendingPreOrders}
        pendingPreOrders={pendingPreOrders}
        onProcessCard={onProcessCard}
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Card Selector (only show if multiple cards) */}
      {cards.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors',
              'hover:bg-accent/50',
              selectorOpen && 'ring-2 ring-kaviBlue'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kaviBlue">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {selectedCard ? getCardDisplayName(selectedCard) : 'Select Card'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCard ? formatCardNumber(selectedCard.cardNumber) : '•••• ••••'}
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                selectorOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {selectorOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-card p-2 shadow-lg">
              {cards.map((card) => {
                const isActive = selectedCard?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                      isActive
                        ? 'bg-kaviBlue/10 ring-1 ring-kaviBlue'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        isActive ? 'bg-kaviBlue' : 'bg-kaviBlue/20'
                      )}
                    >
                      <CreditCard
                        className={cn('h-5 w-5', isActive ? 'text-white' : 'text-kaviBlue')}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {getCardDisplayName(card)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCardNumber(card.cardNumber)}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 flex items-center gap-1 text-xs',
                          getStatusColor(card.status)
                        )}
                      >
                        {getStatusIcon(card.status)}
                        <span>{getStatusText(card.status)}</span>
                        <span className="text-muted-foreground">
                          {' '}
                          • {getCurrencySymbol(card.currency)}
                          {card.balance.toFixed(2)}
                        </span>
                      </p>
                    </div>
                    {isActive && <Check className="h-5 w-5 text-kaviBlue" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Card Display */}
      {selectedCard && (
        <div className="relative flex justify-center rounded-2xl">
          <CardDisplay
            card={selectedCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            showSensitiveData={showSensitiveData}
            cardToken={cardToken || undefined}
            isLoadingDetails={isRevealingCard}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <CardEmptyState isLoading={true} className="min-h-[220px]" />
      )}
    </div>
  );
}

export default CardList;
