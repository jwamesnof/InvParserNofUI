'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { useExtractInvoice } from '@/hooks/useInvoices';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/invoices/FileUploader';
import { logActivity } from '@/lib/activity-logger';
import Link from 'next/link';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { loading, extract } = useExtractInvoice();
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadState('uploading');
    setErrorMessage('');

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setUploadState('analyzing');
      
      // Extract invoice
      const result = await extract(file);

      setUploadState('success');
      toast.success('Invoice extracted successfully! Redirecting...');

      // Redirect to invoice details
      if (result) {
        logActivity('Invoice Uploaded', {
          invoiceId: result.id,
          invoiceNumber: result.invoiceNumber,
          details: `Uploaded from file: ${file.name}`,
        });

        setTimeout(() => {
          router.push(`/invoice/${result.id}`);
        }, 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to extract invoice. Please try again.';
      setErrorMessage(message);
      setUploadState('error');
      setSelectedFile(null);
      toast.error(message);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setErrorMessage('');
  };

  return (
    <MainLayout>
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Upload Invoice</h1>
        <p className="text-slate-600">Upload a PDF invoice to extract structured data using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="p-8">
              <FileUploader
                onFileSelect={handleFileSelect}
                isLoading={loading}
                state={uploadState}
                errorMessage={errorMessage}
              />

              {/* Success State with Action */}
              {uploadState === 'success' && selectedFile && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <p className="text-sm text-slate-600 mb-4">Your invoice details will load shortly...</p>
                  <Button variant="secondary" onClick={handleReset}>
                    Upload Another Invoice
                  </Button>
                </div>
              )}

              {/* Error State with Retry */}
              {uploadState === 'error' && (
                <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                  <Button variant="primary" onClick={handleReset}>
                    Try Another File
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* PDF Only Notice */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardHeader>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">📋</span>
                PDF Only
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <p className="text-sm text-slate-600">
                This application supports <strong>PDF files only</strong> for invoice extraction. 
                Other formats are not supported.
              </p>
            </CardBody>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Requirements
              </h3>
            </CardHeader>
            <CardBody className="p-6 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">File Type</p>
                <p className="text-sm text-slate-600">PDF format required</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">File Size</p>
                <p className="text-sm text-slate-600">Maximum 10MB</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">Quality</p>
                <p className="text-sm text-slate-600">Clear, readable invoices work best</p>
              </div>
            </CardBody>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                How It Works
              </h3>
            </CardHeader>
            <CardBody className="p-6 space-y-2">
              <div className="flex gap-3">
                <span className="text-lg">1️⃣</span>
                <p className="text-sm text-slate-600">Upload your PDF invoice</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">2️⃣</span>
                <p className="text-sm text-slate-600">AI extracts structured data</p>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">3️⃣</span>
                <p className="text-sm text-slate-600">Review and manage in dashboard</p>
              </div>
            </CardBody>
          </Card>

          {/* View Invoices Link */}
          <Link href="/invoices" className="block">
            <Button variant="secondary" className="w-full justify-center">
              📋 View All Invoices
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
