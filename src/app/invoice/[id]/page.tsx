'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LineItemsTable } from '@/components/invoices/LineItemsTable';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { ConfidenceIndicator } from '@/components/ui/ConfidenceIndicator';
import { DownloadMenu } from '@/components/invoices/DownloadMenu';
import { Invoice } from '@/types';
import { getInvoiceById } from '@/lib/api';
import { format } from 'date-fns';

// Helper function to format field names from camelCase/PascalCase to spaced Title Case
const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInvoiceById(invoiceId);
        console.log('Fetched invoice:', data);
        console.log('Invoice items:', data.items);
        setInvoice(data);
        setEditData(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load invoice';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleSave = () => {
    toast.success('Invoice updated successfully');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3" />
          <div className="h-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (error || !invoice) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-lg font-semibold text-slate-900 mb-2">
            {error || 'Invoice not found'}
          </p>
          <p className="text-slate-600 mb-6">The invoice you're looking for could not be loaded.</p>
          <Button variant="primary" onClick={() => router.push('/invoices')}>
            ← Back to Invoices
          </Button>
        </div>
      </MainLayout>
    );
  }

  const lowConfidenceFields = invoice.extractionConfidence
    ? Object.entries(invoice.extractionConfidence).filter(([_, conf]) => conf < 0.7)
    : [];

  return (
    <MainLayout>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/invoices')}
            className="mb-4"
          >
            ← Back to Invoices
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-slate-600 mt-1">
            Extracted on {format(new Date(invoice.extractedAt || ''), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <StatusBadge status={invoice.status || 'extracted'} />
          {!isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </Button>
              <DownloadMenu invoice={invoice} />
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditData(invoice);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Low Confidence Alert */}
      {lowConfidenceFields.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-50">
          <CardBody className="p-4">
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-orange-900">Fields Requiring Review</p>
                <p className="text-sm text-orange-800 mt-1">
                  {lowConfidenceFields.length} field(s) have low confidence scores and may require manual review.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏢</span>
                Vendor Information
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Vendor Name</label>
                  {isEditing ? (
                    <Input
                      value={editData.vendorName || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, vendorName: e.target.value })
                      }
                    />
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {invoice.vendorName}
                      </p>
                      {invoice.extractionConfidence?.vendorName && (
                        <div className="mt-2">
                          <ConfidenceIndicator
                            confidence={invoice.extractionConfidence.vendorName}
                            fieldName="Vendor Name"
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData.vendorEmail || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, vendorEmail: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {invoice.vendorEmail || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Phone</label>
                {isEditing ? (
                  <Input
                    value={editData.vendorPhone || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, vendorPhone: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {invoice.vendorPhone || 'N/A'}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Additional Invoice Details */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span>
                Invoice Details
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {invoice.purchaseOrder && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Purchase Order</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{invoice.purchaseOrder}</p>
                  </div>
                )}
                {invoice.billingAddressRecipient && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Billing Recipient</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{invoice.billingAddressRecipient}</p>
                  </div>
                )}
                {invoice.subTotal !== undefined && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Subtotal</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {invoice.currency} {invoice.subTotal.toFixed(2)}
                    </p>
                  </div>
                )}
                {invoice.shippingCost !== undefined && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Shipping Cost</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {invoice.currency} {invoice.shippingCost.toFixed(2)}
                    </p>
                  </div>
                )}
                {invoice.amountDue !== undefined && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase">Amount Due</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {invoice.currency} {invoice.amountDue.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📦</span>
                Line Items
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <LineItemsTable items={invoice.items} />
            </CardBody>
          </Card>

          {/* Notes / Shipping Address */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📝</span>
                Notes
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {isEditing ? (
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={editData.notes || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, notes: e.target.value })
                  }
                />
              ) : (
                <div>
                  {invoice.shippingAddress && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Shipping Address</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{invoice.shippingAddress}</p>
                    </div>
                  )}
                  {!invoice.shippingAddress && (
                    <p className="text-slate-700">No notes</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📊</span>
                Summary
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase">Invoice Date</span>
                <p className="font-semibold text-slate-900">
                  {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 uppercase">Due Date</span>
                <p className="font-semibold text-slate-900">
                  {invoice.dueDate
                    ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                    : 'N/A'}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.currency} {(invoice.totalAmount - (invoice.taxAmount || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-600">Tax</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.currency} {(invoice.taxAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {invoice.currency} {invoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <StatusBadge status={invoice.status || 'extracted'} className="w-full justify-center" />
            </CardBody>
          </Card>

          {/* Extraction Quality */}
          {invoice.extractionConfidence && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>🎯</span>
                  Extraction Quality
                </h2>
              </CardHeader>
              <CardBody className="p-6 space-y-3">
                {Object.entries(invoice.extractionConfidence)
                  .map(([field, confidence]) => (
                    <div key={field}>
                      <p className="text-xs font-medium text-slate-600 mb-1">{formatFieldName(field)}</p>
                      <ConfidenceIndicator confidence={confidence} fieldName={formatFieldName(field)} size="md" />
                    </div>
                  ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
