'use client';

import { useState, useRef, useEffect } from 'react';

interface FileUploadProps {
  onDataLoaded: (data: any) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function FileUpload({ onDataLoaded, selectedMonth, onMonthChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localMonth, setLocalMonth] = useState<string>(selectedMonth);

  // Sync local month with prop
  useEffect(() => {
    setLocalMonth(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setLocalMonth(newMonth);
    onMonthChange(newMonth);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate month is selected
    if (!localMonth || localMonth.length === 0) {
      setError('Please select a month before uploading the file');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setError('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use localMonth to ensure we have the latest value
      const monthToUse = localMonth || selectedMonth;
      
      if (!monthToUse) {
        setError('Please select a month before uploading');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', monthToUse);
      
      console.log('Uploading file for month:', monthToUse); // Debug log

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            
            // Add helpful context for common errors
            if (errorMessage.includes('Prisma') || errorMessage.includes('database')) {
              errorMessage += '. Note: Database is optional. The app works without it.';
            }
          } catch (parseError) {
            // If JSON parsing fails, use default message
            console.warn('Failed to parse error response as JSON');
          }
        } else {
          // If not JSON, it's likely an HTML error page from Next.js
          // This shouldn't happen if our API route is working correctly
          const text = await response.text();
          
          // Try to extract useful info from HTML error page
          if (text.includes('Prisma')) {
            errorMessage = 'Database connection error. Please run "npx prisma generate" or remove DATABASE_URL from .env to use without database.';
          } else if (text.includes('Module not found')) {
            errorMessage = 'Missing dependencies. Please run "npm install".';
          } else {
            errorMessage = `Server error: ${response.status}. Please check the server logs for details.`;
          }
          
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Non-JSON error response (first 300 chars):', text.substring(0, 300));
          }
        }
        
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || !data.employees) {
        throw new Error('Invalid data received from server');
      }

      onDataLoaded(data);
      setSuccess('File uploaded and processed successfully!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred while uploading the file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Attendance</h2>
      
      <div className="mb-4">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <input
          type="month"
          id="month"
          value={localMonth}
          onChange={handleMonthChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
        {localMonth ? (
          <p className="mt-1 text-xs text-green-600">
            ✓ Selected: <span className="font-semibold">{new Date(localMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-amber-600">
            ⚠ Please select a month before uploading
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">Excel (.xlsx, .xls) or CSV files</p>
          </div>
          <input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="mb-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
          {localMonth && (
            <p className="text-xs text-green-700 mt-1">
              Processed for: <span className="font-semibold">{new Date(localMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </p>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        <p className="font-semibold mb-1">Expected file format:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Employee ID / Employee Name</li>
          <li>Date (YYYY-MM-DD)</li>
          <li>In-Time (HH:mm)</li>
          <li>Out-Time (HH:mm)</li>
        </ul>
      </div>
    </div>
  );
}

