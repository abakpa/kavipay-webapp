// Notification Types and Interfaces

export type NotificationType =
  | 'transaction'
  | 'security'
  | 'wallet'
  | 'system'
  | 'marketing'
  | 'kyc'
  | 'card'
  | 'utility';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface NotificationPreferences {
  // Master toggle
  enabled: boolean;

  // Channel toggles
  pushEnabled: boolean;
  inAppEnabled: boolean;

  // Type toggles
  transactionAlerts: boolean;
  securityAlerts: boolean;
  walletAlerts: boolean;
  cardAlerts: boolean;
  kycAlerts: boolean;
  utilityAlerts: boolean;
  marketingAlerts: boolean;
  systemAlerts: boolean;

  // Display settings
  sound: boolean;
  autoHideDuration: number; // milliseconds
}

export interface WebSocketMessage {
  type: 'notification' | 'system_announcement' | 'badge_update' | 'ping' | 'pong';
  data?: NotificationItem;
  notification?: NotificationItem;
  count?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

// Notification type styling configuration
export const NOTIFICATION_STYLES: Record<NotificationType, { color: string; bgColor: string; icon: string }> = {
  transaction: { color: '#10B981', bgColor: 'bg-emerald-500/10', icon: 'ArrowUpDown' },
  security: { color: '#EF4444', bgColor: 'bg-red-500/10', icon: 'Shield' },
  wallet: { color: '#F59E0B', bgColor: 'bg-amber-500/10', icon: 'Wallet' },
  system: { color: '#4DA6FF', bgColor: 'bg-blue-500/10', icon: 'Info' },
  marketing: { color: '#8B5CF6', bgColor: 'bg-purple-500/10', icon: 'Megaphone' },
  kyc: { color: '#059669', bgColor: 'bg-emerald-600/10', icon: 'UserCheck' },
  card: { color: '#06B6D4', bgColor: 'bg-cyan-500/10', icon: 'CreditCard' },
  utility: { color: '#F97316', bgColor: 'bg-orange-500/10', icon: 'Zap' },
};

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  pushEnabled: false,
  inAppEnabled: true,
  transactionAlerts: true,
  securityAlerts: true,
  walletAlerts: true,
  cardAlerts: true,
  kycAlerts: true,
  utilityAlerts: true,
  marketingAlerts: false,
  systemAlerts: true,
  sound: true,
  autoHideDuration: 5000,
};

// Storage keys
export const NOTIFICATION_STORAGE_KEYS = {
  PREFERENCES: 'kavipay_notification_preferences',
  HISTORY: 'kavipay_notification_history',
} as const;
