'use client';

import { useState, useRef, useEffect } from 'react';
import { Invoice } from '@/types';
import { downloadAsJSON, downloadAsCSV, downloadAsHTML } from '@/lib/export';

interface DownloadMenuProps {
  invoice: Invoice;
}

export function DownloadMenu({ invoice }: DownloadMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (format: 'json' | 'csv' | 'html') => {
    switch (format) {
      case 'json':
        downloadAsJSON(invoice);
        break;
      case 'csv':
        downloadAsCSV(invoice);
        break;
      case 'html':
        downloadAsHTML(invoice);
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
      >
        ⬇️ Download
        <span className={`text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
          <button
            onClick={() => handleDownload('json')}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 flex items-center gap-2"
          >
            <span>📄</span>
            <div>
              <div className="font-medium text-slate-900">Download as JSON</div>
              <div className="text-xs text-slate-600">Structured data format</div>
            </div>
          </button>

          <button
            onClick={() => handleDownload('csv')}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 flex items-center gap-2"
          >
            <span>📊</span>
            <div>
              <div className="font-medium text-slate-900">Download as CSV</div>
              <div className="text-xs text-slate-600">Excel/Spreadsheet format</div>
            </div>
          </button>

          <button
            onClick={() => handleDownload('html')}
            className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <span>🖨️</span>
            <div>
              <div className="font-medium text-slate-900">Download as HTML</div>
              <div className="text-xs text-slate-600">Printable invoice</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
