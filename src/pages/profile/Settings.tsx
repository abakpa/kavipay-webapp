import { Sun, Bell, Shield, HelpCircle, Volume2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/contexts/NotificationContext';

export function Settings() {
  const {
    preferences,
    updatePreferences,
    requestPushPermission,
    getPushPermissionStatus,
  } = useNotifications();

  const pushPermission = getPushPermissionStatus();

  const handleRequestPushPermission = async () => {
    await requestPushPermission();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose light, dark, or system theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">
                Master switch for all notifications
              </p>
            </div>
            <Toggle
              checked={preferences.enabled}
              onChange={(checked) => updatePreferences({ enabled: checked })}
            />
          </div>

          {/* Browser push notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Browser Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                {pushPermission === 'granted'
                  ? 'Receive notifications when app is in background'
                  : pushPermission === 'denied'
                  ? 'Permission denied. Enable in browser settings.'
                  : 'Allow browser notifications'}
              </p>
            </div>
            {pushPermission === 'granted' ? (
              <Toggle
                checked={preferences.pushEnabled}
                onChange={(checked) => updatePreferences({ pushEnabled: checked })}
                disabled={!preferences.enabled}
              />
            ) : pushPermission === 'denied' ? (
              <span className="text-xs text-muted-foreground">Blocked</span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestPushPermission}
                disabled={!preferences.enabled}
              >
                Enable
              </Button>
            )}
          </div>

          <hr className="border-border" />

          {/* Notification types */}
          <p className="text-sm font-medium text-muted-foreground">Notification Types</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">
                Payments, transfers, and swaps
              </p>
            </div>
            <Toggle
              checked={preferences.transactionAlerts}
              onChange={(checked) => updatePreferences({ transactionAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">
                Login attempts and security events
              </p>
            </div>
            <Toggle
              checked={preferences.securityAlerts}
              onChange={(checked) => updatePreferences({ securityAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Card Alerts</p>
              <p className="text-sm text-muted-foreground">
                Virtual card activity
              </p>
            </div>
            <Toggle
              checked={preferences.cardAlerts}
              onChange={(checked) => updatePreferences({ cardAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Utility Alerts</p>
              <p className="text-sm text-muted-foreground">
                Bill payments and subscriptions
              </p>
            </div>
            <Toggle
              checked={preferences.utilityAlerts}
              onChange={(checked) => updatePreferences({ utilityAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Wallet Alerts</p>
              <p className="text-sm text-muted-foreground">
                Wallet activity and updates
              </p>
            </div>
            <Toggle
              checked={preferences.walletAlerts}
              onChange={(checked) => updatePreferences({ walletAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Notifications</p>
              <p className="text-sm text-muted-foreground">
                Promotions and new features
              </p>
            </div>
            <Toggle
              checked={preferences.marketingAlerts}
              onChange={(checked) => updatePreferences({ marketingAlerts: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <hr className="border-border" />

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Notification Sound</p>
                <p className="text-sm text-muted-foreground">
                  Play sound for new notifications
                </p>
              </div>
            </div>
            <Toggle
              checked={preferences.sound}
              onChange={(checked) => updatePreferences({ sound: checked })}
              disabled={!preferences.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted">
            <span>Change Password</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted">
            <span>Two-Factor Authentication</span>
            <span className="text-muted-foreground">→</span>
          </button>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <button className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted">
            <span>Contact Support</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-muted">
            <span>FAQs</span>
            <span className="text-muted-foreground">→</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
