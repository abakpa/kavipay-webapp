import { getIdToken } from '../firebase';
import type { NotificationItem, WebSocketMessage } from '@/types/notification';

type NotificationCallback = (notification: NotificationItem) => void;
type ConnectionCallback = (isConnected: boolean) => void;

interface WebSocketNotificationServiceConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  pingInterval: number;
}

const DEFAULT_CONFIG: WebSocketNotificationServiceConfig = {
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  pingInterval: 30000,
};

class WebSocketNotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isConnecting = false;
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private config: WebSocketNotificationServiceConfig;

  constructor(config: Partial<WebSocketNotificationServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getWebSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://test-api.ploutoslabs.io';
    return apiUrl.replace(/^http/, 'ws') + '/ws/notifications';
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await getIdToken();
      if (!token) {
        console.warn('No auth token available for WebSocket connection');
        this.isConnecting = false;
        return;
      }

      const wsUrl = `${this.getWebSocketUrl()}?token=${encodeURIComponent(token)}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearReconnectTimeout();
    this.clearPingInterval();

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection on manual disconnect
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.notifyConnectionChange(false);
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyConnectionChange(true);
    this.startPingInterval();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'notification':
          if (message.data) {
            this.notifyNewNotification(message.data);
          }
          break;

        case 'system_announcement':
          if (message.notification) {
            this.notifyNewNotification({
              ...message.notification,
              type: 'system',
            });
          }
          break;

        case 'badge_update':
          // Badge updates are handled by the context via notification count
          break;

        case 'ping':
          this.sendPong();
          break;

        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.isConnecting = false;
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.isConnecting = false;
    this.clearPingInterval();
    this.notifyConnectionChange(false);

    // Don't reconnect on normal closure
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.clearReconnectTimeout();

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startPingInterval(): void {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.pingInterval);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private sendPong(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong' }));
    }
  }

  private notifyNewNotification(notification: NotificationItem): void {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  private notifyConnectionChange(isConnected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const webSocketNotificationService = new WebSocketNotificationService();
export default webSocketNotificationService;
