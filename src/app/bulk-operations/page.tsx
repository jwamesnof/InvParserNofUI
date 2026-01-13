'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Invoice } from '@/types';
import { logActivity } from '@/lib/activity-logger';
import toast, { Toaster } from 'react-hot-toast';

export default function BulkOperationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

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
      if (statusFilter === 'all') {
        setFilteredInvoices(invoices);
      } else {
        setFilteredInvoices(invoices.filter((inv) => inv.status === statusFilter));
      }
    }
  }, [invoices, statusFilter]);

  const toggleSelectInvoice = (id: string) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInvoices(newSelected);
  };

  const selectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map((inv) => inv.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedInvoices.size === 0) {
      toast.error('No invoices selected');
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedInvoices.size} invoice(s)? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      const stored = localStorage.getItem('invoices');
      let invoices = stored ? JSON.parse(stored) : {};

      let archivedInvoices = [];
      try {
        const archived = localStorage.getItem('archivedInvoices');
        archivedInvoices = archived ? JSON.parse(archived) : [];
      } catch {
        archivedInvoices = [];
      }

      selectedInvoices.forEach((id) => {
        if (invoices[id]) {
          archivedInvoices.push({
            ...invoices[id],
            deletedAt: new Date().toISOString(),
          });
          delete invoices[id];
        }
      });

      localStorage.setItem('invoices', JSON.stringify(invoices));
      localStorage.setItem('archivedInvoices', JSON.stringify(archivedInvoices));
      
      logActivity('Bulk Delete', {
        details: `Deleted ${selectedInvoices.size} invoice(s) in bulk operation`,
      });
      
      setSelectedInvoices(new Set());
      fetchAllInvoices();
      toast.success(`${selectedInvoices.size} invoice(s) deleted`);
    } catch (error) {
      toast.error('Failed to delete invoices');
    }
  };

  const handleBulkExport = () => {
    if (selectedInvoices.size === 0) {
      toast.error('No invoices selected');
      return;
    }

    const toExport = filteredInvoices.filter((inv) => selectedInvoices.has(inv.id));
    const csv = [
      ['Invoice Number', 'Vendor', 'Date', 'Amount', 'Status'],
      ...toExport.map((inv) => [
        inv.invoiceNumber,
        inv.vendorName,
        inv.invoiceDate,
        inv.totalAmount,
        inv.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    logActivity('Bulk Export', {
      details: `Exported ${selectedInvoices.size} invoice(s) to CSV`,
    });
    
    toast.success(`Exported ${selectedInvoices.size} invoice(s)`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Bulk Operations</h1>
        <p className="text-slate-600">Perform actions on multiple invoices at once</p>
      </div>

      {/* Filter & Actions */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="extracted">Extracted</option>
                <option value="needs_review">Needs Review</option>
                <option value="processing">Processing</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={selectAll}>
                {selectedInvoices.size === filteredInvoices.length && filteredInvoices.length > 0
                  ? '☐ Deselect All'
                  : '☑ Select All'}
              </Button>
            </div>
          </div>

          {selectedInvoices.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <p className="text-sm text-blue-700 font-medium">{selectedInvoices.size} invoice(s) selected</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-2">
            <Button
              variant="secondary"
              onClick={handleBulkExport}
              disabled={selectedInvoices.size === 0}
            >
              📊 Bulk Export
            </Button>
            <Button
              variant="secondary"
              onClick={handleBulkDelete}
              disabled={selectedInvoices.size === 0}
              className="hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              🗑️ Bulk Delete
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">
            Invoices ({filteredInvoices.length})
          </h2>
        </CardHeader>
        <CardBody className="p-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-lg font-semibold text-slate-900 mb-1">No invoices found</p>
              <p className="text-sm text-slate-600">Upload invoices to see bulk operations</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                  onClick={() => toggleSelectInvoice(invoice.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedInvoices.has(invoice.id)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{invoice.vendorName}</p>
                    <p className="text-sm text-slate-600">{invoice.invoiceNumber}</p>
                  </div>
                  <p className="font-semibold text-slate-900">${invoice.totalAmount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </MainLayout>
  );
}
