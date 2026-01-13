import { Invoice, InvoiceItem, InvoiceStatus } from '@/types';

// Backend response types
interface BackendInvoiceItem {
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
}

interface BackendExtractData {
  VendorName: string;
  InvoiceId: string;
  InvoiceDate: string;
  InvoiceTotal: number;
  Items: BackendInvoiceItem[];
  ShippingAddress?: string;
  [key: string]: any; // Allow other fields
}

interface BackendExtractResponse {
  confidence: number;
  data: BackendExtractData;
  dataConfidence: Record<string, number>;
  predictionTime: number;
}

/**
 * Determines invoice status based on extraction confidence
 * Confidence < 0.7 indicates needs review
 */
const getInvoiceStatus = (confidence: number): InvoiceStatus => {
  if (confidence < 0.7) {
    return 'needs_review';
  }
  return 'extracted';
};

/**
 * Transforms backend response format to frontend Invoice format
 * Maps PascalCase backend fields to camelCase frontend fields
 * Includes extraction confidence scores for UI display
 */
export const adaptBackendInvoice = (backendResponse: any): Invoice => {
  console.log('Raw backend response:', backendResponse);
  
  // Handle different response formats from backend
  let data = backendResponse?.data;
  let confidence = backendResponse?.confidence || 0.8;
  let dataConfidence = backendResponse?.dataConfidence || {};
  
  // If response is the data directly (not wrapped)
  if (!data && backendResponse?.VendorName) {
    data = backendResponse;
  }
  
  // Ensure data exists
  if (!data) {
    console.warn('No data found in backend response:', backendResponse);
    data = {};
  }
  
  console.log('Parsed data:', data);
  console.log('Confidence:', confidence);
  console.log('DataConfidence object:', dataConfidence);
  console.log('Items from data:', data.Items);
  console.log('Data.items (lowercase):', data.items);
  
  // Transform items array with confidence scores
  const items: InvoiceItem[] = (data.Items || data.items || [])
    .map((item: any, index: number) => {
      // Try different key patterns for line item confidence
      const itemConfidenceKeys = [
        `Items[${index}]`,
        `Items[${index}].Description`,
        `items[${index}]`,
        `items[${index}].description`,
        `item_${index}`,
        `line_item_${index}`,
      ];
      
      let itemConfidence = confidence; // fallback to overall confidence
      for (const key of itemConfidenceKeys) {
        if (dataConfidence?.[key] !== undefined) {
          itemConfidence = dataConfidence[key];
          console.log(`Found confidence for item ${index} using key "${key}":`, itemConfidence);
          break;
        }
      }
      
      // Extract and clean description
      let description = item.Description || item.description || item.LineDescription || item.line_description || '';
      // Clean up corrupted descriptions - if it starts with single letters followed by "ishing", it's corrupted
      if (description && /^[a-z]ishing/.test(description)) {
        // Try to recover the full description from the Name field if available
        const nameField = item.Name || item.name || item.LineName || item.line_name || '';
        if (nameField && nameField.length > description.length) {
          description = nameField;
        }
      }
      
      const quantity = item.Quantity || item.quantity || item.LineQuantity || item.line_quantity || 0;
      const unitPrice = item.UnitPrice || item.unitPrice || item.unit_price || item.LineUnitPrice || item.line_unit_price || 0;
      const totalPrice = item.Amount || item.amount || item.total_price || item.LineAmount || item.line_amount || 0;
      
      const invoiceItem: InvoiceItem = {
        id: `item-${index}`,
        description: description.trim(),
        quantity,
        unitPrice,
        totalPrice,
        confidence: itemConfidence,
      };
      
      console.log(`Item ${index}:`, invoiceItem);
      return invoiceItem;
    })
    // Filter out invalid items (quantity 0, empty description, or both zero amounts)
    .filter((item: InvoiceItem) => {
      const isValid = item.quantity > 0 || (item.description && item.description.length > 2) || item.totalPrice > 0;
      if (!isValid) {
        console.log(`Filtering out invalid item: ${item.description || 'empty'}`);
      }
      return isValid;
    });

  console.log('Total items created:', items.length);
  console.log('All items array:', items);

  // Create extraction confidence map for all fields
  // Use dataConfidence values directly from backend response
  // These are the actual confidence scores for each field from the OCI AI service
  const extractionConfidence: Record<string, number> = { ...dataConfidence };
  
  console.log('Backend dataConfidence:', dataConfidence);
  console.log('Extraction confidence map (from backend):', extractionConfidence);

  // Create the transformed invoice
  const invoice: Invoice = {
    id: data.InvoiceId || data.invoice_id || `invoice-${Date.now()}`,
    vendorName: data.VendorName || data.vendor_name || 'Unknown Vendor',
    invoiceNumber: data.InvoiceId || data.invoice_id || 'N/A',
    invoiceDate: data.InvoiceDate || data.invoice_date || new Date().toISOString().split('T')[0],
    totalAmount: data.InvoiceTotal || data.total_amount || data.invoice_total || 0,
    currency: '$',
    items,
    notes: data.ShippingAddress || data.shipping_address || undefined,
    extractedAt: new Date().toISOString(),
    status: getInvoiceStatus(confidence),
    extractionConfidence,
    // Additional fields
    billingAddressRecipient: data.BillingAddressRecipient || data.billing_address_recipient || undefined,
    shippingCost: data.ShippingCost || data.shipping_cost || undefined,
    purchaseOrder: data.PurchaseOrder || data.purchase_order || undefined,
    subTotal: data.SubTotal || data.sub_total || undefined,
    amountDue: data.AmountDue || data.amount_due || undefined,
    shippingAddress: data.ShippingAddress || data.shipping_address || undefined,
  };

  console.log('Transformed invoice:', invoice);
  return invoice;
};

/**
 * Wraps the adapted invoice response in the frontend's expected format
 */
export const wrapBackendResponse = (
  backendResponse: BackendExtractResponse
): { success: boolean; data: Invoice; message?: string } => {
  return {
    success: true,
    data: adaptBackendInvoice(backendResponse),
  };
};
