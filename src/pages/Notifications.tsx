import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItemComponent } from '@/components/notifications';
import type { NotificationType } from '@/types/notification';

const NOTIFICATION_TYPES: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'transaction', label: 'Transactions' },
  { value: 'security', label: 'Security' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'card', label: 'Cards' },
  { value: 'utility', label: 'Utilities' },
  { value: 'kyc', label: 'KYC' },
  { value: 'system', label: 'System' },
  { value: 'marketing', label: 'Marketing' },
];

export function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredNotifications =
    filterType === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay updated with your account activity
        </p>
      </div>

      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {NOTIFICATION_TYPES.find((t) => t.value === filterType)?.label || 'All'}
            </Button>

            {showFilterMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                  {NOTIFICATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setFilterType(type.value);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-muted',
                        filterType === type.value && 'bg-muted font-medium'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => (
              <NotificationItemComponent
                key={notification.id}
                notification={notification}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No notifications</p>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
              {filterType !== 'all'
                ? `No ${filterType} notifications yet. Try changing the filter.`
                : "You're all caught up! New notifications will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
