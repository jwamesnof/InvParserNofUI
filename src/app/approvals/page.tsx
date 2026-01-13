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

interface ApprovalInvoice extends Invoice {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalNotes?: string;
}

export default function ApprovalsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ApprovalInvoice | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

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
      const pending = invoices
        .filter((inv) => inv.status === 'needs_review')
        .map((inv) => ({
          ...inv,
          approvalStatus: 'pending' as const,
        }));
      setPendingApprovals(pending);
    }
  }, [invoices]);

  const handleApprove = (invoice: ApprovalInvoice) => {
    if (!selectedInvoice || selectedInvoice.id !== invoice.id) return;

    try {
      const stored = localStorage.getItem('invoices');
      const invoicesData = stored ? JSON.parse(stored) : {};
      if (invoicesData[invoice.id]) {
        invoicesData[invoice.id].status = 'extracted';
        invoicesData[invoice.id].approvalNotes = approvalNotes;
        localStorage.setItem('invoices', JSON.stringify(invoicesData));
      }

      logActivity('Invoice Approved', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        details: `Approved by admin. Notes: ${approvalNotes || 'None'}`,
      });

      setPendingApprovals((prev) => prev.filter((inv) => inv.id !== invoice.id));
      setSelectedInvoice(null);
      setApprovalNotes('');
      toast.success('Invoice approved');
      fetchAllInvoices();
    } catch (error) {
      toast.error('Failed to approve invoice');
    }
  };

  const handleReject = (invoice: ApprovalInvoice) => {
    if (!selectedInvoice || selectedInvoice.id !== invoice.id) return;

    try {
      const stored = localStorage.getItem('invoices');
      const invoicesData = stored ? JSON.parse(stored) : {};
      if (invoicesData[invoice.id]) {
        invoicesData[invoice.id].status = 'error';
        invoicesData[invoice.id].approvalNotes = approvalNotes;
        localStorage.setItem('invoices', JSON.stringify(invoicesData));
      }

      logActivity('Invoice Rejected', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        details: `Rejected by admin. Notes: ${approvalNotes || 'None'}`,
      });

      setPendingApprovals((prev) => prev.filter((inv) => inv.id !== invoice.id));
      setSelectedInvoice(null);
      setApprovalNotes('');
      toast.success('Invoice rejected');
      fetchAllInvoices();
    } catch (error) {
      toast.error('Failed to reject invoice');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Invoice Approvals</h1>
        <p className="text-slate-600">Review and approve invoices with low confidence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Invoices List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">
                Pending ({pendingApprovals.length})
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-sm text-slate-600">All invoices approved!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingApprovals.map((invoice) => (
                    <div
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedInvoice?.id === invoice.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium text-sm text-slate-900">{invoice.vendorName}</p>
                      <p className="text-xs text-slate-600">{invoice.invoiceNumber}</p>
                      <p className="text-xs font-semibold text-orange-600 mt-1">⚠️ Needs Review</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Invoice Details & Approval */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="border-b pb-4">
                    <p className="text-xs text-slate-600">Vendor</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.vendorName}</p>
                  </div>

                  <div className="border-b pb-4">
                    <p className="text-xs text-slate-600">Invoice Number</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.invoiceNumber}</p>
                  </div>

                  <div className="border-b pb-4">
                    <p className="text-xs text-slate-600">Amount</p>
                    <p className="font-bold text-green-600">${selectedInvoice.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="border-b pb-4">
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="font-bold text-slate-900">{selectedInvoice.invoiceDate}</p>
                  </div>
                </div>

                {/* Approval Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Approval Notes
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add notes for approval or rejection..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Approval Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(selectedInvoice)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleReject(selectedInvoice)}
                    className="flex-1 hover:bg-red-50 hover:text-red-700"
                  >
                    ✗ Reject
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <div className="text-5xl mb-3">👆</div>
                <p className="text-lg font-semibold text-slate-900 mb-1">Select an invoice</p>
                <p className="text-sm text-slate-600">Click on an invoice to review and approve</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
