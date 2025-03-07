import { useEffect, useCallback } from 'react';
import { wsService } from '../services/websocket';
import { useAuthContext } from '../contexts/AuthContext';

export const useWebSocket = (channel, callback) => {
  const { token } = useAuthContext();

  useEffect(() => {
    if (token) {
      wsService.connect(token);
    }
    return () => wsService.disconnect();
  }, [token]);

  useEffect(() => {
    if (channel && callback) {
      return wsService.subscribe(channel, callback);
    }
  }, [channel, callback]);

  const sendMessage = useCallback((message) => {
    if (wsService.ws && wsService.ws.readyState === WebSocket.OPEN) {
      wsService.ws.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
};