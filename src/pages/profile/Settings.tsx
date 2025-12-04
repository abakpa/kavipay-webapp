import { Sun, Bell, Shield, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Settings() {
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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates
              </p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-muted">
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified for transactions
              </p>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-kaviBlue">
              <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
            </button>
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
