'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useInvoices } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Invoice } from '@/types';
import Link from 'next/link';

interface VendorData {
  name: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
  lastInvoiceDate: string;
}

export default function VendorsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { invoices, fetchAllInvoices } = useInvoices();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState<VendorData[]>([]);

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
      aggregateVendors(invoices);
    }
  }, [invoices]);

  const aggregateVendors = (invoiceList: Invoice[]) => {
    const vendorMap = new Map<string, { count: number; total: number; dates: string[] }>();

    invoiceList.forEach((inv) => {
      const existing = vendorMap.get(inv.vendorName) || { count: 0, total: 0, dates: [] };
      vendorMap.set(inv.vendorName, {
        count: existing.count + 1,
        total: existing.total + inv.totalAmount,
        dates: [...existing.dates, inv.invoiceDate],
      });
    });

    const vendorList: VendorData[] = Array.from(vendorMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        totalAmount: data.total,
        averageAmount: data.total / data.count,
        lastInvoiceDate: data.dates.sort().reverse()[0],
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    setVendors(vendorList);
    setFilteredVendors(vendorList);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const results = vendors.filter((vendor) => vendor.name.toLowerCase().includes(lowerQuery));
    setFilteredVendors(results);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Vendor Management</h1>
        <p className="text-slate-600">Track and manage all your vendors</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vendors..."
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
              onClick={() => {
                setSearchQuery('');
                setFilteredVendors(vendors);
              }}
            >
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="text-5xl mb-3">🏢</div>
            <p className="text-lg font-semibold text-slate-900 mb-1">No vendors found</p>
            <p className="text-sm text-slate-600">Upload invoices to see vendor data</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.name} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{vendor.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Invoices</span>
                      <span className="font-semibold text-slate-900">{vendor.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total Spending</span>
                      <span className="font-semibold text-green-600">${vendor.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Average Invoice</span>
                      <span className="font-semibold text-blue-600">${vendor.averageAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Last Invoice</span>
                      <span className="text-sm text-slate-700">{vendor.lastInvoiceDate.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/invoices?search=${encodeURIComponent(vendor.name)}`}>
                  <Button variant="secondary" className="w-full text-center">
                    View Invoices →
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {vendors.length > 0 && (
        <Card className="mt-8 bg-slate-50 border-0">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Vendors</p>
                <p className="text-3xl font-bold text-slate-900">{vendors.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Top Vendor</p>
                <p className="text-lg font-bold text-slate-900">{vendors[0]?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Average Invoices/Vendor</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(invoices.length / vendors.length).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Most Active</p>
                <p className="text-lg font-bold text-slate-900">
                  {Math.max(...vendors.map((v) => v.count))} invoices
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </MainLayout>
  );
}
