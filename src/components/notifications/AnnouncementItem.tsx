import { cn } from '@/lib/utils';
import { ANNOUNCEMENT_STYLES } from '@/types/notification';
import type { SystemAnnouncement } from '@/types/notification';
import {
  Wrench,
  AlertTriangle,
  Sparkles,
  FileText,
  RefreshCw,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';

interface AnnouncementItemProps {
  announcement: SystemAnnouncement;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

const ICON_MAP = {
  maintenance: Wrench,
  disruption: AlertTriangle,
  feature: Sparkles,
  terms: FileText,
  update: RefreshCw,
  info: Info,
} as const;

function formatAnnouncementDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function getPriorityStyles(priority: SystemAnnouncement['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-red-500';
    case 'normal':
      return 'border-l-4 border-l-amber-500';
    case 'low':
    default:
      return 'border-l-4 border-l-blue-500';
  }
}

export function AnnouncementItem({ announcement, onDismiss, compact = false }: AnnouncementItemProps) {
  const style = ANNOUNCEMENT_STYLES[announcement.type];
  const Icon = ICON_MAP[announcement.type] || Info;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(announcement.id);
  };

  const handleActionClick = () => {
    if (announcement.actionUrl) {
      window.open(announcement.actionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        'relative w-full text-left transition-colors',
        compact ? 'px-3 py-2' : 'px-4 py-4',
        getPriorityStyles(announcement.priority),
        'bg-card hover:bg-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full',
            compact ? 'h-8 w-8' : 'h-10 w-10',
            style.bgColor
          )}
        >
          <Icon
            className={compact ? 'h-4 w-4' : 'h-5 w-5'}
            style={{ color: style.color }}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  'text-sm font-semibold text-foreground',
                  compact && 'line-clamp-1'
                )}
              >
                {announcement.title}
              </p>
              {announcement.priority === 'high' && (
                <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-xs font-medium text-red-500">
                  Important
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {formatAnnouncementDate(announcement.createdAt)}
              </span>
              {announcement.dismissible && onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="ml-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Dismiss announcement"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <p
            className={cn(
              'mt-1 text-sm text-muted-foreground',
              compact ? 'line-clamp-2' : 'line-clamp-3'
            )}
          >
            {announcement.message}
          </p>

          {/* Footer with type badge and action */}
          {!compact && (
            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  style.bgColor
                )}
                style={{ color: style.color }}
              >
                {announcement.type}
              </span>

              {announcement.actionUrl && (
                <button
                  onClick={handleActionClick}
                  className="flex items-center gap-1 text-xs font-medium text-kaviBlue hover:underline"
                >
                  Learn more
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Time range for scheduled announcements */}
          {!compact && announcement.endTime && (
            <p className="mt-2 text-xs text-muted-foreground">
              Active until {new Date(announcement.endTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementItem;
