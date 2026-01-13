import { Invoice } from '@/types';

/**
 * Download invoice as JSON file
 */
export const downloadAsJSON = (invoice: Invoice) => {
  const dataStr = JSON.stringify(invoice, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoiceNumber}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download invoice as CSV file
 */
export const downloadAsCSV = (invoice: Invoice) => {
  const rows: string[] = [];
  
  // Header section
  rows.push('INVOICE DETAILS');
  rows.push(`Invoice Number,${invoice.invoiceNumber}`);
  rows.push(`Vendor Name,${invoice.vendorName}`);
  rows.push(`Invoice Date,${invoice.invoiceDate}`);
  rows.push(`Due Date,${invoice.dueDate || 'N/A'}`);
  rows.push(`Total Amount,${invoice.currency}${invoice.totalAmount.toFixed(2)}`);
  rows.push(`Status,${invoice.status || 'Unknown'}`);
  
  if (invoice.purchaseOrder) {
    rows.push(`Purchase Order,${invoice.purchaseOrder}`);
  }
  if (invoice.billingAddressRecipient) {
    rows.push(`Billing Recipient,${invoice.billingAddressRecipient}`);
  }
  
  rows.push('');
  rows.push('LINE ITEMS');
  rows.push('Description,Quantity,Unit Price,Total Price');
  
  // Line items
  invoice.items.forEach((item) => {
    rows.push(
      `"${item.description}",${item.quantity},${invoice.currency}${item.unitPrice.toFixed(2)},${invoice.currency}${item.totalPrice.toFixed(2)}`
    );
  });
  
  // Summary section
  rows.push('');
  rows.push('SUMMARY');
  if (invoice.subTotal !== undefined) {
    rows.push(`Subtotal,${invoice.currency}${invoice.subTotal.toFixed(2)}`);
  }
  if (invoice.shippingCost !== undefined) {
    rows.push(`Shipping Cost,${invoice.currency}${invoice.shippingCost.toFixed(2)}`);
  }
  if (invoice.taxAmount !== undefined) {
    rows.push(`Tax,${invoice.currency}${invoice.taxAmount.toFixed(2)}`);
  }
  if (invoice.amountDue !== undefined) {
    rows.push(`Amount Due,${invoice.currency}${invoice.amountDue.toFixed(2)}`);
  }
  rows.push(`Total,${invoice.currency}${invoice.totalAmount.toFixed(2)}`);
  
  const csvContent = rows.join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoiceNumber}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download invoice as HTML file (printable)
 */
export const downloadAsHTML = (invoice: Invoice) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .invoice {
      background: white;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .vendor-info h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .invoice-number {
      text-align: right;
    }
    .invoice-number h1 {
      margin: 0;
      font-size: 32px;
      color: #333;
    }
    .invoice-number p {
      margin: 5px 0;
      color: #666;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .details-section h3 {
      margin-top: 0;
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
    }
    .details-section p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    table thead {
      background: #f5f5f5;
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
    }
    table th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
      color: #333;
    }
    table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
      color: #666;
    }
    table tr:last-child td {
      border-bottom: 2px solid #333;
    }
    .amount-right {
      text-align: right;
    }
    .summary {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .summary-box {
      width: 300px;
      background: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .summary-row.total {
      border-top: 2px solid #333;
      padding-top: 10px;
      font-weight: bold;
      font-size: 16px;
    }
    .notes {
      background: #f9f9f9;
      padding: 15px;
      border-left: 4px solid #333;
      margin-top: 30px;
    }
    @media print {
      body {
        background: white;
      }
      .invoice {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="vendor-info">
        <h2>${invoice.vendorName}</h2>
        <p>Invoice #${invoice.invoiceNumber}</p>
      </div>
      <div class="invoice-number">
        <h1>INVOICE</h1>
        <p>Date: ${invoice.invoiceDate}</p>
        <p>Due: ${invoice.dueDate || 'N/A'}</p>
      </div>
    </div>

    <div class="details">
      <div class="details-section">
        <h3>Invoice Details</h3>
        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
        ${invoice.purchaseOrder ? `<p><strong>PO:</strong> ${invoice.purchaseOrder}</p>` : ''}
      </div>
      <div class="details-section">
        <h3>Bill To</h3>
        ${invoice.billingAddressRecipient ? `<p>${invoice.billingAddressRecipient}</p>` : '<p>N/A</p>'}
        ${invoice.shippingAddress ? `<p>${invoice.shippingAddress}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount-right">Quantity</th>
          <th class="amount-right">Unit Price</th>
          <th class="amount-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item) => `
        <tr>
          <td>${item.description}</td>
          <td class="amount-right">${item.quantity}</td>
          <td class="amount-right">${invoice.currency}${item.unitPrice.toFixed(2)}</td>
          <td class="amount-right">${invoice.currency}${item.totalPrice.toFixed(2)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-box">
        ${invoice.subTotal !== undefined ? `
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${invoice.currency}${invoice.subTotal.toFixed(2)}</span>
        </div>
        ` : ''}
        ${invoice.shippingCost !== undefined ? `
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${invoice.currency}${invoice.shippingCost.toFixed(2)}</span>
        </div>
        ` : ''}
        ${invoice.taxAmount ? `
        <div class="summary-row">
          <span>Tax:</span>
          <span>${invoice.currency}${invoice.taxAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${invoice.amountDue !== undefined ? `
        <div class="summary-row total">
          <span>Amount Due:</span>
          <span>${invoice.currency}${invoice.amountDue.toFixed(2)}</span>
        </div>
        ` : `
        <div class="summary-row total">
          <span>Total:</span>
          <span>${invoice.currency}${invoice.totalAmount.toFixed(2)}</span>
        </div>
        `}
      </div>
    </div>

    ${invoice.notes ? `
    <div class="notes">
      <strong>Notes:</strong><br>
      ${invoice.notes}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;

  const dataBlob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
