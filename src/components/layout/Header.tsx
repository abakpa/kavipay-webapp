import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/notifications';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function Header({ className, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-border bg-card px-4',
        className
      )}
    >
      {/* Left side - Menu button (mobile) + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side - Theme + Notifications + User menu */}
      <div className="flex items-center gap-2">
        <ThemeToggleCompact />

        <NotificationBell />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-kaviBlue text-white">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium md:block">
              {user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
