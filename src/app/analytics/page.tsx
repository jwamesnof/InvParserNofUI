'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Invoice } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    averageAmount: 0,
    topVendors: [] as Array<{ name: string; count: number; total: number }>,
    monthlyTrend: [] as Array<{ month: string; count: number; total: number }>,
    statusBreakdown: { extracted: 0, needs_review: 0, processing: 0, error: 0 },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllInvoices();
    }
  }, [isAuthenticated, fetchAllInvoices]);

  useEffect(() => {
    if (invoices && invoices.length > 0) {
      calculateStats(invoices);
    }
  }, [invoices]);

  const calculateStats = (invoiceList: Invoice[]) => {
    const totalAmount = invoiceList.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const avgAmount = totalAmount / invoiceList.length;

    // Top vendors
    const vendorMap = new Map<string, { count: number; total: number }>();
    invoiceList.forEach((inv) => {
      const existing = vendorMap.get(inv.vendorName) || { count: 0, total: 0 };
      vendorMap.set(inv.vendorName, {
        count: existing.count + 1,
        total: existing.total + inv.totalAmount,
      });
    });
    const topVendors = Array.from(vendorMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Monthly trend (last 6 months)
    const monthlyMap = new Map<string, { count: number; total: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthKey = format(month, 'MMM yyyy');

      const monthInvoices = invoiceList.filter((inv) => {
        const invDate = new Date(inv.invoiceDate);
        return isWithinInterval(invDate, { start: monthStart, end: monthEnd });
      });

      const total = monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      monthlyMap.set(monthKey, { count: monthInvoices.length, total });
    }
    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data }));

    // Status breakdown
    const statusBreakdown = {
      extracted: invoiceList.filter((inv) => inv.status === 'extracted').length,
      needs_review: invoiceList.filter((inv) => inv.status === 'needs_review').length,
      processing: invoiceList.filter((inv) => inv.status === 'processing').length,
      error: invoiceList.filter((inv) => inv.status === 'uploaded').length,
    };

    setStats({
      totalInvoices: invoiceList.length,
      totalAmount,
      averageAmount: avgAmount,
      topVendors,
      monthlyTrend,
      statusBreakdown,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Analytics & Insights</h1>
        <p className="text-slate-600">Comprehensive analysis of your invoice data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Total Invoices</p>
            <p className="text-4xl font-bold text-slate-900">{stats.totalInvoices}</p>
          </CardBody>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Total Amount</p>
            <p className="text-4xl font-bold text-slate-900">${stats.totalAmount.toFixed(0)}</p>
          </CardBody>
        </Card>
        <Card className="bg-purple-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Average Invoice</p>
            <p className="text-4xl font-bold text-slate-900">${stats.averageAmount.toFixed(0)}</p>
          </CardBody>
        </Card>
      </div>

      {/* Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900">Top 5 Vendors</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {stats.topVendors.length > 0 ? (
                stats.topVendors.map((vendor, idx) => (
                  <div key={vendor.name} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {idx + 1}. {vendor.name}
                        </p>
                        <p className="text-sm text-slate-600">{vendor.count} invoices</p>
                      </div>
                      <p className="font-bold text-green-600">${vendor.total.toFixed(0)}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded h-2">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{
                          width: `${(vendor.count / stats.topVendors[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No vendor data available</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900">Status Breakdown</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-green-700">✓ Extracted</p>
                  <p className="font-bold text-green-700">{stats.statusBreakdown.extracted}</p>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{
                      width: `${(stats.statusBreakdown.extracted / stats.totalInvoices) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-yellow-700">⚠️ Needs Review</p>
                  <p className="font-bold text-yellow-700">{stats.statusBreakdown.needs_review}</p>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded"
                    style={{
                      width: `${(stats.statusBreakdown.needs_review / stats.totalInvoices) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-blue-700">⏳ Processing</p>
                  <p className="font-bold text-blue-700">{stats.statusBreakdown.processing}</p>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{
                      width: `${(stats.statusBreakdown.processing / stats.totalInvoices) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-red-700">✗ Error</p>
                  <p className="font-bold text-red-700">{stats.statusBreakdown.error}</p>
                </div>
                <div className="w-full bg-slate-200 rounded h-2">
                  <div
                    className="bg-red-500 h-2 rounded"
                    style={{
                      width: `${(stats.statusBreakdown.error / stats.totalInvoices) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-900">Monthly Trend (Last 6 Months)</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="space-y-3">
            {stats.monthlyTrend.length > 0 ? (
              stats.monthlyTrend.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-slate-700">{month.month}</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {month.count} invoices • ${month.total.toFixed(0)}
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded"
                      style={{
                        width: `${(month.count / (stats.monthlyTrend[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600">No monthly data available</p>
            )}
          </div>
        </CardBody>
      </Card>
    </MainLayout>
  );
}
