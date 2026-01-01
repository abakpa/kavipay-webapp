import { Phone, Wifi, Zap, Tv, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UtilityService } from '@/types/utilities';

interface ServiceCardProps {
  service: UtilityService;
  onClick: (service: UtilityService) => void;
  className?: string;
}

const getServiceIcon = (icon: UtilityService['icon'], isActive: boolean) => {
  const iconProps = {
    className: cn('h-6 w-6', isActive ? 'text-white' : 'text-muted-foreground'),
  };

  switch (icon) {
    case 'phone':
      return <Phone {...iconProps} />;
    case 'wifi':
      return <Wifi {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'tv':
      return <Tv {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    default:
      return <Phone {...iconProps} />;
  }
};

export function ServiceCard({ service, onClick, className }: ServiceCardProps) {
  const handleClick = () => {
    if (service.isActive) {
      onClick(service);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!service.isActive}
      className={cn(
        'flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all',
        service.isActive
          ? 'hover:border-kaviBlue hover:bg-accent/50 cursor-pointer'
          : 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg',
          service.isActive ? 'bg-kaviBlue' : 'bg-muted'
        )}
      >
        {getServiceIcon(service.icon, service.isActive)}
      </div>

      <div className="flex-1">
        <h3
          className={cn(
            'text-base font-semibold',
            service.isActive ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {service.title}
        </h3>
        <p className="text-sm text-muted-foreground">{service.description}</p>
        {!service.isActive && (
          <span className="mt-1 inline-block rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
            Coming Soon
          </span>
        )}
      </div>

      {service.isActive && (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}

export default ServiceCard;
