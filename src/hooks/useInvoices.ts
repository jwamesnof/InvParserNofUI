import { useState, useCallback } from 'react';
import { Invoice } from '@/types';
import * as apiService from '@/lib/api';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all invoices from localStorage on mount
  const fetchAllInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAllInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvoicesByVendor = useCallback(async (vendorName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getInvoicesByVendor(vendorName);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  return { invoices, loading, error, fetchAllInvoices, fetchInvoicesByVendor };
}

export function useInvoice(invoiceId: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  return { invoice, loading, error, fetchInvoice };
}

export function useExtractInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (file: File): Promise<Invoice | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.extractInvoice(file);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to extract invoice';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, extract };
}
