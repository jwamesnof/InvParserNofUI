'use client';

import { useCallback, useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
  state?: UploadState;
  errorMessage?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf'];

export function FileUploader({
  onFileSelect,
  isLoading = false,
  state = 'idle',
  errorMessage = '',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inlineError, setInlineError] = useState<string>('');

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Only PDF files are supported. You selected: ${file.type || 'unknown type'}`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File is too large (${sizeMB}MB). Maximum size is 10MB.`,
      };
    }

    return { valid: true };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const validation = validateFile(file);
        
        if (!validation.valid) {
          setInlineError(validation.error || 'Invalid file');
          return;
        }

        setInlineError('');
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length > 0) {
        const file = files[0];
        const validation = validateFile(file);
        
        if (!validation.valid) {
          setInlineError(validation.error || 'Invalid file');
          e.currentTarget.value = ''; // Reset input
          return;
        }

        setInlineError('');
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  // Render states
  const getStateContent = () => {
    switch (state) {
      case 'uploading':
        return {
          icon: '📤',
          title: 'Uploading invoice...',
          description: 'Please wait while your file is being uploaded',
        };
      case 'analyzing':
        return {
          icon: '⚙️',
          title: 'Extracting invoice data using AI...',
          description: 'Our AI is analyzing your invoice and extracting structured data',
        };
      case 'success':
        return {
          icon: '✅',
          title: 'Invoice processed successfully!',
          description: 'Your invoice has been extracted and is ready for review',
        };
      case 'error':
        return {
          icon: '❌',
          title: 'Processing failed',
          description: errorMessage || 'An error occurred while processing your invoice',
        };
      default:
        return {
          icon: '📄',
          title: isDragging ? 'Drop your PDF invoice here' : 'Drag and drop your invoice',
          description: 'Supported format: PDF only (max 10MB)',
        };
    }
  };

  const content = getStateContent();
  const isProcessing = state === 'uploading' || state === 'analyzing' || isLoading;

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-12 text-center
        transition-all duration-200
        ${isDragging && !isProcessing ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 bg-slate-50'}
        ${state === 'error' ? 'border-red-300 bg-red-50' : ''}
        ${state === 'success' ? 'border-green-300 bg-green-50' : ''}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl transition-all ${
          state === 'error' ? 'bg-red-100' : 
          state === 'success' ? 'bg-green-100' : 
          'bg-blue-100'
        }`}>
          {content.icon}
        </div>

        <div>
          <p className={`text-lg font-semibold mb-1 ${
            state === 'error' ? 'text-red-900' : 
            state === 'success' ? 'text-green-900' : 
            'text-slate-900'
          }`}>
            {content.title}
          </p>
          <p className={`text-sm ${
            state === 'error' ? 'text-red-700' : 
            state === 'success' ? 'text-green-700' : 
            'text-slate-600'
          }`}>
            {content.description}
          </p>
        </div>

        {/* Inline Error Message */}
        {inlineError && (
          <div className="w-full mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
            <p className="font-medium">⚠️ {inlineError}</p>
          </div>
        )}

        {/* File Input - Only show in idle state or with error */}
        {!isProcessing && (
          <label htmlFor="file-input">
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
            />
            <div
              className={`
                inline-flex items-center justify-center
                px-6 py-3 rounded-lg font-medium
                transition-all duration-200
                ${isProcessing 
                  ? 'opacity-50 cursor-not-allowed bg-slate-300' 
                  : 'cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              Browse Files
            </div>
          </label>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 w-full max-w-xs">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-600">
                {state === 'uploading' ? 'Uploading...' : 'Analyzing invoice...'}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Format specification */}
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          📋 <strong>Supported format:</strong> PDF only (max 10MB)
        </p>
      </div>
    </div>
  );
}
