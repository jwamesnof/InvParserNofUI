// Activity logging utility

export interface ActivityLog {
  id: string;
  action: string;
  invoiceId?: string;
  invoiceNumber?: string;
  timestamp: string;
  user: string;
  details?: string;
}

export const logActivity = (
  action: string,
  details?: {
    invoiceId?: string;
    invoiceNumber?: string;
    details?: string;
  }
) => {
  if (typeof window === 'undefined') return;

  try {
    const logs: ActivityLog[] = [];
    const stored = localStorage.getItem('activityLogs');
    if (stored) {
      logs.push(...JSON.parse(stored));
    }

    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(7),
      action,
      invoiceId: details?.invoiceId,
      invoiceNumber: details?.invoiceNumber,
      timestamp: new Date().toISOString(),
      user: 'admin', // In real app, get from auth context
      details: details?.details,
    };

    logs.push(newLog);

    // Keep only last 1000 logs to avoid localStorage bloat
    const logsToKeep = logs.slice(-1000);
    localStorage.setItem('activityLogs', JSON.stringify(logsToKeep));

    console.log('Activity logged:', newLog);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getActivityLogs = (): ActivityLog[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('activityLogs');
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return [];
  }
};

export const clearActivityLogs = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('activityLogs');
  } catch (error) {
    console.error('Failed to clear activity logs:', error);
  }
};
