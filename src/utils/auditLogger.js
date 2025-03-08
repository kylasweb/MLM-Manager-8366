import { adminAPI } from '../services/api/admin';

class AuditLogger {
  static async log(action, details, userId = null) {
    try {
      const logEntry = {
        action,
        details,
        userId,
        timestamp: new Date().toISOString(),
        ipAddress: window.clientIp, // Set by backend
        userAgent: navigator.userAgent
      };

      await adminAPI.getAuditLogs({ method: 'POST', data: logEntry });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Store failed logs in localStorage for retry
      this.storeFailedLog(logEntry);
    }
  }

  static storeFailedLog(logEntry) {
    const failedLogs = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
    failedLogs.push(logEntry);
    localStorage.setItem('failedAuditLogs', JSON.stringify(failedLogs));
  }

  static async retryFailedLogs() {
    const failedLogs = JSON.parse(localStorage.getItem('failedAuditLogs') || '[]');
    if (failedLogs.length === 0) return;

    const successfulRetries = [];

    for (const logEntry of failedLogs) {
      try {
        await adminAPI.getAuditLogs({ method: 'POST', data: logEntry });
        successfulRetries.push(logEntry);
      } catch (error) {
        console.error('Failed to retry audit log:', error);
      }
    }

    // Remove successful retries from failed logs
    const remainingLogs = failedLogs.filter(
      log => !successfulRetries.some(success => 
        success.timestamp === log.timestamp && 
        success.action === log.action
      )
    );

    localStorage.setItem('failedAuditLogs', JSON.stringify(remainingLogs));
  }

  static async getAuditLogs(filters = {}) {
    try {
      const response = await adminAPI.getAuditLogs({ params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}

// Retry failed logs on app initialization
AuditLogger.retryFailedLogs();

export default AuditLogger; 