export type InvoiceStatus = 'uploaded' | 'processing' | 'extracted' | 'needs_review';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence?: number;
}

export interface Invoice {
  id: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  currency?: string;
  taxAmount?: number;
  items: InvoiceItem[];
  notes?: string;
  extractedAt?: string;
  documentUrl?: string;
  status?: InvoiceStatus;
  extractionConfidence?: Record<string, number>;
  // Additional fields from backend
  billingAddressRecipient?: string;
  shippingCost?: number;
  purchaseOrder?: string;
  subTotal?: number;
  amountDue?: number;
  shippingAddress?: string;
}

export interface ExtractResponse {
  success: boolean;
  data: Invoice;
  message?: string;
}

export interface InvoicesListResponse {
  success: boolean;
  data: Invoice[];
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export interface DashboardMetrics {
  totalInvoices: number;
  invoicesThisMonth: number;
  pendingReview: number;
  averageInvoiceValue: number;
  topVendor: { name: string; count: number } | null;
}
