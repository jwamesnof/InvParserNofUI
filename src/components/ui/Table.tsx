import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table
          ref={ref}
          className={`w-full border-collapse text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHead = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <thead className={`bg-slate-50 border-b border-slate-200 ${className}`}>{children}</thead>
);

export const TableBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <tbody className={className}>{children}</tbody>
);

export const TableRow = ({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={`border-b border-slate-200 hover:bg-blue-50 transition-colors duration-150 ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeader = ({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={`px-6 py-4 text-slate-900 ${className}`}
    {...props}
  >
    {children}
  </td>
);
