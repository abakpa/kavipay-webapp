import { Eye, EyeOff, Snowflake, Settings, ArrowBigUp, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VirtualCard } from '@/types/card';
import { CardStatus } from '@/types/card';

interface CardActionsProps {
  card: VirtualCard;
  showSensitiveData: boolean;
  isFreezingCard: boolean;
  isRevealingCard?: boolean;
  isDeletingCard?: boolean;
  onToggleVisibility: () => void;
  onFreezeCard: () => void;
  onDeleteCard?: () => void;
  onNavigateToSettings: () => void;
  onNavigateToTopup: () => void;
}

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  icon: React.ReactNode;
  loadingIcon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'destructive';
  className?: string;
}

function ActionButton({
  onClick,
  disabled,
  isLoading,
  icon,
  loadingIcon,
  variant = 'default',
  className,
}: ActionButtonProps) {
  const variantStyles = {
    default: 'bg-border hover:bg-border/80 text-foreground',
    primary: 'bg-kaviBlue hover:bg-kaviBlue/90 text-white',
    destructive: 'bg-red-500 hover:bg-red-500/90 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-[60px] w-[60px] items-center justify-center rounded-2xl transition-all',
        'shadow-[0_4px_8px_rgba(77,166,255,0.15)]',
        variantStyles[variant],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (loadingIcon || <Loader2 className="h-5 w-5 animate-spin" />) : icon}
    </button>
  );
}

export function CardActions({
  card,
  showSensitiveData,
  isFreezingCard,
  isRevealingCard = false,
  isDeletingCard = false,
  onToggleVisibility,
  onFreezeCard,
  onDeleteCard,
  onNavigateToSettings,
  onNavigateToTopup,
}: CardActionsProps) {
  const isCardCurrentlyFrozen =
    card.status === CardStatus.FROZEN || card.status === CardStatus.INACTIVE;
  const isOperationInProgress = isFreezingCard || isDeletingCard || isRevealingCard;

  // Frozen card actions - only show unfreeze and delete
  if (isCardCurrentlyFrozen) {
    return (
      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center justify-center gap-10">
          {/* Unfreeze Button */}
          <div className="flex flex-col items-center">
            <ActionButton
              onClick={onFreezeCard}
              disabled={isOperationInProgress}
              isLoading={isFreezingCard}
              icon={<Snowflake className="h-5 w-5" />}
              variant="primary"
            />
            <span className="mt-2 text-[13px] font-semibold text-foreground">
              {isFreezingCard ? 'Processing...' : 'Unfreeze'}
            </span>
          </div>

          {/* Delete Button */}
          {onDeleteCard && (
            <div className="flex flex-col items-center">
              <ActionButton
                onClick={onDeleteCard}
                disabled={isOperationInProgress}
                isLoading={isDeletingCard}
                icon={<Trash2 className="h-5 w-5" />}
                variant="destructive"
              />
              <span className="mt-2 text-[13px] font-semibold text-red-500">
                {isDeletingCard ? 'Deleting...' : 'Delete'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active card actions - show all buttons
  return (
    <div className="mt-4">
      {/* Action Buttons Row */}
      <div className="flex justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        <ActionButton
          onClick={onToggleVisibility}
          disabled={isRevealingCard}
          isLoading={isRevealingCard}
          icon={
            showSensitiveData ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )
          }
        />
        <ActionButton
          onClick={onFreezeCard}
          disabled={isOperationInProgress}
          isLoading={isFreezingCard}
          icon={<Snowflake className="h-5 w-5" />}
        />
        <ActionButton
          onClick={onNavigateToSettings}
          disabled={isOperationInProgress}
          icon={<Settings className="h-5 w-5" />}
        />
        <ActionButton
          onClick={onNavigateToTopup}
          disabled={isOperationInProgress}
          icon={<ArrowBigUp className="h-5 w-5" />}
        />
      </div>

      {/* Labels Row */}
      <div className="mt-3 flex justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
        <span className="w-[60px] text-center text-xs text-muted-foreground">
          {isRevealingCard ? 'Loading...' : showSensitiveData ? 'Hide' : 'Show'}
        </span>
        <span className="w-[60px] text-center text-xs text-muted-foreground">
          {isFreezingCard ? 'Processing...' : 'Freeze'}
        </span>
        <span className="w-[60px] text-center text-xs text-muted-foreground">
          Settings
        </span>
        <span className="w-[60px] text-center text-xs text-muted-foreground">
          Topup
        </span>
      </div>
    </div>
  );
}

export default CardActions;
