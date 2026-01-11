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
import type {
  NotificationItem,
  NotificationPreferences,
  NotificationType,
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

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (notificationId: string) => void;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;

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
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToast, setCurrentToast] = useState<NotificationItem | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES);
      if (savedPreferences) {
        setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(savedPreferences) });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
    setIsLoading(false);
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((prefs: NotificationPreferences) => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }, []);

  // Connect/disconnect WebSocket based on auth state
  useEffect(() => {
    if (user) {
      webSocketNotificationService.connect();
    } else {
      webSocketNotificationService.disconnect();
      setNotifications([]);
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
        setPreferences((prev) => {
          const updated = { ...prev, pushEnabled: true };
          savePreferences(updated);
          return updated;
        });
      }

      return granted;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [savePreferences]);

  // Get push permission status
  const getPushPermissionStatus = useCallback((): NotificationPermission => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    (newPreferences: Partial<NotificationPreferences>) => {
      setPreferences((prev) => {
        const updated = { ...prev, ...newPreferences };
        savePreferences(updated);
        return updated;
      });
    },
    [savePreferences]
  );

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    updatePreferences,
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
