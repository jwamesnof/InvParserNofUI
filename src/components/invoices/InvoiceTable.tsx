'use client';

import { Invoice } from '@/types';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { StatusBadge } from '@/components/invoices/StatusBadge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

interface InvoiceTableProps {
  invoices: Invoice[];
  onRowClick?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  onFavoriteChange?: (invoiceId: string, isFav: boolean) => void;
  isLoading?: boolean;
}

export function InvoiceTable({ invoices, onRowClick, onEdit, onDelete, onFavoriteChange, isLoading }: InvoiceTableProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load favorite status for all invoices
    const favSet = new Set<string>();
    invoices.forEach((inv) => {
      if (isFavorite(inv.id)) {
        favSet.add(inv.id);
      }
    });
    setFavorites(favSet);
  }, [invoices]);

  const handleToggleFavorite = (invoiceId: string, invoiceNumber: string) => {
    toggleFavorite(invoiceId, invoiceNumber);
    const newFavorites = new Set(favorites);
    if (newFavorites.has(invoiceId)) {
      newFavorites.delete(invoiceId);
    } else {
      newFavorites.add(invoiceId);
    }
    setFavorites(newFavorites);
    onFavoriteChange?.(invoiceId, newFavorites.has(invoiceId));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">📋</div>
        <p className="text-lg font-semibold text-slate-900 mb-1">No invoices found</p>
        <p className="text-sm text-slate-600">Upload your first invoice to get started</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader className="w-8"></TableHeader>
          <TableHeader>Invoice Number</TableHeader>
          <TableHeader>Vendor</TableHeader>
          <TableHeader>Date</TableHeader>
          <TableHeader>Amount</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader className="text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            onClick={() => onRowClick?.(invoice)}
            className={onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}
          >
            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleToggleFavorite(invoice.id, invoice.invoiceNumber)}
                className="text-lg hover:scale-110 transition-transform"
                title={favorites.has(invoice.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.has(invoice.id) ? '⭐' : '☆'}
              </button>
            </TableCell>
            <TableCell className="font-semibold text-blue-600">{invoice.invoiceNumber}</TableCell>
            <TableCell className="text-slate-700">{invoice.vendorName}</TableCell>
            <TableCell className="text-slate-600">
              {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') : 'N/A'}
            </TableCell>
            <TableCell className="font-semibold text-slate-900">
              {invoice.currency || '$'} {invoice.totalAmount.toFixed(2)}
            </TableCell>
            <TableCell>
              <StatusBadge status={invoice.status || 'extracted'} />
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 justify-end">
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(invoice)}
                    title="Edit invoice"
                  >
                    ✎ Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDelete(invoice.id)}
                    title="Delete invoice"
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    🗑️ Delete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
