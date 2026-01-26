import { useState, useCallback } from 'react';
import { Copy, Snowflake, ShieldOff, Clock, CalendarX, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SudoSecureDataView } from './SudoSecureDataView';
import type { VirtualCard } from '@/types/card';
import { CardStatus, CardType, CardProvider } from '@/types/card';

interface CardDisplayProps {
  card: VirtualCard;
  isFlipped?: boolean;
  onFlip?: () => void;
  showSensitiveData?: boolean;
  /** Card token for Sudo cards (used with Secure Proxy) */
  cardToken?: string;
  /** Show loading state on back face while fetching card details */
  isLoadingDetails?: boolean;
  className?: string;
}

// Helper functions
const isCardFrozen = (status: CardStatus): boolean => {
  return status === CardStatus.FROZEN || status === CardStatus.INACTIVE;
};

const isCardBlocked = (status: CardStatus): boolean => {
  return status === CardStatus.BLOCKED;
};

const isCardExpired = (status: CardStatus): boolean => {
  return status === CardStatus.EXPIRED;
};

const isCardPending = (status: CardStatus): boolean => {
  return status === CardStatus.PENDING;
};

const isCardTerminated = (status: CardStatus): boolean => {
  return status === CardStatus.TERMINATED;
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

interface StatusOverlay {
  show: boolean;
  icon: React.ReactNode;
  text: string;
  subtext: string;
  bgClass: string;
  borderClass: string;
}

const getStatusOverlay = (status: CardStatus): StatusOverlay | null => {
  if (isCardFrozen(status)) {
    return {
      show: true,
      icon: <Snowflake className="h-7 w-7 text-blue-300" />,
      text: 'FROZEN',
      subtext: 'All transactions blocked',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-300/50',
    };
  }
  if (isCardBlocked(status)) {
    return {
      show: true,
      icon: <ShieldOff className="h-7 w-7 text-red-300" />,
      text: 'BLOCKED',
      subtext: 'Card has been blocked',
      bgClass: 'bg-red-500/15',
      borderClass: 'border-red-300/50',
    };
  }
  if (isCardExpired(status)) {
    return {
      show: true,
      icon: <CalendarX className="h-7 w-7 text-gray-400" />,
      text: 'EXPIRED',
      subtext: 'Card has expired',
      bgClass: 'bg-gray-500/15',
      borderClass: 'border-gray-400/50',
    };
  }
  if (isCardPending(status)) {
    return {
      show: true,
      icon: <Clock className="h-7 w-7 text-yellow-300" />,
      text: 'PENDING',
      subtext: 'Card activation in progress',
      bgClass: 'bg-yellow-500/15',
      borderClass: 'border-yellow-300/50',
    };
  }
  if (isCardTerminated(status)) {
    return {
      show: true,
      icon: <ShieldOff className="h-7 w-7 text-gray-400" />,
      text: 'TERMINATED',
      subtext: 'Card has been terminated',
      bgClass: 'bg-gray-500/15',
      borderClass: 'border-gray-400/50',
    };
  }
  return null;
};

export function CardDisplay({
  card,
  isFlipped = false,
  onFlip,
  showSensitiveData = false,
  cardToken,
  isLoadingDetails = false,
  className,
}: CardDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const statusOverlay = getStatusOverlay(card.status);
  const lastFourDigits = card.cardNumber.slice(-4);
  const cardTypeText = card.type === CardType.VIRTUAL ? 'Virtual' : 'Physical';

  // Check if this is a Sudo card (should use Secure Proxy for sensitive data)
  const isSudoCard = card.provider === CardProvider.SUDO;
  const useSecureProxy = isSudoCard && cardToken && card.providerCardId;

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const formatCardNumber = (number: string) => {
    if (showSensitiveData && number !== '****') {
      return number.replace(/(.{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${lastFourDigits}`;
  };

  return (
    <div
      className={cn(
        'relative h-[240px] w-full max-w-[400px] cursor-pointer',
        className
      )}
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      {/* Card Container with 3D flip effect */}
      <div
        className="relative h-full w-full transition-transform duration-500 rounded-2xl"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d'
        }}
      >
        {/* Front Face */}
        <div
          className="virtual-card-face absolute inset-0 rounded-2xl p-5 overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Decorative patterns */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="card-logo-icon flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="card-logo-text text-xs font-bold">K</span>
              </div>
              <span className="card-logo-text text-base font-bold">KaviPay</span>
            </div>
            <span className="card-brand text-lg font-bold uppercase tracking-wider">
              {(card.brand || 'CARD').toUpperCase()}
            </span>
          </div>

          {/* Card Chip */}
          <div className="relative z-10 mt-4">
            <div className="h-9 w-12 rounded-md bg-amber-500/90 border border-amber-600/30" />
          </div>

          {/* Balance Section */}
          <div className="relative z-10 mt-4 flex flex-1 flex-col items-center justify-center">
            <span className="card-balance-label text-[11px] font-semibold uppercase tracking-wider">
              Available Balance
            </span>
            <span className="card-balance-amount mt-1 text-3xl font-bold">
              {getCurrencySymbol(card.currency)}
              {card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-auto flex items-end justify-between">
            <span className="card-last-four font-mono text-lg tracking-widest">
              •••• {lastFourDigits}
            </span>
            <span className="card-type-text text-[10px] font-semibold uppercase tracking-wider">
              {cardTypeText}
            </span>
          </div>

          {/* Status Overlay */}
          {statusOverlay && (
            <div className="virtual-card-status-overlay absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
              <div
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 px-8 py-4',
                  statusOverlay.bgClass,
                  statusOverlay.borderClass
                )}
              >
                <div className="mb-2 rounded-full bg-black/5 p-2">
                  {statusOverlay.icon}
                </div>
                <span className="status-text text-lg font-extrabold uppercase tracking-wider">
                  {statusOverlay.text}
                </span>
                <span className="status-subtext mt-1 text-sm font-medium">
                  {statusOverlay.subtext}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div
          className="virtual-card-face absolute inset-0 rounded-2xl p-5 overflow-hidden"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Decorative patterns */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="card-brand text-lg font-bold uppercase tracking-wider">
              {(card.brand || 'CARD').toUpperCase()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlip?.();
              }}
              className="card-logo-icon rounded-lg p-2 transition-colors"
            >
              {showSensitiveData ? (
                <EyeOff className="h-4 w-4 card-copy-btn" />
              ) : (
                <Eye className="h-4 w-4 card-copy-btn" />
              )}
            </button>
          </div>

          {/* Loading State on Back Face */}
          {isLoadingDetails && (
            <div className="virtual-card-face absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="card-detail-label mt-3 text-sm font-medium">
                Loading card details...
              </span>
            </div>
          )}

          {/* Card Details */}
          <div className="relative z-10 mt-4 space-y-3">
            {/* Card Number */}
            <div>
              <div className="flex items-center gap-2">
                <span className="card-detail-label text-[10px] font-semibold uppercase tracking-wider">
                  Card Number
                </span>
                {!useSecureProxy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(card.cardNumber, 'number');
                    }}
                    className="card-copy-btn rounded p-1 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
                {copied === 'number' && (
                  <span className="text-xs text-emerald-500">Copied!</span>
                )}
              </div>
              {useSecureProxy ? (
                <SudoSecureDataView
                  cardId={card.providerCardId!}
                  cardToken={cardToken!}
                  dataType="number"
                  textStyle="color: #ffffff; font-family: monospace; font-size: 16px; font-weight: 600; letter-spacing: 3px;"
                  className="mt-1"
                />
              ) : (
                <span className="card-detail-value mt-1 block font-mono text-base font-semibold tracking-wider">
                  {formatCardNumber(card.cardNumber)}
                </span>
              )}
            </div>

            {/* Expiry & CVV */}
            <div className="flex gap-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="card-detail-label text-[10px] font-semibold uppercase tracking-wider">
                    Valid Thru
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(card.expiryDate, 'expiry');
                    }}
                    className="card-copy-btn rounded p-1 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {copied === 'expiry' && (
                    <span className="text-xs text-emerald-500">Copied!</span>
                  )}
                </div>
                <span className="card-detail-value mt-1 block font-mono text-sm font-semibold">
                  {card.expiryDate}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="card-detail-label text-[10px] font-semibold uppercase tracking-wider">
                    CVV
                  </span>
                  {!useSecureProxy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(card.cvv, 'cvv');
                      }}
                      className="card-copy-btn rounded p-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                  {copied === 'cvv' && (
                    <span className="text-xs text-emerald-500">Copied!</span>
                  )}
                </div>
                {useSecureProxy ? (
                  <SudoSecureDataView
                    cardId={card.providerCardId!}
                    cardToken={cardToken!}
                    dataType="cvv2"
                    textStyle="color: #ffffff; font-family: monospace; font-size: 14px; font-weight: 600;"
                    className="mt-1"
                  />
                ) : (
                  <span className="card-detail-value mt-1 block font-mono text-sm font-semibold">
                    {showSensitiveData ? card.cvv : '***'}
                  </span>
                )}
              </div>
            </div>

            {/* Cardholder */}
            <div>
              <span className="card-detail-label text-[10px] font-semibold uppercase tracking-wider">
                Cardholder
              </span>
              <span className="card-detail-value mt-0.5 block text-sm font-bold uppercase tracking-wider">
                {card.cardholderName}
              </span>
            </div>
          </div>

          {/* Status Overlay */}
          {statusOverlay && (
            <div className="virtual-card-status-overlay absolute inset-0 z-20 flex items-center justify-center rounded-2xl">
              <div
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 px-8 py-4',
                  statusOverlay.bgClass,
                  statusOverlay.borderClass
                )}
              >
                <div className="mb-2 rounded-full bg-black/5 p-2">
                  {statusOverlay.icon}
                </div>
                <span className="status-text text-lg font-extrabold uppercase tracking-wider">
                  {statusOverlay.text}
                </span>
                <span className="status-subtext mt-1 text-sm font-medium">
                  {statusOverlay.subtext}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardDisplay;
