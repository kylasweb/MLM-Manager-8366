import { io } from 'socket.io-client';
import { WS_BASE_URL, WEBSOCKET_EVENTS, AUTH_TOKEN_KEY, USE_MOCK_DATA } from '../../config/constants';
import notificationManager from '../../utils/notificationManager';
import { mockWebSocket } from '../mockApi';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.notificationSettings = {
      enabled: true,
      types: {
        connection: true,
        system: true,
        business: true
      }
    };
  }

  connect() {
    if (this.isConnecting || this.socket?.connected) return;

    this.isConnecting = true;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (USE_MOCK_DATA) {
      console.log('Using mock WebSocket in development mode');
      this.socket = mockWebSocket.connect();
      this.isConnecting = false;
      this.setupEventListeners();
      return;
    }

    this.socket = io(WS_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (USE_MOCK_DATA) {
      // Set up mock event listeners
      this.notifyListeners(WEBSOCKET_EVENTS.CONNECT);
      if (this.notificationSettings.enabled && this.notificationSettings.types.connection) {
        notificationManager.success('Connected to development server');
      }
      return;
    }

    // Connection events
    this.socket.on(WEBSOCKET_EVENTS.CONNECT, () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyListeners(WEBSOCKET_EVENTS.CONNECT);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.connection) {
        notificationManager.success('Connected to server');
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.notifyListeners(WEBSOCKET_EVENTS.DISCONNECT, reason);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.connection) {
        notificationManager.warning('Disconnected from server');
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.ERROR, (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.notifyListeners(WEBSOCKET_EVENTS.ERROR, error);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.connection) {
        notificationManager.error('Connection error');
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.notifyListeners(WEBSOCKET_EVENTS.RECONNECT, attemptNumber);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.connection) {
        notificationManager.success('Reconnected to server');
      }
    });

    // Business events
    this.socket.on(WEBSOCKET_EVENTS.NETWORK_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.NETWORK_UPDATE, data);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.business) {
        notificationManager.info('Network structure updated');
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.COMMISSION_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.COMMISSION_UPDATE, data);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.business) {
        notificationManager.info(`Commission update: ${data.amount} ${data.currency}`);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.BUSINESS_VOLUME_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.BUSINESS_VOLUME_UPDATE, data);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.business) {
        notificationManager.info(`Business volume updated: ${data.amount} BV`);
      }
    });

    this.socket.on(WEBSOCKET_EVENTS.REFERRAL_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.REFERRAL_UPDATE, data);
      
      if (this.notificationSettings.enabled && this.notificationSettings.types.business) {
        notificationManager.info('New referral activity');
      }
    });
  }

  // Notification settings management
  updateNotificationSettings(settings) {
    this.notificationSettings = {
      ...this.notificationSettings,
      ...settings
    };
  }

  enableNotifications() {
    this.notificationSettings.enabled = true;
  }

  disableNotifications() {
    this.notificationSettings.enabled = false;
  }

  toggleNotificationType(type, enabled) {
    if (this.notificationSettings.types.hasOwnProperty(type)) {
      this.notificationSettings.types[type] = enabled;
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.error('WebSocket is not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }
}

const webSocketService = new WebSocketService();

// Start mock events in development mode
if (USE_MOCK_DATA) {
  mockApi.mockWebSocketEvents(webSocketService);
}

export default webSocketService; 