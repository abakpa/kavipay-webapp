import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Smartphone,
  Key,
  Monitor,
  ChevronRight,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getVerificationStatus, type VerificationStatus } from '@/lib/api/verification';
import { useAuth } from '@/contexts/AuthContext';

export function SecuritySettings() {
  const navigate = useNavigate();
  const { resetPassword, user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const s = await getVerificationStatus();
        setStatus(s);
      } catch (err) {
        console.error('Failed to load verification status:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security</p>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <h3 className="px-1 text-sm font-medium text-muted-foreground">Password</h3>
        <Card>
          <CardContent className="p-0">
            <button
              onClick={handleChangePassword}
              disabled={isResettingPassword}
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                  <Shield className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground">Change Password</span>
                  <p className="text-xs text-muted-foreground">
                    {passwordResetSent
                      ? 'Reset link sent to your email!'
                      : 'Update your account password'}
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

      {/* Verification Methods */}
      <div className="space-y-2">
        <h3 className="px-1 text-sm font-medium text-muted-foreground">
          Verification Methods
        </h3>

        {/* Transaction PIN */}
        <Card>
          <CardContent className="p-0">
            <Link
              to="/security/pin"
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                  <Key className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground">Transaction PIN</span>
                  <p className="text-xs text-muted-foreground">
                    {status?.pin_set
                      ? 'PIN is set up'
                      : 'Set up a PIN for quick verification'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status?.pin_set ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <Check className="h-3 w-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <X className="h-3 w-3" />
                    Not set
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardContent className="p-0">
            <Link
              to="/security/2fa"
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground">
                    Two-Factor Authentication
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {status?.totp_enabled
                      ? 'Authenticator app enabled'
                      : 'Add extra security with an authenticator app'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status?.totp_enabled ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-500">
                    <Check className="h-3 w-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <X className="h-3 w-3" />
                    Not set
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <div className="space-y-2">
        <h3 className="px-1 text-sm font-medium text-muted-foreground">Sessions</h3>
        <Card>
          <CardContent className="p-0">
            <Link
              to="/security/sessions"
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                  <Monitor className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-foreground">Active Sessions</span>
                  <p className="text-xs text-muted-foreground">
                    Manage devices where you're logged in
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SecuritySettings;
