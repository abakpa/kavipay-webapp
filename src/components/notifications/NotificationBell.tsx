import { useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={toggleDropdown}
        className={cn(
          'relative rounded-lg p-2 transition-colors',
          'hover:bg-muted',
          isDropdownOpen && 'bg-muted'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5',
              'flex h-5 w-5 items-center justify-center',
              'rounded-full bg-kaviBlue text-[10px] font-bold text-white',
              'border-2 border-card'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown isOpen={isDropdownOpen} onClose={closeDropdown} />
    </div>
  );
}

export default NotificationBell;
