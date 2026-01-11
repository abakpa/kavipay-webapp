import { cn } from '@/lib/utils';
import { NOTIFICATION_STYLES } from '@/types/notification';
import type { NotificationItem as NotificationItemType } from '@/types/notification';
import { NotificationIcon } from './NotificationIcon';

interface NotificationItemProps {
  notification: NotificationItemType;
  onClick?: () => void;
  compact?: boolean;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function NotificationItemComponent({ notification, onClick, compact = false }: NotificationItemProps) {
  const style = NOTIFICATION_STYLES[notification.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left transition-colors hover:bg-muted/50',
        compact ? 'px-3 py-2' : 'px-4 py-3',
        !notification.read && 'bg-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon with unread indicator */}
        <div className="relative shrink-0">
          <div
            className={cn(
              'flex items-center justify-center rounded-full',
              compact ? 'h-8 w-8' : 'h-10 w-10',
              style.bgColor
            )}
          >
            <NotificationIcon
              type={notification.type}
              className={compact ? 'h-4 w-4' : 'h-5 w-5'}
              style={{ color: style.color }}
            />
          </div>
          {!notification.read && (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card"
              style={{ backgroundColor: style.color }}
            />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm text-foreground',
                notification.read ? 'font-medium' : 'font-semibold'
              )}
            >
              {notification.title}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
          <p
            className={cn(
              'mt-0.5 text-sm text-muted-foreground',
              compact ? 'line-clamp-1' : 'line-clamp-2'
            )}
          >
            {notification.body}
          </p>

          {/* Type badge */}
          {!compact && (
            <span
              className={cn(
                'mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                style.bgColor
              )}
              style={{ color: style.color }}
            >
              {notification.type}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default NotificationItemComponent;
