import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Key,
  Sliders,
  Lock,
  Globe,
  Edit3,
  MapPin,
  Trash2,
  ChevronRight,
  AlertCircle,
  Loader2,
  Snowflake,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVirtualCards } from '@/contexts/VirtualCardContext';
import { CardStatus } from '@/types/card';
import { cn } from '@/lib/utils';

// Import modals (to be created)
import { ChangePinModal } from '@/components/cards/ChangePinModal';
import { SpendingControlsModal } from '@/components/cards/SpendingControlsModal';
import { BillingAddressModal } from '@/components/cards/BillingAddressModal';
import { DeleteCardModal } from '@/components/cards/DeleteCardModal';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dangerous?: boolean;
  onClick: () => void;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

export function CardSettings() {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const {
    cards,
    selectedCard,
    selectCard,
    freezeCard,
    unfreezeCard,
    isLoading,
    error,
  } = useVirtualCards();

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find and select the card from URL params
  useEffect(() => {
    if (cardId && cards.length > 0) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        selectCard(card);
      }
    }
  }, [cardId, cards, selectCard]);

  const currentCard = selectedCard;

  const handleBack = () => {
    navigate('/cards');
  };

  const handleFreezeUnfreeze = async () => {
    if (!currentCard) return;

    const isFrozen =
      currentCard.status === CardStatus.FROZEN ||
      currentCard.status === CardStatus.INACTIVE;

    setActionLoading(isFrozen ? 'unfreeze' : 'freeze');
    try {
      if (isFrozen) {
        await unfreezeCard(currentCard.id);
      } else {
        await freezeCard(currentCard.id);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const isFrozen =
    currentCard?.status === CardStatus.FROZEN ||
    currentCard?.status === CardStatus.INACTIVE;

  const isCardActive = currentCard?.status === CardStatus.ACTIVE;

  // Check card brand for PIN support
  const cardBrand = currentCard?.brand?.toLowerCase();
  const isVirtualDollarCard =
    (cardBrand === 'visa' || cardBrand === 'mastercard') &&
    currentCard?.type === 'virtual';

  const settingSections: SettingSection[] = [
    {
      id: 'security',
      title: 'Security & Controls',
      items: [
        {
          id: 'pin-management',
          title: 'PIN Management',
          description: isVirtualDollarCard
            ? 'Virtual cards don\'t require PIN'
            : 'Change or manage your card PIN',
          icon: Key,
          color: 'text-blue-500 bg-blue-500/10',
          onClick: () => !isVirtualDollarCard && setShowPinModal(true),
        },
        {
          id: 'spending-controls',
          title: 'Spending Controls',
          description: 'Manage transaction channels and spending limits',
          icon: Sliders,
          color: 'text-purple-500 bg-purple-500/10',
          onClick: () => setShowSpendingModal(true),
        },
        {
          id: 'freeze-card',
          title: isFrozen ? 'Unfreeze Card' : 'Freeze Card',
          description: isFrozen
            ? 'Enable card transactions'
            : 'Temporarily disable all transactions',
          icon: isFrozen ? Globe : Lock,
          color: isFrozen
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'text-orange-500 bg-orange-500/10',
          onClick: handleFreezeUnfreeze,
        },
      ],
    },
    {
      id: 'management',
      title: 'Card Management',
      items: [
        {
          id: 'card-label',
          title: 'Card Label',
          description: 'Change the display name for this card',
          icon: Edit3,
          color: 'text-kaviBlue bg-kaviBlue/10',
          onClick: () => {
            // TODO: Implement card label editing
          },
        },
        {
          id: 'billing-address',
          title: 'Billing Address',
          description: 'Update your billing address information',
          icon: MapPin,
          color: 'text-purple-500 bg-purple-500/10',
          onClick: () => setShowBillingModal(true),
        },
      ],
    },
    {
      id: 'danger',
      title: 'Danger Zone',
      items: [
        {
          id: 'delete-card',
          title: 'Delete Card',
          description: 'Permanently remove this card from your account',
          icon: Trash2,
          color: 'text-destructive bg-destructive/10',
          dangerous: true,
          onClick: () => setShowDeleteModal(true),
        },
      ],
    },
  ];

  // Loading state
  if (isLoading && !currentCard) {
    return (
      <div className="mx-auto max-w-2xl">
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
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">Card Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The card you're looking for doesn't exist.
          </p>
          <Button className="mt-4" onClick={handleBack}>
            Go to Cards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </Button>

        <h1 className="text-2xl font-bold text-foreground">Card Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your card settings and controls
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Card Status */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-kaviBlue/10">
              <CreditCard className="h-6 w-6 text-kaviBlue" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Card Status</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isCardActive ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCardActive ? 'text-emerald-500' : 'text-amber-500'
                  )}
                >
                  {currentCard.status.charAt(0).toUpperCase() + currentCard.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFreezeUnfreeze}
            disabled={
              actionLoading !== null ||
              currentCard.status === CardStatus.BLOCKED ||
              currentCard.status === CardStatus.EXPIRED ||
              currentCard.status === CardStatus.TERMINATED
            }
            className="gap-2"
          >
            {actionLoading === 'freeze' || actionLoading === 'unfreeze' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFrozen ? (
              <Play className="h-4 w-4" />
            ) : (
              <Snowflake className="h-4 w-4" />
            )}
            {isFrozen ? 'Unfreeze' : 'Freeze'}
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {isCardActive
            ? 'Your card is active and ready to use for transactions.'
            : 'Your card is frozen. All transactions are blocked.'}
        </p>

        {/* Card Info */}
        <div className="mt-4 rounded-xl bg-accent/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm text-muted-foreground">
                •••• •••• •••• {currentCard.cardNumber.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">{currentCard.cardholderName}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                ${currentCard.balance.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">{currentCard.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.id}>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isDisabled =
                  item.id === 'pin-management' && isVirtualDollarCard;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    disabled={isDisabled || actionLoading !== null}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
                      item.dangerous
                        ? 'border-destructive/30 hover:bg-destructive/5'
                        : 'border-border hover:bg-accent/50',
                      isDisabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                        item.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.dangerous && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {currentCard && (
        <>
          <ChangePinModal
            isOpen={showPinModal}
            onClose={() => setShowPinModal(false)}
            card={currentCard}
          />

          <SpendingControlsModal
            isOpen={showSpendingModal}
            onClose={() => setShowSpendingModal(false)}
            card={currentCard}
          />

          <BillingAddressModal
            isOpen={showBillingModal}
            onClose={() => setShowBillingModal(false)}
            card={currentCard}
          />

          <DeleteCardModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            card={currentCard}
            onDeleted={handleBack}
          />
        </>
      )}
    </div>
  );
}

export default CardSettings;
