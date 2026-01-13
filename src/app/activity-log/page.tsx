'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { getActivityLogs, clearActivityLogs } from '@/lib/activity-logger';

interface ActivityLog {
  id: string;
  action: string;
  invoiceId?: string;
  invoiceNumber?: string;
  timestamp: string;
  user: string;
  details?: string;
}

export default function ActivityLogPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadActivityLogs();
    }
  }, [isAuthenticated, router]);

  const loadActivityLogs = () => {
    try {
      let logsList = getActivityLogs().sort(
        (a: ActivityLog, b: ActivityLog) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Add sample logs if none exist (for testing)
      if (logsList.length === 0) {
        const sampleLogs = [
          {
            id: 'sample1',
            action: 'Invoice Uploaded',
            invoiceId: 'inv_001',
            invoiceNumber: 'INV-2024-001',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'admin',
            details: 'Uploaded from file: invoice1.pdf'
          },
          {
            id: 'sample2',
            action: 'Invoice Extracted',
            invoiceId: 'inv_002',
            invoiceNumber: 'INV-2024-002',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            user: 'admin',
            details: 'Extracted invoice data from PDF'
          },
          {
            id: 'sample3',
            action: 'Invoice Deleted',
            invoiceId: 'inv_003',
            invoiceNumber: 'INV-2024-003',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            user: 'admin',
            details: 'Deleted invoice from Acme Corp'
          },
          {
            id: 'sample4',
            action: 'Invoice Approved',
            invoiceId: 'inv_004',
            invoiceNumber: 'INV-2024-004',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            user: 'admin',
            details: 'Approved by admin. Notes: Verified with vendor'
          }
        ];
        logsList = sampleLogs;
      }
      
      setLogs(logsList);
      setFilteredLogs(logsList);
      console.log('Loaded activity logs:', logsList.length);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  };

  const applyFilters = (logsToFilter: ActivityLog[]) => {
    let results = logsToFilter;

    if (actionFilter !== 'all') {
      results = results.filter((log) => log.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (log) =>
          log.invoiceNumber?.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(results);
    console.log('Filtered logs:', results.length);
  };

  // Auto-apply filters whenever search or action filter changes
  useEffect(() => {
    applyFilters(logs);
  }, [searchQuery, actionFilter, logs]);

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Invoice', 'Details', 'User'],
      ...filteredLogs.map((log) => [
        log.timestamp,
        log.action,
        log.invoiceNumber || 'N/A',
        log.details || '',
        log.user,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return null;
  }

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Activity Log</h1>
        <p className="text-slate-600">Track all invoice processing and management activities</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <Input
                placeholder="Search invoice number or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportLogs}>
              📊 Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearActivityLogs();
                setLogs([]);
                setFilteredLogs([]);
              }}
            >
              🗑️ Clear Logs
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Activity History</h2>
        </CardHeader>
        <CardBody className="p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-lg font-semibold text-slate-900 mb-1">No activity logs found</p>
              <p className="text-sm text-slate-600">Logs will appear here as you work with invoices</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                      <div>
                        <p className="font-semibold text-slate-900">{log.action}</p>
                        {log.invoiceNumber && (
                          <p className="text-sm text-slate-600">Invoice: {log.invoiceNumber}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">
                      {format(new Date(log.timestamp), 'MMM dd, yyyy · HH:mm')}
                    </p>
                  </div>
                  {log.details && <p className="text-sm text-slate-700 ml-5">{log.details}</p>}
                  <p className="text-xs text-slate-500 ml-5 mt-1">User: {log.user}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </MainLayout>
  );
}
