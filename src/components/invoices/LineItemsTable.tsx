'use client';

import { Invoice } from '@/types';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';

interface LineItemsTableProps {
  items: Invoice['items'];
}

export function LineItemsTable({ items }: LineItemsTableProps) {
  console.log('LineItemsTable received items:', items);
  
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">No line items found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Description</TableHeader>
          <TableHeader className="text-right">Quantity</TableHeader>
          <TableHeader className="text-right">Unit Price</TableHeader>
          <TableHeader className="text-right">Total</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.id || index}>
            <TableCell>{item.description}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
            <TableCell className="text-right font-semibold">${item.totalPrice.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
