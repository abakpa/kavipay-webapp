import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Filter, RefreshCw, Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItemComponent, AnnouncementItem } from '@/components/notifications';
import type { NotificationType } from '@/types/notification';

type TabType = 'notifications' | 'announcements';

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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    announcements,
    announcementCount,
    dismissAnnouncement,
    refreshNotifications,
    refreshAnnouncements,
    isLoading,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh data on mount
  useEffect(() => {
    refreshNotifications();
    refreshAnnouncements();
  }, [refreshNotifications, refreshAnnouncements]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'notifications') {
        await refreshNotifications();
      } else {
        await refreshAnnouncements();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

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

      {/* Tabs */}
      <div className="mb-4 flex rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => setActiveTab('notifications')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'notifications'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="rounded-full bg-kaviBlue px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'announcements'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Megaphone className="h-4 w-4" />
          Announcements
          {announcementCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
              {announcementCount}
            </span>
          )}
        </button>
      </div>

      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Filter dropdown - only for notifications tab */}
          {activeTab === 'notifications' && (
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
          )}

          {activeTab === 'notifications' && unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}

          {activeTab === 'announcements' && announcementCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {announcementCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>

          {activeTab === 'notifications' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
          <Loader2 className="h-8 w-8 animate-spin text-kaviBlue" />
        </div>
      ) : activeTab === 'notifications' ? (
        /* Notification list */
        <div className="overflow-hidden rounded-lg border border-border bg-card">
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
            <div className="flex flex-col items-center justify-center px-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">No notifications</p>
              <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                {filterType !== 'all'
                  ? `No ${filterType} notifications yet. Try changing the filter.`
                  : "You're all caught up! New notifications will appear here."}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Announcements list */
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {announcements.length > 0 ? (
            <div className="divide-y divide-border">
              {announcements.map((announcement) => (
                <AnnouncementItem
                  key={announcement.id}
                  announcement={announcement}
                  onDismiss={dismissAnnouncement}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">No announcements</p>
              <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                There are no active announcements at the moment. Check back later for updates.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
