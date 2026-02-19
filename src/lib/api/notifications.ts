import { api } from './index';
import type { NotificationItem, NotificationPreferences, SystemAnnouncement } from '@/types/notification';

/**
 * Get user's notification preferences from server
 */
export const getPreferences = async (): Promise<NotificationPreferences | null> => {
  try {
    const response = await api.get('/notifications/preferences');
    return response.data;
  } catch (error: unknown) {
    // 404 is expected if user hasn't set preferences yet
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) {
        console.error('[Notifications API] GET /notifications/preferences error:', error);
      }
    }
    return null;
  }
};

/**
 * Update user's notification preferences on server
 */
export const updatePreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<boolean> => {
  try {
    const response = await api.put('/notifications/preferences', preferences);
    return response.status === 200;
  } catch (error) {
    console.error('[Notifications API] PUT /notifications/preferences error:', error);
    return false;
  }
};

/**
 * Get notification list from server
 */
export const getNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const response = await api.get('/notifications');
    const notifications = response.data?.notifications || response.data || [];

    // Map backend fields to frontend NotificationItem interface
    return notifications.map((n: Record<string, unknown>) => ({
      id: String(n.id),
      title: n.title as string,
      body: n.body as string,
      type: n.type as NotificationItem['type'],
      priority: (n.priority as NotificationItem['priority']) || 'normal',
      timestamp: n.createdAt ? new Date(n.createdAt as string).getTime() : Date.now(),
      read: (n.read as boolean) || false,
      data: n.data as Record<string, unknown> | undefined,
    }));
  } catch (error) {
    console.error('[Notifications API] GET /notifications error:', error);
    return [];
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.status === 200;
  } catch (error) {
    console.error('[Notifications API] PATCH /notifications/:id/read error:', error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<boolean> => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.status === 200;
  } catch (error) {
    console.error('[Notifications API] PATCH /notifications/read-all error:', error);
    return false;
  }
};

/**
 * Get system announcements
 */
export const getAnnouncements = async (): Promise<SystemAnnouncement[]> => {
  try {
    const response = await api.get('/notifications/system');
    const announcements = response.data?.announcements || response.data || [];

    // Filter active announcements (within start/end time)
    const now = new Date();
    return announcements
      .map((a: Record<string, unknown>) => ({
        id: String(a.id),
        type: a.type as SystemAnnouncement['type'],
        title: a.title as string,
        message: a.message as string,
        priority: (a.priority as SystemAnnouncement['priority']) || 'normal',
        startTime: a.startTime as string,
        endTime: a.endTime as string | undefined,
        dismissible: (a.dismissible as boolean) ?? true,
        actionUrl: a.actionUrl as string | undefined,
        dismissed: (a.dismissed as boolean) || false,
        createdAt: a.createdAt as string,
      }))
      .filter((a: SystemAnnouncement) => {
        const start = new Date(a.startTime);
        const end = a.endTime ? new Date(a.endTime) : null;
        return start <= now && (!end || end >= now) && !a.dismissed;
      });
  } catch (error) {
    console.error('[Notifications API] GET /notifications/system error:', error);
    return [];
  }
};

/**
 * Dismiss a system announcement
 */
export const dismissAnnouncement = async (announcementId: string): Promise<boolean> => {
  try {
    const response = await api.post(`/notifications/system/${announcementId}/dismiss`);
    return response.status === 200;
  } catch (error) {
    console.error('[Notifications API] POST /notifications/system/:id/dismiss error:', error);
    return false;
  }
};

export const notificationAPI = {
  getPreferences,
  updatePreferences,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getAnnouncements,
  dismissAnnouncement,
};

export default notificationAPI;
