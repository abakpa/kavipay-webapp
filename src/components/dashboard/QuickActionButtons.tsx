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
        'flex flex-1 flex-col items-center gap-2 rounded-xl p-4 transition-all active:scale-95 shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
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
        icon={<ArrowDownToLine className="h-5 w-5" />}
        label="Deposit"
        onClick={onDeposit}
        variant="primary"
      />
      <ActionButton
        icon={<Send className="h-5 w-5" />}
        label="Send"
        onClick={onSend}
        variant="warning"
      />
      <ActionButton
        icon={<Gift className="h-5 w-5" />}
        label="Earn"
        onClick={onEarn}
        variant="success"
      />
    </div>
  );
}

export default QuickActionButtons;
