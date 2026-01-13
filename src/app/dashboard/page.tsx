'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { DashboardMetrics } from '@/types';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalInvoices: 0,
    invoicesThisMonth: 0,
    pendingReview: 0,
    averageInvoiceValue: 0,
    topVendor: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch all invoices on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllInvoices();
    }
  }, [isAuthenticated, fetchAllInvoices]);

  // Calculate metrics from invoices
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Invoices this month
      const invoicesThisMonth = invoices.filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return isWithinInterval(invDate, { start: monthStart, end: monthEnd });
      }).length;

      // Pending review
      const pendingReview = invoices.filter((inv) => inv.status === 'needs_review').length;

      // Average invoice value
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const averageInvoiceValue = invoices.length > 0 ? totalAmount / invoices.length : 0;

      // Top vendor
      const vendorCounts = invoices.reduce(
        (acc, inv) => {
          acc[inv.vendorName] = (acc[inv.vendorName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topVendor = Object.entries(vendorCounts).sort(([, a], [, b]) => b - a)[0];

      setMetrics({
        totalInvoices: invoices.length,
        invoicesThisMonth,
        pendingReview,
        averageInvoiceValue,
        topVendor: topVendor ? { name: topVendor[0], count: topVendor[1] } : null,
      });
    }
  }, [invoices]);

  if (!isAuthenticated) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Invoices',
      value: metrics.totalInvoices.toString(),
      icon: '📊',
      color: 'bg-blue-50',
      description: 'All extracted invoices',
    },
    {
      title: 'This Month',
      value: metrics.invoicesThisMonth.toString(),
      icon: '📅',
      color: 'bg-green-50',
      description: `Invoices in ${format(new Date(), 'MMMM')}`,
    },
    {
      title: 'Pending Review',
      value: metrics.pendingReview.toString(),
      icon: '⚠️',
      color: 'bg-orange-50',
      description: 'Low confidence extractions',
    },
    {
      title: 'Average Value',
      value: `$${metrics.averageInvoiceValue.toFixed(0)}`,
      icon: '💰',
      color: 'bg-purple-50',
      description: 'Mean invoice amount',
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to your invoice management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`${stat.color} border-0 shadow-sm hover:shadow-md transition-shadow`}>
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-2">{stat.description}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🚀</span>
                Quick Actions
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/upload">
                  <Button variant="primary" className="w-full justify-center">
                    📁 Upload Invoice
                  </Button>
                </Link>
                <Link href="/invoices">
                  <Button variant="secondary" className="w-full justify-center">
                    📋 View All
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="secondary" className="w-full justify-center">
                    ⭐ Favorites
                  </Button>
                </Link>
                {metrics.pendingReview > 0 && (
                  <Link href="/invoices">
                    <Button variant="secondary" className="w-full justify-center">
                      ⚠️ Review ({metrics.pendingReview})
                    </Button>
                  </Link>
                )}
                {!metrics.pendingReview && (
                  <Link href="/settings">
                    <Button variant="secondary" className="w-full justify-center">
                      ⚙️ Settings
                    </Button>
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Empty State */}
          {metrics.totalInvoices === 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 mt-6">
              <CardBody className="p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h3>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                  Upload your first invoice to start extracting structured data with AI-powered analysis.
                </p>
                <Link href="/upload">
                  <Button variant="primary" className="px-8">
                    Upload Your First Invoice
                  </Button>
                </Link>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Top Vendor Card */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏆</span>
                Top Vendor
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              {metrics.topVendor ? (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Most frequent vendor</p>
                  <p className="text-2xl font-bold text-slate-900 mb-3">{metrics.topVendor.name}</p>
                  <div className="bg-slate-100 rounded-lg px-3 py-2 inline-block">
                    <p className="text-sm font-semibold text-slate-700">
                      {metrics.topVendor.count} invoices
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500">No vendor data yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span>
                Recent Invoices
              </h2>
              <Link href="/invoices">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded px-2 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{invoice.vendorName}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')} • {invoice.invoiceNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">
                      {invoice.currency || '$'} {invoice.totalAmount.toFixed(2)}
                    </p>
                    <StatusBadge status={invoice.status || 'extracted'} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </MainLayout>
  );
}
