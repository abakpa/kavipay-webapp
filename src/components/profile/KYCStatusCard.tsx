import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Clock, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KYC_STATUS_CONFIG, type KYCStatus } from '@/types/profile';

interface KYCStatusCardProps {
  status: KYCStatus;
  className?: string;
}

const statusIcons: Record<KYCStatus, React.ReactNode> = {
  not_verified: <ShieldAlert className="h-5 w-5" />,
  pending: <Clock className="h-5 w-5" />,
  verified: <ShieldCheck className="h-5 w-5" />,
  rejected: <ShieldX className="h-5 w-5" />,
};

export function KYCStatusCard({ status, className }: KYCStatusCardProps) {
  const config = KYC_STATUS_CONFIG[status];
  const Icon = statusIcons[status];

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <span style={{ color: config.color }}>{Icon}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {config.action && config.actionRoute && (
          <Link
            to={config.actionRoute}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: config.color }}
          >
            {config.action}
          </Link>
        )}
      </div>
    </div>
  );
}

export default KYCStatusCard;
