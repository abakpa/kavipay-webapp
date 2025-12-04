import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-kaviBlue text-white">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{user?.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{user?.phoneNumber || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p>Not set</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full">
        Edit Profile
      </Button>
    </div>
  );
}
