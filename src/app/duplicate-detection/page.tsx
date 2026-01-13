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

interface DuplicateGroup {
  id: string;
  invoices: Invoice[];
  similarity: number;
}

export default function DuplicateDetectionPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [merging, setMerging] = useState(false);

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
      detectDuplicates(invoices);
    }
  }, [invoices]);

  const detectDuplicates = (invoiceList: Invoice[]) => {
    const groups: DuplicateGroup[] = [];
    const checked = new Set<string>();

    for (let i = 0; i < invoiceList.length; i++) {
      if (checked.has(invoiceList[i].id)) continue;

      const group: Invoice[] = [invoiceList[i]];
      checked.add(invoiceList[i].id);

      for (let j = i + 1; j < invoiceList.length; j++) {
        if (checked.has(invoiceList[j].id)) continue;

        const similarity = calculateSimilarity(invoiceList[i], invoiceList[j]);
        if (similarity > 0.8) {
          group.push(invoiceList[j]);
          checked.add(invoiceList[j].id);
        }
      }

      if (group.length > 1) {
        groups.push({
          id: `group_${i}`,
          invoices: group,
          similarity: 0.9,
        });
      }
    }

    setDuplicates(groups);
  };

  const calculateSimilarity = (inv1: Invoice, inv2: Invoice): number => {
    let matches = 0;
    let total = 0;

    // Compare vendor (weight 0.3)
    total += 0.3;
    if (inv1.vendorName.toLowerCase() === inv2.vendorName.toLowerCase()) {
      matches += 0.3;
    }

    // Compare invoice number (weight 0.3)
    total += 0.3;
    if (inv1.invoiceNumber === inv2.invoiceNumber) {
      matches += 0.3;
    }

    // Compare date (weight 0.2)
    total += 0.2;
    if (inv1.invoiceDate === inv2.invoiceDate) {
      matches += 0.2;
    }

    // Compare amount (weight 0.2, within 1%)
    total += 0.2;
    const amountDiff = Math.abs(inv1.totalAmount - inv2.totalAmount) / inv1.totalAmount;
    if (amountDiff < 0.01) {
      matches += 0.2;
    }

    return matches / total;
  };

  const handleMergeDuplicates = async (group: DuplicateGroup) => {
    const duplicateIds = group.invoices.slice(1).map((inv) => inv.id);

    setMerging(true);

    try {
      const stored = localStorage.getItem('invoices');
      let invoices = stored ? JSON.parse(stored) : {};

      // Archive duplicates
      let archivedInvoices = [];
      try {
        const archived = localStorage.getItem('archivedInvoices');
        archivedInvoices = archived ? JSON.parse(archived) : [];
      } catch {
        archivedInvoices = [];
      }

      duplicateIds.forEach((id) => {
        if (invoices[id]) {
          archivedInvoices.push({
            ...invoices[id],
            deletedAt: new Date().toISOString(),
            reason: 'Merged as duplicate',
          });
          delete invoices[id];
        }
      });

      localStorage.setItem('invoices', JSON.stringify(invoices));
      localStorage.setItem('archivedInvoices', JSON.stringify(archivedInvoices));

      logActivity('Duplicates Merged', {
        invoiceId: group.invoices[0].id,
        invoiceNumber: group.invoices[0].invoiceNumber,
        details: `Merged ${duplicateIds.length} duplicate invoice(s). Master: ${group.invoices[0].invoiceNumber}`,
      });

      // Remove merged group from duplicates list
      setDuplicates((prev) => prev.filter((g) => g.id !== group.id));
      setSelectedGroup(null);

      await fetchAllInvoices();
      toast.success(`Merged ${duplicateIds.length} duplicate(s) into master invoice`);
    } catch (error) {
      toast.error('Failed to merge duplicates');
    } finally {
      setMerging(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Duplicate Detection</h1>
        <p className="text-slate-600">Find and merge duplicate invoices</p>
      </div>

      {/* Summary */}
      <Card className="mb-6 bg-blue-50 border-0">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Potential Duplicates Found</p>
              <p className="text-4xl font-bold text-slate-900">
                {duplicates.length > 0
                  ? duplicates.reduce((sum, g) => sum + (g.invoices.length - 1), 0)
                  : 0}
              </p>
            </div>
            <div className="text-4xl">🔍</div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Duplicate Groups List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-slate-900">Duplicate Groups</h2>
            </CardHeader>
            <CardBody className="p-6">
              {duplicates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-sm text-slate-600">No duplicates detected!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {duplicates.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedGroup?.id === group.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium text-sm text-slate-900">
                        {group.invoices[0]?.vendorName}
                      </p>
                      <p className="text-xs text-slate-600">
                        {group.invoices.length} invoices (Similarity: {(group.similarity * 100).toFixed(0)}%)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Duplicate Details */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-slate-900">Duplicate Group Details</h2>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4 mb-6">
                  {selectedGroup.invoices.map((invoice, idx) => (
                    <div key={invoice.id} className="border border-slate-200 rounded p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          {idx === 0 && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded mb-2">
                              MASTER
                            </span>
                          )}
                          <p className="font-medium text-slate-900">{invoice.vendorName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-600">Invoice #</p>
                          <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Date</p>
                          <p className="font-semibold text-slate-900">{invoice.invoiceDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Amount</p>
                          <p className="font-semibold text-slate-900">${invoice.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Status</p>
                          <p className="font-semibold text-slate-900">{invoice.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleMergeDuplicates(selectedGroup)}
                  disabled={merging}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {merging ? 'Merging...' : '✓ Merge Duplicates'}
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <div className="text-5xl mb-3">👆</div>
                <p className="text-lg font-semibold text-slate-900 mb-1">Select a group</p>
                <p className="text-sm text-slate-600">Click on a duplicate group to review and merge</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
