import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  MapPin,
  Clock,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { getSessions, revokeSession, type LoginSession } from '@/lib/api/verification';
import { cn } from '@/lib/utils';

function getDeviceIcon(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function Sessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<LoginSession | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async () => {
    if (!revokeTarget) return;

    setIsRevoking(true);
    setRevokeError(null);

    try {
      await revokeSession(revokeTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== revokeTarget.id));
      setRevokeTarget(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setRevokeError(error?.response?.data?.error || 'Failed to revoke session');
    } finally {
      setIsRevoking(false);
    }
  };

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

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
          <h1 className="text-xl font-bold text-foreground">Active Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Manage devices where you're logged in
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSessions}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Current Session */}
      {currentSession && (
        <div className="space-y-2">
          <h3 className="px-1 text-sm font-medium text-muted-foreground">
            Current Session
          </h3>
          <SessionCard session={currentSession} isCurrent />
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-2">
          <h3 className="px-1 text-sm font-medium text-muted-foreground">
            Other Sessions ({otherSessions.length})
          </h3>
          {otherSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={() => setRevokeTarget(session)}
            />
          ))}
        </div>
      )}

      {sessions.length === 0 && !error && (
        <div className="flex flex-col items-center py-12 text-center">
          <Monitor className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No active sessions found</p>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={revokeTarget !== null}
        onClose={() => {
          setRevokeTarget(null);
          setRevokeError(null);
        }}
        title="Revoke Session"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to log out of this device?
          </p>

          {revokeTarget && (
            <div className="rounded-xl bg-muted p-4">
              <p className="font-medium">{revokeTarget.deviceName}</p>
              <p className="text-sm text-muted-foreground">
                {revokeTarget.city}, {revokeTarget.country}
              </p>
            </div>
          )}

          {revokeError && (
            <p className="text-sm text-destructive">{revokeError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setRevokeTarget(null);
                setRevokeError(null);
              }}
              className="flex-1"
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              className="flex-1"
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface SessionCardProps {
  session: LoginSession;
  isCurrent?: boolean;
  onRevoke?: () => void;
}

function SessionCard({ session, isCurrent, onRevoke }: SessionCardProps) {
  const DeviceIcon = getDeviceIcon(session.userAgent);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              isCurrent ? 'bg-emerald-500/10' : 'bg-muted'
            )}
          >
            <DeviceIcon
              className={cn('h-5 w-5', isCurrent ? 'text-emerald-500' : 'text-muted-foreground')}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{session.deviceName}</span>
              {isCurrent && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                  <Check className="h-3 w-3" />
                  Current
                </span>
              )}
              {session.trusted && !isCurrent && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                  Trusted
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.city}, {session.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(session.lastLoginAt)}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              IP: {session.ipAddress}
            </p>
          </div>

          {!isCurrent && onRevoke && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRevoke}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default Sessions;
