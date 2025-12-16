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
  const variantStyles = {
    primary: 'bg-kaviBlue/10 text-kaviBlue hover:bg-kaviBlue/20',
    warning: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-2 rounded-xl p-4 transition-all active:scale-95',
        variantStyles[variant]
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-current/10">
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
