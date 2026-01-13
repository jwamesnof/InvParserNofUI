'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { logActivity } from '@/lib/activity-logger';
import toast, { Toaster } from 'react-hot-toast';

interface ArchivedInvoice {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  totalAmount: number;
  invoiceDate: string;
  deletedAt: string;
}

export default function ArchivePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [archivedInvoices, setArchivedInvoices] = useState<ArchivedInvoice[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadArchivedInvoices();
    }
  }, [isAuthenticated, router]);

  const loadArchivedInvoices = () => {
    try {
      const stored = localStorage.getItem('archivedInvoices');
      if (stored) {
        setArchivedInvoices(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load archived invoices:', error);
    }
  };

  const handleRestore = async (invoiceId: string) => {
    try {
      const archived = archivedInvoices.find((inv) => inv.id === invoiceId);
      if (!archived) return;

      // Get current invoices
      const stored = localStorage.getItem('invoices');
      const invoices = stored ? JSON.parse(stored) : [];

      // Restore the invoice
      const invoiceData = localStorage.getItem(`invoice_backup_${invoiceId}`);
      if (invoiceData) {
        invoices[invoiceId] = JSON.parse(invoiceData);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        // Remove from archive
        const updatedArchived = archivedInvoices.filter((inv) => inv.id !== invoiceId);
        localStorage.setItem('archivedInvoices', JSON.stringify(updatedArchived));
        setArchivedInvoices(updatedArchived);

        logActivity('Invoice Restored', {
          invoiceId: invoiceId,
          invoiceNumber: archived.invoiceNumber,
          details: `Restored from archive`,
        });

        localStorage.removeItem(`invoice_backup_${invoiceId}`);
        toast.success('Invoice restored successfully');
      }
    } catch (error) {
      toast.error('Failed to restore invoice');
      console.error('Restore error:', error);
    }
  };

  const handlePermanentDelete = (invoiceId: string) => {
    const confirm = window.confirm(
      'Permanently delete this archived invoice? This action cannot be undone.'
    );
    if (!confirm) return;

    try {
      const updatedArchived = archivedInvoices.filter((inv) => inv.id !== invoiceId);
      localStorage.setItem('archivedInvoices', JSON.stringify(updatedArchived));
      
      const archived = archivedInvoices.find((inv) => inv.id === invoiceId);
      logActivity('Invoice Permanently Deleted', {
        invoiceId: invoiceId,
        invoiceNumber: archived?.invoiceNumber,
        details: 'Permanently deleted from archive',
      });
      
      localStorage.removeItem(`invoice_backup_${invoiceId}`);
      setArchivedInvoices(updatedArchived);
      toast.success('Invoice permanently deleted');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Archive</h1>
        <p className="text-slate-600">Manage archived and deleted invoices</p>
      </div>

      {archivedInvoices.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="text-lg font-semibold text-slate-900 mb-1">No archived invoices</p>
            <p className="text-sm text-slate-600">Deleted invoices will appear here</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {archivedInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{invoice.vendorName}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Invoice: {invoice.invoiceNumber}</p>
                      <p>Amount: ${invoice.totalAmount.toFixed(2)}</p>
                      <p>Deleted: {new Date(invoice.deletedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleRestore(invoice.id)}>
                      ↩️ Restore
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handlePermanentDelete(invoice.id)}
                      className="hover:bg-red-50 hover:text-red-700"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
