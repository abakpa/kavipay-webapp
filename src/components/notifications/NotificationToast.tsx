import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NOTIFICATION_STYLES } from '@/types/notification';
import { NotificationIcon } from './NotificationIcon';

export function NotificationToast() {
  const { currentToast, dismissToast } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentToast) {
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentToast]);

  if (!currentToast) return null;

  const style = NOTIFICATION_STYLES[currentToast.type];

  return (
    <div
      className={cn(
        'fixed right-4 top-4 z-50 w-full max-w-sm transform transition-all duration-300 ease-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-4 shadow-lg',
          'flex items-start gap-3'
        )}
        style={{ borderLeftWidth: '4px', borderLeftColor: style.color }}
      >
        {/* Icon */}
        <div
          className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', style.bgColor)}
        >
          <NotificationIcon type={currentToast.type} className="h-4 w-4" style={{ color: style.color }} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{currentToast.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{currentToast.body}</p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismissToast}
          className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

export default NotificationToast;
