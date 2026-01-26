import { ArrowDownToLine, Send, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionButtonsProps {
  onDeposit: () => void;
  onSend: () => void;
  onEarn: () => void;
  className?: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: 'primary' | 'warning' | 'success';
}

function ActionButton({ icon, label, onClick, variant }: ActionButtonProps) {
  // Solid colored buttons with white text/icons (matching mobile app)
  const variantStyles = {
    primary: 'bg-kaviBlue hover:bg-kaviBlue/90 text-white',
    warning: 'bg-amber-500 hover:bg-amber-500/90 text-white',
    success: 'bg-emerald-500 hover:bg-emerald-500/90 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        'flex flex-1 items-center justify-center gap-2 rounded-lg transition-all active:scale-95',
        // Mobile: horizontal compact layout (like mobile app)
        'flex-row py-3 px-3',
        // Desktop: vertical layout with more padding
        'sm:flex-col sm:gap-2 sm:rounded-xl sm:p-4 sm:shadow-md',
        variantStyles[variant]
      )}
    >
      {/* Icon - simple on mobile, with background on desktop */}
      <div className="flex items-center justify-center sm:h-12 sm:w-12 sm:rounded-full sm:bg-white/20">
        {icon}
      </div>
      <span className="text-sm font-semibold sm:font-medium">{label}</span>
    </button>
  );
}

export function QuickActionButtons({
  onDeposit,
  onSend,
  onEarn,
  className,
}: QuickActionButtonsProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <ActionButton
        icon={<ArrowDownToLine className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
        label="Deposit"
        onClick={onDeposit}
        variant="primary"
      />
      <ActionButton
        icon={<Send className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
        label="Send"
        onClick={onSend}
        variant="warning"
      />
      <ActionButton
        icon={<Gift className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
        label="Earn"
        onClick={onEarn}
        variant="success"
      />
    </div>
  );
}

export default QuickActionButtons;
