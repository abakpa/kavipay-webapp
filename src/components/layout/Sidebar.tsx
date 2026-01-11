import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  User,
  Settings,
  ShieldCheck,
  Smartphone,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/kavi-logo-dark.png';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cards', label: 'Cards', icon: CreditCard },
  { to: '/utilities', label: 'Utilities', icon: Smartphone },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/kyc', label: 'Verification', icon: ShieldCheck },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const logo = resolvedTheme === 'dark' ? logoDark : logoLight;

  return (
    <aside
      className={cn(
        'w-64 flex-col border-r border-border bg-card',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link to="/dashboard" onClick={onNavigate}>
          <img
            src={logo}
            alt="KaviPay"
            className="h-8"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-kaviBlue/10 text-kaviBlue'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} KaviPay
        </p>
      </div>
    </aside>
  );
}
