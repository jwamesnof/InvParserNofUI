'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { logActivity } from '@/lib/activity-logger';
import toast, { Toaster } from 'react-hot-toast';

interface UserSettings {
  defaultExportFormat: 'json' | 'csv' | 'html';
  autoBackup: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  itemsPerPage: number;
}

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    defaultExportFormat: 'json',
    autoBackup: true,
    notificationsEnabled: true,
    theme: 'light',
    itemsPerPage: 10,
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadSettings();
    }
  }, [isAuthenticated, router]);

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      const key = localStorage.getItem('apiKey') || 'sk_test_' + Math.random().toString(36).substring(7);
      setApiKey(key);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      localStorage.setItem('apiKey', apiKey);
      
      logActivity('Settings Updated', {
        details: `Updated preferences: Export format=${settings.defaultExportFormat}, Theme=${settings.theme}`,
      });
      
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleGenerateNewApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15);
    setApiKey(newKey);
    
    logActivity('API Key Generated', {
      details: 'Generated new API key',
    });
    
    toast.success('New API key generated');
  };

  const handleExportSettings = () => {
    const dataToExport = { settings, apiKey: '***HIDDEN***' };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    logActivity('Settings Exported', {
      details: 'Exported settings backup',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your preferences and account settings</p>
      </div>

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Export Format
              </label>
              <select
                value={settings.defaultExportFormat}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultExportFormat: e.target.value as 'json' | 'csv' | 'html',
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Items Per Page</label>
              <Input
                type="number"
                min="5"
                max="100"
                value={settings.itemsPerPage}
                onChange={(e) =>
                  setSettings({ ...settings, itemsPerPage: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) =>
                    setSettings({ ...settings, autoBackup: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Enable Auto Backup</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, notificationsEnabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Enable Notifications</span>
              </label>
            </div>

            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* API Settings */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">API Configuration</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Manage your API key for integrations</p>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-slate-900">
                  {showApiKey ? apiKey : '••••••••••••••••'}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  toast.success('API key copied to clipboard');
                }}
              >
                📋 Copy
              </Button>
              <Button variant="secondary" onClick={handleGenerateNewApiKey}>
                🔄 Generate New
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Backup & Data */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">Backup & Data</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Export or manage your data</p>

            <div className="flex flex-col md:flex-row gap-2">
              <Button variant="secondary" onClick={handleExportSettings}>
                💾 Export Settings
              </Button>
              <Button variant="secondary">
                📥 Import Backup
              </Button>
              <Button variant="secondary" className="hover:bg-red-50 hover:text-red-700">
                🗑️ Clear All Data
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </MainLayout>
  );
}
