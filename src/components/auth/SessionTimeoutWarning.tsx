import { useEffect, useState } from 'react';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  timeRemaining: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({
  isOpen,
  timeRemaining,
  onStayLoggedIn,
  onLogout,
}: SessionTimeoutWarningProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeRemaining / 60000) * 100));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-sm transform rounded-2xl bg-card p-6 shadow-2xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kaviGold/10">
          <Clock className="h-8 w-8 text-kaviGold" />
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          Session Timeout Warning
        </h2>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Your session is about to expire due to inactivity. Would you like to stay logged in?
        </p>

        {/* Timer */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-foreground">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-kaviGold transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            until automatic logout
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onStayLoggedIn}
            size="lg"
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Stay Logged In
          </Button>

          <Button
            onClick={onLogout}
            variant="ghost"
            size="lg"
            className="w-full gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout Now
          </Button>
        </div>
      </div>
    </div>
  );
}
