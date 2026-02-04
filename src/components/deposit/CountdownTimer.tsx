import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
}

interface TimeRemaining {
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function getTimeRemaining(expiresAt: string): TimeRemaining {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  const diff = Math.max(0, expiry - now);

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds, totalSeconds };
}

export function CountdownTimer({ expiresAt, onExpire, className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(expiresAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTimeRemaining(remaining);

      if (remaining.totalSeconds <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isExpired = timeRemaining.totalSeconds <= 0;
  const isUrgent = timeRemaining.totalSeconds <= 300; // 5 minutes
  const isWarning = timeRemaining.totalSeconds <= 600 && !isUrgent; // 10 minutes

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isExpired) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl bg-destructive/10 p-4',
          className
        )}
      >
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <span className="font-semibold text-destructive">Expired</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 rounded-xl p-4',
        isUrgent && 'bg-destructive/10',
        isWarning && 'bg-amber-500/10',
        !isUrgent && !isWarning && 'bg-kaviBlue/10',
        className
      )}
    >
      <Clock
        className={cn(
          'h-5 w-5',
          isUrgent && 'text-destructive',
          isWarning && 'text-amber-500',
          !isUrgent && !isWarning && 'text-kaviBlue'
        )}
      />
      <div className="text-center">
        <p
          className={cn(
            'text-xs',
            isUrgent && 'text-destructive',
            isWarning && 'text-amber-600',
            !isUrgent && !isWarning && 'text-kaviBlue'
          )}
        >
          Time remaining
        </p>
        <p
          className={cn(
            'font-mono text-2xl font-bold',
            isUrgent && 'text-destructive',
            isWarning && 'text-amber-500',
            !isUrgent && !isWarning && 'text-kaviBlue'
          )}
        >
          {formatTime(timeRemaining.minutes, timeRemaining.seconds)}
        </p>
      </div>
    </div>
  );
}

export default CountdownTimer;
