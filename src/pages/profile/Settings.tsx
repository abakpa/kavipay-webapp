import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Shield,
  Bell,
  User,
  MessageCircle,
  RefreshCw,
  Info,
  Trash2,
  ChevronRight,
  Key,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteAccountModal } from '@/components/profile';
import { deleteAccount } from '@/lib/api/profile';

// Define settings sections and their searchable content
const SETTINGS_SECTIONS = {
  quickAction: {
    heading: 'Quick Action',
    cards: [
      {
        id: 'quick-security',
        keywords: ['security', 'settings', 'password', 'change password', 'security options'],
      },
    ],
  },
  securityPrivacy: {
    heading: 'Security & Privacy',
    cards: [
      {
        id: 'security-settings',
        keywords: ['security', 'settings', 'password', '2fa', 'two factor', 'login', 'authentication'],
      },
      {
        id: 'notifications',
        keywords: ['notifications', 'alerts', 'preferences', 'notify'],
      },
    ],
  },
  accountProfile: {
    heading: 'Account & Profile',
    cards: [
      {
        id: 'profile-info',
        keywords: ['profile', 'information', 'account', 'details', 'edit', 'personal'],
      },
    ],
  },
  helpSupport: {
    heading: 'Help & Support',
    cards: [
      {
        id: 'contact-support',
        keywords: ['contact', 'support', 'help', 'email', 'team'],
      },
      {
        id: 'check-updates',
        keywords: ['check', 'updates', 'refresh', 'version', 'latest'],
      },
      {
        id: 'about',
        keywords: ['about', 'kavipay', 'learn', 'more', 'info'],
      },
      {
        id: 'delete-account',
        keywords: ['delete', 'account', 'remove', 'permanently'],
      },
    ],
  },
};

export function Settings() {
  const { user, resetPassword, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Filter sections based on search query
  const visibleSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return {
        quickAction: true,
        securityPrivacy: true,
        accountProfile: true,
        helpSupport: true,
      };
    }

    const result: Record<string, boolean> = {
      quickAction: false,
      securityPrivacy: false,
      accountProfile: false,
      helpSupport: false,
    };

    // Check each section
    Object.entries(SETTINGS_SECTIONS).forEach(([key, section]) => {
      // Check if heading matches
      if (section.heading.toLowerCase().includes(query)) {
        result[key] = true;
        return;
      }

      // Check if any card keywords match
      const hasMatchingCard = section.cards.some((card) =>
        card.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      );

      if (hasMatchingCard) {
        result[key] = true;
      }
    });

    return result;
  }, [searchQuery]);

  const handleChangePassword = async () => {
    if (!user?.email || isResettingPassword) return;

    setIsResettingPassword(true);
    try {
      await resetPassword(user.email);
      setPasswordResetSent(true);
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDeleteAccount = async (): Promise<boolean> => {
    try {
      const result = await deleteAccount();
      if (result.success) {
        setTimeout(async () => {
          await logout();
        }, 2000);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  };

  const handleCheckForUpdates = () => {
    // For web app, this could refresh the page or check service worker
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Action Section */}
      {visibleSections.quickAction && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Quick Action</h3>
          <Card>
            <CardContent className="p-0">
              <button
                onClick={handleChangePassword}
                disabled={isResettingPassword}
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kaviBlue/10">
                    <Key className="h-4 w-4 text-kaviBlue" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Security Settings</span>
                    <p className="text-xs text-muted-foreground">
                      {passwordResetSent
                        ? 'Reset link sent to your email!'
                        : 'Change password and security options'}
                    </p>
                  </div>
                </div>
                {isResettingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security & Privacy Section */}
      {visibleSections.securityPrivacy && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Security & Privacy</h3>

          {/* Security Settings Card */}
          <Card>
            <CardContent className="p-0">
              <button
                onClick={handleChangePassword}
                disabled={isResettingPassword}
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                    <Shield className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Security Settings</span>
                    <p className="text-xs text-muted-foreground">
                      Password, 2FA, and login options
                    </p>
                  </div>
                </div>
                {isResettingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardContent className="p-0">
              <Link
                to="/notifications"
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                    <Bell className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Notifications</span>
                    <p className="text-xs text-muted-foreground">
                      Manage notification preferences
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account & Profile Section */}
      {visibleSections.accountProfile && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Account & Profile</h3>
          <Card>
            <CardContent className="p-0">
              <Link
                to="/profile"
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                    <User className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Profile Information</span>
                    <p className="text-xs text-muted-foreground">
                      View and edit your profile details
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help & Support Section */}
      {visibleSections.helpSupport && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Help & Support</h3>

          {/* Contact Support Card */}
          <Card>
            <CardContent className="p-0">
              <a
                href="mailto:support@kavipay.com"
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Contact Support</span>
                    <p className="text-xs text-muted-foreground">
                      Get help from our support team
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </CardContent>
          </Card>

          {/* Check for Updates Card */}
          <Card>
            <CardContent className="p-0">
              <button
                onClick={handleCheckForUpdates}
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10">
                    <RefreshCw className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Check for Updates</span>
                    <p className="text-xs text-muted-foreground">
                      Refresh to get the latest version
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          {/* About KaviPay Card */}
          <Card>
            <CardContent className="p-0">
              <a
                href="https://kavipay.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10">
                    <Info className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">About KaviPay</span>
                    <p className="text-xs text-muted-foreground">
                      Learn more about KaviPay
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </CardContent>
          </Card>

          {/* Delete Account Card */}
          <Card>
            <CardContent className="p-0">
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex w-full items-center justify-between p-4 hover:bg-destructive/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-destructive">Delete Account</span>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-destructive" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && !Object.values(visibleSections).some(Boolean) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No settings found for "{searchQuery}"</p>
        </div>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}
