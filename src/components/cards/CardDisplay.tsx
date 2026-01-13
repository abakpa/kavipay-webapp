import { useState, useCallback } from 'react';
import { Copy, Snowflake, ShieldOff, Clock, CalendarX, Eye, EyeOff } from 'lucide-react';
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
        'relative h-[220px] w-full max-w-[400px] cursor-pointer perspective-1000',
        className
      )}
      onClick={onFlip}
    >
      {/* Card Container with 3D flip effect */}
      <div
        className="relative h-full w-full transition-transform duration-500 transform-style-3d"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front Face */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-5 backface-hidden',
            'bg-gradient-to-br from-slate-800 to-slate-900',
            'shadow-xl shadow-black/20',
            'overflow-hidden'
          )}
        >
          {/* Decorative patterns */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                <span className="text-xs font-bold text-white">K</span>
              </div>
              <span className="text-base font-bold text-slate-200">KaviPay</span>
            </div>
            <span className="text-lg font-bold uppercase tracking-wider text-slate-200">
              {(card.brand || 'CARD').toUpperCase()}
            </span>
          </div>

          {/* Card Chip */}
          <div className="relative z-10 mt-4">
            <div className="h-9 w-12 rounded-md bg-amber-500/90 border border-amber-600/30" />
          </div>

          {/* Balance Section */}
          <div className="relative z-10 mt-4 flex flex-1 flex-col items-center justify-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Available Balance
            </span>
            <span className="mt-1 text-3xl font-bold text-white">
              {getCurrencySymbol(card.currency)}
              {card.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-auto flex items-end justify-between">
            <span className="font-mono text-lg tracking-widest text-slate-300">
              •••• {lastFourDigits}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {cardTypeText}
            </span>
          </div>

          {/* Status Overlay */}
          {statusOverlay && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-900/95">
              <div
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 px-8 py-4',
                  statusOverlay.bgClass,
                  statusOverlay.borderClass
                )}
              >
                <div className="mb-2 rounded-full bg-white/10 p-2">
                  {statusOverlay.icon}
                </div>
                <span className="text-lg font-extrabold uppercase tracking-wider text-white">
                  {statusOverlay.text}
                </span>
                <span className="mt-1 text-sm font-medium text-white/90">
                  {statusOverlay.subtext}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-5 backface-hidden',
            'bg-gradient-to-br from-slate-800 to-slate-900',
            'shadow-xl shadow-black/20',
            'overflow-hidden'
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Decorative patterns */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-lg font-bold uppercase tracking-wider text-slate-200">
              {(card.brand || 'CARD').toUpperCase()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFlip?.();
              }}
              className="rounded-lg bg-blue-500/20 p-2 transition-colors hover:bg-blue-500/30"
            >
              {showSensitiveData ? (
                <EyeOff className="h-4 w-4 text-slate-300" />
              ) : (
                <Eye className="h-4 w-4 text-slate-300" />
              )}
            </button>
          </div>

          {/* Card Details */}
          <div className="relative z-10 mt-6 space-y-4">
            {/* Card Number */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Card Number
                </span>
                {!useSecureProxy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(card.cardNumber, 'number');
                    }}
                    className="rounded p-1 transition-colors hover:bg-white/10"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                )}
                {copied === 'number' && (
                  <span className="text-xs text-emerald-400">Copied!</span>
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
                <span className="mt-1 block font-mono text-base font-semibold tracking-wider text-white">
                  {formatCardNumber(card.cardNumber)}
                </span>
              )}
            </div>

            {/* Expiry & CVV */}
            <div className="flex gap-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Valid Thru
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(card.expiryDate, 'expiry');
                    }}
                    className="rounded p-1 transition-colors hover:bg-white/10"
                  >
                    <Copy className="h-3 w-3 text-slate-400" />
                  </button>
                  {copied === 'expiry' && (
                    <span className="text-xs text-emerald-400">Copied!</span>
                  )}
                </div>
                <span className="mt-1 block font-mono text-sm font-semibold text-white">
                  {card.expiryDate}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    CVV
                  </span>
                  {!useSecureProxy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(card.cvv, 'cvv');
                      }}
                      className="rounded p-1 transition-colors hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3 text-slate-400" />
                    </button>
                  )}
                  {copied === 'cvv' && (
                    <span className="text-xs text-emerald-400">Copied!</span>
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
                  <span className="mt-1 block font-mono text-sm font-semibold text-white">
                    {showSensitiveData ? card.cvv : '***'}
                  </span>
                )}
              </div>
            </div>

            {/* Cardholder */}
            <div className="pt-2">
              <span className="block text-sm font-bold uppercase tracking-wider text-white">
                {card.cardholderName}
              </span>
            </div>
          </div>

          {/* Status Overlay */}
          {statusOverlay && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-slate-900/95">
              <div
                className={cn(
                  'flex flex-col items-center rounded-xl border-2 px-8 py-4',
                  statusOverlay.bgClass,
                  statusOverlay.borderClass
                )}
              >
                <div className="mb-2 rounded-full bg-white/10 p-2">
                  {statusOverlay.icon}
                </div>
                <span className="text-lg font-extrabold uppercase tracking-wider text-white">
                  {statusOverlay.text}
                </span>
                <span className="mt-1 text-sm font-medium text-white/90">
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
