import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  UserPen,
  Bell,
  Settings,
  Info,
  MessageCircle,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserAvatar, EditProfileModal, DeleteAccountModal } from '@/components/profile';
import { updateProfile, deleteAccount } from '@/lib/api/profile';
import type { ProfileFormData } from '@/types/profile';

export function Profile() {
  const { user, refreshUserData, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const handleSaveProfile = async (data: ProfileFormData): Promise<boolean> => {
    if (!user?.userId) return false;

    const result = await updateProfile(user.userId, {
      name: data.name,
      phoneNumber: data.phoneNumber,
    });

    if (result.success) {
      await refreshUserData?.();
      return true;
    }

    return false;
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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3">
            <UserAvatar name={userName} size="xl" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{userName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since January 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Settings</h3>
        <Card>
          <CardContent className="p-0">
            {/* Edit Profile */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kaviBlue/10">
                  <UserPen className="h-4 w-4 text-kaviBlue" />
                </div>
                <span className="font-medium text-foreground">Edit Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="border-t border-border" />

            {/* Notifications */}
            <Link
              to="/notifications"
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
                  <Bell className="h-4 w-4 text-amber-500" />
                </div>
                <span className="font-medium text-foreground">Notifications</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <div className="border-t border-border" />

            {/* App Settings */}
            <Link
              to="/settings"
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10">
                  <Settings className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-medium text-foreground">App Settings</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Support</h3>
        <Card>
          <CardContent className="p-0">
            {/* About KaviPay */}
            <a
              href="https://kavipay.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <Info className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="font-medium text-foreground">About KaviPay</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>

            <div className="border-t border-border" />

            {/* Contact Support */}
            <a
              href="mailto:support@kavipay.com"
              className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10">
                  <MessageCircle className="h-4 w-4 text-purple-500" />
                </div>
                <span className="font-medium text-foreground">Contact Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Danger Zone</h3>
        <Card>
          <CardContent className="p-0">
            {/* Delete Account */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex w-full items-center justify-between p-4 hover:bg-destructive/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <span className="font-medium text-destructive">Delete Account</span>
              </div>
              <ChevronRight className="h-4 w-4 text-destructive" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </Button>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
        user={{
          name: userName,
          email: user?.email || '',
          phoneNumber: user?.phoneNumber,
        }}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}
