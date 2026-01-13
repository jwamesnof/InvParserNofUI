'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { Invoice } from '@/types';
import * as exportService from '@/lib/export';

export default function ReportsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [vendor, setVendor] = useState('');

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
    if (invoices) {
      setFilteredInvoices(invoices);
    }
  }, [invoices]);

  const applyFilters = () => {
    let results = invoices || [];

    if (vendor.trim()) {
      results = results.filter((inv) => inv.vendorName.toLowerCase().includes(vendor.toLowerCase()));
    }

    if (dateFrom) {
      results = results.filter((inv) => new Date(inv.invoiceDate) >= new Date(dateFrom));
    }

    if (dateTo) {
      results = results.filter((inv) => new Date(inv.invoiceDate) <= new Date(dateTo));
    }

    if (minAmount) {
      results = results.filter((inv) => inv.totalAmount >= parseFloat(minAmount));
    }

    if (maxAmount) {
      results = results.filter((inv) => inv.totalAmount <= parseFloat(maxAmount));
    }

    setFilteredInvoices(results);
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices to export');
      return;
    }
    exportService.downloadAsCSV(filteredInvoices[0]);
  };

  const handleExportJSON = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices to export');
      return;
    }
    const jsonData = JSON.stringify(filteredInvoices, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (!isAuthenticated) {
    return null;
  }

  const totalFiltered = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const avgAmount = totalFiltered > 0 ? totalAmount / totalFiltered : 0;

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports & Advanced Search</h1>
        <p className="text-slate-600">Generate custom reports from your invoice data</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Report Filters</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
              <Input
                placeholder="Vendor name..."
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Max Amount ($)</label>
              <Input
                type="number"
                placeholder="999999.99"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setVendor('');
                setDateFrom('');
                setDateTo('');
                setMinAmount('');
                setMaxAmount('');
                setFilteredInvoices(invoices || []);
              }}
            >
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm text-slate-600 mb-1">Invoices Found</p>
            <p className="text-3xl font-bold text-slate-900">{totalFiltered}</p>
          </CardBody>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm text-slate-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-slate-900">${totalAmount.toFixed(0)}</p>
          </CardBody>
        </Card>
        <Card className="bg-purple-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm text-slate-600 mb-1">Average Amount</p>
            <p className="text-3xl font-bold text-slate-900">${avgAmount.toFixed(0)}</p>
          </CardBody>
        </Card>
        <Card className="bg-orange-50 border-0">
          <CardBody className="p-6">
            <p className="text-sm text-slate-600 mb-1">Export Options</p>
            <div className="flex gap-2 mt-2">
              <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportJSON}>
                JSON
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Report Results</h2>
        </CardHeader>
        <CardBody className="p-6">
          {totalFiltered === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-lg font-semibold text-slate-900 mb-1">No invoices match your criteria</p>
              <p className="text-sm text-slate-600">Adjust your filters and try again</p>
            </div>
          ) : (
            <InvoiceTable invoices={filteredInvoices} />
          )}
        </CardBody>
      </Card>
    </MainLayout>
  );
}
