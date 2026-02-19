import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { webSocketNotificationService } from '@/lib/services/WebSocketNotificationService';
import { useAuth } from './AuthContext';
import * as notificationAPI from '@/lib/api/notifications';
import type {
  NotificationItem,
  NotificationPreferences,
  NotificationType,
  SystemAnnouncement,
} from '@/types/notification';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_STORAGE_KEYS,
} from '@/types/notification';

interface NotificationContextType {
  // State
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isConnected: boolean;
  isLoading: boolean;

  // Announcements
  announcements: SystemAnnouncement[];
  announcementCount: number;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  removeNotification: (notificationId: string) => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => Promise<void>;

  // Refresh methods
  refreshNotifications: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  dismissAnnouncement: (announcementId: string) => Promise<void>;

  // Push notifications
  requestPushPermission: () => Promise<boolean>;
  getPushPermissionStatus: () => NotificationPermission;

  // Toast management
  currentToast: NotificationItem | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const MAX_NOTIFICATIONS = 100;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToast, setCurrentToast] = useState<NotificationItem | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load preferences from server first, then localStorage fallback
  const loadPreferences = useCallback(async () => {
    try {
      // Try server first
      const serverPrefs = await notificationAPI.getPreferences();
      if (serverPrefs) {
        const merged = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...serverPrefs };
        setPreferences(merged);
        // Also save to localStorage as cache
        localStorage.setItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES, JSON.stringify(merged));
        return;
      }
    } catch (error) {
      console.error('Failed to load preferences from server:', error);
    }

    // Fallback to localStorage
    try {
      const savedPreferences = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES);
      if (savedPreferences) {
        setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(savedPreferences) });
      }
    } catch (error) {
      console.error('Failed to load notification preferences from localStorage:', error);
    }
  }, []);

  // Fetch notifications from server
  const refreshNotifications = useCallback(async () => {
    try {
      const serverNotifications = await notificationAPI.getNotifications();
      if (Array.isArray(serverNotifications)) {
        setNotifications(serverNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Fetch announcements from server
  const refreshAnnouncements = useCallback(async () => {
    try {
      const serverAnnouncements = await notificationAPI.getAnnouncements();
      if (Array.isArray(serverAnnouncements)) {
        setAnnouncements(serverAnnouncements);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  }, []);

  // Initialize on mount and when user authenticates
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await loadPreferences();
        if (user) {
          await Promise.all([refreshNotifications(), refreshAnnouncements()]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user, loadPreferences, refreshNotifications, refreshAnnouncements]);

  // Save preferences to both server and localStorage
  const savePreferences = useCallback(async (prefs: NotificationPreferences) => {
    // Save to localStorage first (immediate)
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save notification preferences to localStorage:', error);
    }

    // Then sync to server
    try {
      await notificationAPI.updatePreferences(prefs);
    } catch (error) {
      console.error('Failed to sync preferences to server:', error);
    }
  }, []);

  // Connect/disconnect WebSocket based on auth state
  useEffect(() => {
    if (user) {
      webSocketNotificationService.connect();
    } else {
      webSocketNotificationService.disconnect();
      setNotifications([]);
      setAnnouncements([]);
    }

    return () => {
      webSocketNotificationService.disconnect();
    };
  }, [user]);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeNotification = webSocketNotificationService.onNotification(
      (notification) => {
        // Check if notification type is enabled
        if (!isNotificationTypeEnabled(notification.type, preferences)) {
          return;
        }

        // Add to notifications list
        setNotifications((prev) => {
          const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return updated;
        });

        // Show toast if in-app notifications are enabled
        if (preferences.inAppEnabled && preferences.enabled) {
          showToast(notification);
        }

        // Show browser push notification if enabled and page is not focused
        if (preferences.pushEnabled && preferences.enabled && document.hidden) {
          showBrowserNotification(notification);
        }
      }
    );

    const unsubscribeConnection = webSocketNotificationService.onConnectionChange(
      (connected) => {
        setIsConnected(connected);
      }
    );

    return () => {
      unsubscribeNotification();
      unsubscribeConnection();
    };
  }, [preferences]);

  // Check if a notification type is enabled
  const isNotificationTypeEnabled = (
    type: NotificationType,
    prefs: NotificationPreferences
  ): boolean => {
    if (!prefs.enabled) return false;

    const typeMap: Record<NotificationType, keyof NotificationPreferences> = {
      transaction: 'transactionAlerts',
      security: 'securityAlerts',
      wallet: 'walletAlerts',
      card: 'cardAlerts',
      kyc: 'kycAlerts',
      utility: 'utilityAlerts',
      marketing: 'marketingAlerts',
      system: 'systemAlerts',
    };

    const prefKey = typeMap[type];
    return prefKey ? (prefs[prefKey] as boolean) : true;
  };

  // Show toast notification
  const showToast = useCallback(
    (notification: NotificationItem) => {
      // Clear existing timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      setCurrentToast(notification);

      // Auto-dismiss toast
      toastTimeoutRef.current = setTimeout(() => {
        setCurrentToast(null);
      }, preferences.autoHideDuration);

      // Play sound if enabled
      if (preferences.sound) {
        playNotificationSound();
      }
    },
    [preferences.autoHideDuration, preferences.sound]
  );

  // Dismiss toast
  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setCurrentToast(null);
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Ignore errors
    }
  };

  // Show browser push notification
  const showBrowserNotification = (notification: NotificationItem) => {
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    } catch {
      // Ignore errors
    }
  };

  // Request push permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      if (granted) {
        const updated = { ...preferences, pushEnabled: true };
        setPreferences(updated);
        await savePreferences(updated);
      }

      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [preferences, savePreferences]);

  // Get push permission status
  const getPushPermissionStatus = useCallback((): NotificationPermission => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }, []);

  // Mark notification as read (optimistic update + API call)
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Persist to server
    try {
      const success = await notificationAPI.markAsRead(notificationId);
      if (!success) {
        // Revert on failure
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      await refreshNotifications();
    }
  }, [refreshNotifications]);

  // Mark all notifications as read (optimistic update + API call)
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Persist to server
    try {
      const success = await notificationAPI.markAllAsRead();
      if (!success) {
        // Revert on failure
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      await refreshNotifications();
    }
  }, [refreshNotifications]);

  // Clear all notifications (local only)
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a specific notification (local only)
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Dismiss an announcement
  const dismissAnnouncement = useCallback(async (announcementId: string) => {
    // Optimistic update
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));

    // Persist to server
    try {
      const success = await notificationAPI.dismissAnnouncement(announcementId);
      if (!success) {
        // Revert on failure
        await refreshAnnouncements();
      }
    } catch (error) {
      console.error('Failed to dismiss announcement:', error);
      await refreshAnnouncements();
    }
  }, [refreshAnnouncements]);

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      await savePreferences(updated);
    },
    [preferences, savePreferences]
  );

  // Calculate counts
  const unreadCount = notifications.filter((n) => !n.read).length;
  const announcementCount = announcements.length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    isConnected,
    isLoading,
    announcements,
    announcementCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    updatePreferences,
    refreshNotifications,
    refreshAnnouncements,
    dismissAnnouncement,
    requestPushPermission,
    getPushPermissionStatus,
    currentToast,
    dismissToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
