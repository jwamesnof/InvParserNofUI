'use client';

import { InvoiceStatus } from '@/types';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<InvoiceStatus, { label: string; icon: string; bgColor: string; textColor: string }> = {
  uploaded: {
    label: 'Uploaded',
    icon: '📤',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  processing: {
    label: 'Processing',
    icon: '⚙️',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  extracted: {
    label: 'Extracted',
    icon: '✅',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  needs_review: {
    label: 'Needs Review',
    icon: '⚠️',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full text-sm font-medium
        ${config.bgColor} ${config.textColor}
        ${className}
      `}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}
