'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { Invoice } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as apiService from '@/lib/api';

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const { invoices, loading, error, fetchAllInvoices } = useInvoices();
  const router = useRouter();

  // Fetch all invoices on component mount
  useEffect(() => {
    fetchAllInvoices();
  }, [fetchAllInvoices]);

  // Load invoices on component mount
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      setFilteredInvoices(invoices);
    }
  }, [invoices]);

  // General search across multiple fields (case-insensitive)
  const handleSearch = () => {
    applyFilters();
  };

  // Apply all filters and search
  const applyFilters = () => {
    let results = invoices || [];

    // Search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter((invoice) => {
        return (
          invoice.vendorName.toLowerCase().includes(lowerQuery) ||
          invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
          invoice.invoiceDate.toLowerCase().includes(lowerQuery) ||
          (invoice.billingAddressRecipient?.toLowerCase().includes(lowerQuery) || false)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      results = results.filter((invoice) => invoice.status === statusFilter);
    }

    // Amount range filter
    if (minAmount) {
      results = results.filter((invoice) => invoice.totalAmount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      results = results.filter((invoice) => invoice.totalAmount <= parseFloat(maxAmount));
    }

    setFilteredInvoices(results);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setFilteredInvoices(invoices || []);
  };

  const handleRowClick = (invoice: Invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleEdit = (invoice: Invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleDelete = async (invoiceId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await apiService.deleteInvoice(invoiceId);
      toast.success('Invoice deleted successfully');
      // Refresh the list
      await fetchAllInvoices();
    } catch (error) {
      toast.error('Failed to delete invoice');
      console.error('Delete error:', error);
    }
  };

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">All Invoices</h1>
        <p className="text-slate-600">View and manage your extracted invoices</p>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6">
        <CardBody className="p-6">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices (vendor, invoice number, date, etc)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▼' : '▶'} Filters
            </Button>
          </div>

          {/* Expandable Filters Section */}
          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="all">All Statuses</option>
                    <option value="extracted">Extracted</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="processing">Processing</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* Min Amount Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min Amount ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>

                {/* Max Amount Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Amount ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="999999.99"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Action Buttons */}
              <div className="flex gap-2">
                <Button variant="primary" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="secondary" onClick={handleResetFilters}>
                  Reset All
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Invoices ({filteredInvoices.length})
            </h2>
            <Link href="/upload">
              <Button variant="primary" size="sm">
                + Upload New
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
              {error}
            </div>
          )}
          <InvoiceTable
            invoices={filteredInvoices || invoices}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={loading}
          />
        </CardBody>
      </Card>
    </MainLayout>
  );
}
