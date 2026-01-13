'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const integrations = [
  {
    name: 'QuickBooks Online',
    icon: '📊',
    status: 'Coming Soon',
    description: 'Sync invoices directly to QuickBooks',
    color: 'blue',
  },
  {
    name: 'Xero',
    icon: '🟢',
    status: 'Coming Soon',
    description: 'Connect with Xero accounting software',
    color: 'green',
  },
  {
    name: 'Gmail Integration',
    icon: '📧',
    status: 'Coming Soon',
    description: 'Process invoices from email attachments',
    color: 'red',
  },
  {
    name: 'Google Drive',
    icon: '☁️',
    status: 'Coming Soon',
    description: 'Auto-backup invoices to Google Drive',
    color: 'blue',
  },
  {
    name: 'Slack',
    icon: '💬',
    status: 'Coming Soon',
    description: 'Get notifications in Slack',
    color: 'purple',
  },
  {
    name: 'Zapier',
    icon: '⚡',
    status: 'Coming Soon',
    description: 'Connect with 1000+ apps via Zapier',
    color: 'orange',
  },
];

export default function IntegrationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Integrations</h1>
        <p className="text-slate-600">Connect with your favorite tools and services</p>
      </div>

      {/* API Documentation */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">API Documentation</h2>
        </CardHeader>
        <CardBody className="p-6">
          <p className="text-slate-700 mb-4">
            Build custom integrations using our REST API. Get your API key from{' '}
            <a href="/settings" className="text-blue-600 hover:underline">
              Settings
            </a>
            .
          </p>
          <Button variant="secondary">📖 View API Docs</Button>
        </CardBody>
      </Card>

      {/* Available Integrations */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card
              key={integration.name}
              className={`border-l-4 ${
                integration.color === 'blue'
                  ? 'border-l-blue-500'
                  : integration.color === 'green'
                    ? 'border-l-green-500'
                    : integration.color === 'red'
                      ? 'border-l-red-500'
                      : integration.color === 'purple'
                        ? 'border-l-purple-500'
                        : 'border-l-orange-500'
              }`}
            >
              <CardBody className="p-6">
                <div className="text-4xl mb-3">{integration.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{integration.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{integration.status}</span>
                  <Button variant="secondary" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">Connected Integrations</h2>
        </CardHeader>
        <CardBody className="p-6">
          <p className="text-slate-600 text-center py-8">
            No integrations connected yet. Check back soon when integrations are available!
          </p>
        </CardBody>
      </Card>
    </MainLayout>
  );
}
