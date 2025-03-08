import { io } from 'socket.io-client';
import { WS_BASE_URL, WEBSOCKET_EVENTS, AUTH_TOKEN_KEY } from '../../config/constants';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
  }

  connect() {
    if (this.isConnecting || this.socket?.connected) return;

    this.isConnecting = true;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

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
    this.socket.on(WEBSOCKET_EVENTS.CONNECT, () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyListeners(WEBSOCKET_EVENTS.CONNECT);
    });

    this.socket.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.notifyListeners(WEBSOCKET_EVENTS.DISCONNECT, reason);
    });

    this.socket.on(WEBSOCKET_EVENTS.ERROR, (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.notifyListeners(WEBSOCKET_EVENTS.ERROR, error);
    });

    this.socket.on(WEBSOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.notifyListeners(WEBSOCKET_EVENTS.RECONNECT, attemptNumber);
    });

    // Business events
    this.socket.on(WEBSOCKET_EVENTS.NETWORK_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.NETWORK_UPDATE, data);
    });

    this.socket.on(WEBSOCKET_EVENTS.COMMISSION_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.COMMISSION_UPDATE, data);
    });

    this.socket.on(WEBSOCKET_EVENTS.BUSINESS_VOLUME_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.BUSINESS_VOLUME_UPDATE, data);
    });

    this.socket.on(WEBSOCKET_EVENTS.REFERRAL_UPDATE, (data) => {
      this.notifyListeners(WEBSOCKET_EVENTS.REFERRAL_UPDATE, data);
    });
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
export default webSocketService; 