import { toast } from 'react-toastify';

class NotificationManager {
  constructor() {
    this.notificationQueue = [];
    this.isProcessing = false;
    this.minInterval = 3000; // Minimum time between notifications
    this.lastNotificationTime = 0;
    this.maxQueueSize = 5; // Maximum number of notifications in queue
  }

  enqueue(notification) {
    // Add notification to queue if not duplicate
    const isDuplicate = this.notificationQueue.some(
      n => n.message === notification.message && Date.now() - n.timestamp < 5000
    );

    if (!isDuplicate) {
      this.notificationQueue.push({
        ...notification,
        timestamp: Date.now()
      });

      // Trim queue if it exceeds max size
      if (this.notificationQueue.length > this.maxQueueSize) {
        this.notificationQueue = this.notificationQueue.slice(-this.maxQueueSize);
      }

      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.notificationQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastNotification = now - this.lastNotificationTime;

      if (timeSinceLastNotification < this.minInterval) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minInterval - timeSinceLastNotification)
        );
      }

      const notification = this.notificationQueue.shift();
      this.showNotification(notification);
      this.lastNotificationTime = Date.now();
    }

    this.isProcessing = false;
  }

  showNotification({ type, message, options = {} }) {
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  }

  // Specific notification methods
  success(message, options = {}) {
    this.enqueue({ type: 'success', message, options });
  }

  error(message, options = {}) {
    this.enqueue({ type: 'error', message, options });
  }

  warning(message, options = {}) {
    this.enqueue({ type: 'warning', message, options });
  }

  info(message, options = {}) {
    this.enqueue({ type: 'info', message, options });
  }

  // Clear all pending notifications
  clearQueue() {
    this.notificationQueue = [];
  }
}

const notificationManager = new NotificationManager();
export default notificationManager; 