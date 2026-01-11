import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationItemComponent } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute right-0 top-full mt-2 z-50',
        'w-80 sm:w-96',
        'rounded-lg border border-border bg-card shadow-lg',
        'overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-kaviBlue px-2 py-0.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs font-medium text-kaviBlue hover:text-kaviBlue/80 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {recentNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {recentNotifications.map((notification) => (
              <NotificationItemComponent
                key={notification.id}
                notification={notification}
                compact
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No notifications</p>
            <p className="mt-1 text-xs text-muted-foreground text-center">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center justify-center gap-1 text-sm font-medium text-kaviBlue hover:text-kaviBlue/80 transition-colors"
          >
            View all notifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
