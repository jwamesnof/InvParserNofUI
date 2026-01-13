import axios, { AxiosError } from 'axios';
import { Invoice } from '@/types';
import { adaptBackendInvoice } from './adapter';
import { logActivity } from './activity-logger';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Backend response types
interface BackendExtractResponse {
  confidence: number;
  data: {
    VendorName: string;
    InvoiceId: string;
    InvoiceDate: string;
    InvoiceTotal: number;
    Items: Array<{ Description: string; Quantity: number; UnitPrice: number; Amount: number }>;
    ShippingAddress?: string;
    [key: string]: any;
  };
  dataConfidence: Record<string, number>;
  predictionTime: number;
}

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const errorData = axiosError.response?.data as any;
    
    // Log error details for debugging
    console.error('API Error Details:', {
      status: axiosError.response?.status,
      data: errorData,
      message: axiosError.message,
    });
    
    // Try different error message sources
    if (errorData?.detail) {
      if (Array.isArray(errorData.detail)) {
        // Validation error from FastAPI
        return errorData.detail.map((err: any) => err.msg).join(', ');
      }
      return errorData.detail;
    }
    if (errorData?.message) {
      return errorData.message;
    }
    return `Error (${axiosError.response?.status}): ${axiosError.message || 'An error occurred'}`;
  }
  console.error('API Error:', error);
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
};

// Extract invoice from file
export const extractInvoice = async (file: File): Promise<Invoice> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('Uploading file:', { name: file.name, type: file.type, size: file.size });
    console.log('API Base URL:', API_BASE_URL);
    
    // Don't set Content-Type header manually - let axios/browser set it with boundary
    const response = await apiClient.post<BackendExtractResponse>('/extract', formData);

    console.log('Backend response:', response.data);
    // Transform backend response using adapter
    const invoice = adaptBackendInvoice(response.data);
    
    // Log activity
    logActivity('Invoice Extracted', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      details: `Extracted from ${file.name}`,
    });
    
    // Store invoice in localStorage for later retrieval
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('invoices');
        const invoices = stored ? JSON.parse(stored) : [];
        invoices[invoice.id] = invoice;
        localStorage.setItem('invoices', JSON.stringify(invoices));
        console.log('Invoice stored in localStorage:', invoice.id);
      } catch (e) {
        console.warn('Failed to store invoice in localStorage:', e);
      }
    }
    
    return invoice;
  } catch (error) {
    const errorMsg = handleApiError(error);
    console.error('Extract failed:', errorMsg);
    throw new Error(errorMsg);
  }
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId: string): Promise<Invoice> => {
  try {
    console.log('Fetching invoice by ID:', invoiceId);
    
    // Check localStorage first
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('invoices');
        if (stored) {
          const invoices = JSON.parse(stored);
          if (invoices[invoiceId]) {
            console.log('Invoice found in localStorage:', invoiceId);
            return invoices[invoiceId];
          }
        }
      } catch (e) {
        console.warn('Failed to retrieve from localStorage:', e);
      }
    }
    
    // If not in localStorage, fetch from backend
    console.log('Invoice not in localStorage, fetching from backend');
    const response = await apiClient.get<any>(`/invoice/${invoiceId}`);
    console.log('Invoice by ID raw response:', response.data);
    
    // Transform backend response using adapter
    const invoice = adaptBackendInvoice(response.data);
    console.log('Invoice by ID transformed invoice:', invoice);
    
    // Store in localStorage for future use
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('invoices');
        const invoices = stored ? JSON.parse(stored) : [];
        invoices[invoiceId] = invoice;
        localStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (e) {
        console.warn('Failed to store invoice in localStorage:', e);
      }
    }
    
    return invoice;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Get all invoices from localStorage
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const stored = localStorage.getItem('invoices');
    if (!stored) {
      return [];
    }
    
    const invoicesObj = JSON.parse(stored);
    const invoices = Object.values(invoicesObj).filter((inv): inv is Invoice => {
      return inv !== null && typeof inv === 'object' && 'id' in inv;
    });
    
    console.log('Loaded all invoices from localStorage:', invoices.length);
    return invoices;
  } catch (error) {
    console.warn('Failed to retrieve invoices from localStorage:', error);
    return [];
  }
};

// Get invoices by vendor
export const getInvoicesByVendor = async (vendorName: string): Promise<Invoice[]> => {
  try {
    const response = await apiClient.get<BackendExtractResponse[]>(
      `/invoices/vendor/${encodeURIComponent(vendorName)}`
    );

    // Handle both single response and array of responses
    const responseData = Array.isArray(response.data) ? response.data : [response.data];
    
    // Transform all responses using adapter
    return responseData.map(item => adaptBackendInvoice(item));
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Delete invoice from localStorage
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot delete invoice on server side');
    }

    const stored = localStorage.getItem('invoices');
    if (!stored) {
      throw new Error('Invoice not found');
    }

    const invoices = JSON.parse(stored);
    if (invoices[invoiceId]) {
      const deletedInvoice = invoices[invoiceId];
      
      // Log activity before deletion
      logActivity('Invoice Deleted', {
        invoiceId: invoiceId,
        invoiceNumber: deletedInvoice.invoiceNumber,
        details: `Deleted invoice from ${deletedInvoice.vendorName}`,
      });
      
      delete invoices[invoiceId];
      localStorage.setItem('invoices', JSON.stringify(invoices));
      console.log('Invoice deleted from localStorage:', invoiceId);
    } else {
      throw new Error('Invoice not found');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};

export default apiClient;
