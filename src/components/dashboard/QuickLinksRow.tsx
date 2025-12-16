import { Phone, Smartphone, Zap, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickLinksRowProps {
  onAirtimePress: () => void;
  onDataPress: () => void;
  onElectricityPress: () => void;
  onTvPress: () => void;
  className?: string;
}

interface QuickLinkItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  bgColor: string;
}

function QuickLinkItem({ icon, label, onClick, color, bgColor }: QuickLinkItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex min-w-[80px] flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-accent/50 active:scale-95"
    >
      <div
        className={cn('flex h-12 w-12 items-center justify-center rounded-full', bgColor)}
        style={{ color }}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

export function QuickLinksRow({
  onAirtimePress,
  onDataPress,
  onElectricityPress,
  onTvPress,
  className,
}: QuickLinksRowProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <h3 className="mb-4 font-semibold text-foreground">Quick Links</h3>
      <div className="flex justify-between">
        <QuickLinkItem
          icon={<Phone className="h-5 w-5" />}
          label="Airtime"
          onClick={onAirtimePress}
          color="#4DA6FF"
          bgColor="bg-kaviBlue/10"
        />
        <QuickLinkItem
          icon={<Smartphone className="h-5 w-5" />}
          label="Data"
          onClick={onDataPress}
          color="#4DA6FF"
          bgColor="bg-sky-500/10"
        />
        <QuickLinkItem
          icon={<Zap className="h-5 w-5" />}
          label="Electricity"
          onClick={onElectricityPress}
          color="#F59E0B"
          bgColor="bg-amber-500/10"
        />
        <QuickLinkItem
          icon={<Tv className="h-5 w-5" />}
          label="TV"
          onClick={onTvPress}
          color="#10B981"
          bgColor="bg-emerald-500/10"
        />
      </div>
    </div>
  );
}

export default QuickLinksRow;
