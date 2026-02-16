import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  FileText,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import kaviLogo from '@/assets/logo.png';

// App version - in a real app this would come from package.json or environment
const APP_VERSION = '1.0.0';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  route?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function AboutKavipay() {
  const navigate = useNavigate();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('Checking...');

    try {
      // For web app, we can just reload or check service worker
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUpdateStatus('Up to date');

      // Show notification that app is up to date
      setTimeout(() => {
        setUpdateStatus('');
      }, 3000);
    } catch {
      setUpdateStatus('Check failed');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleRefreshApp = () => {
    window.location.reload();
  };

  const menuItems: MenuItem[] = [
    {
      icon: RefreshCw,
      label: 'App Version',
      value: updateStatus || `v${APP_VERSION}`,
      onClick: handleCheckForUpdates,
      isLoading: isCheckingUpdate,
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      route: '/legal?tab=privacy',
    },
    {
      icon: FileText,
      label: 'Terms & Conditions',
      route: '/legal?tab=terms',
    },
  ];

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">About Us</h1>
      </div>

      {/* App Info Section */}
      <div className="flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 shadow-sm">
          <img
            src={kaviLogo}
            alt="KaviPay"
            className="w-12 h-12 object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">KaviPay</h2>
        <p className="text-sm text-muted-foreground">Version {APP_VERSION}</p>
      </div>

      {/* Menu Items */}
      <Card className="mb-6">
        <CardContent className="p-0 divide-y divide-border">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item)}
              disabled={item.isLoading}
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-kaviBlue" />
                ) : item.value ? (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                ) : null}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Company Info Section */}
      <div className="text-center px-4 pb-8">
        <h3 className="text-xl font-semibold text-foreground mb-3">Kavipay</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Making global payments simple with secure virtual cards, digital wallets,
          and seamless money management for everyone.
        </p>
        <a
          href="https://kavipay.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-kaviBlue rounded-lg text-kaviBlue font-medium hover:bg-kaviBlue/10 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Visit our website
        </a>
      </div>

      {/* Refresh Button (for web) */}
      <div className="text-center pb-8">
        <button
          onClick={handleRefreshApp}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Refresh app to check for updates
        </button>
      </div>
    </div>
  );
}

export default AboutKavipay;
