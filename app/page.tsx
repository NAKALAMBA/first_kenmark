'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import { AttendanceData } from '@/types';

export default function Home() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Leave & Productivity Analyzer
          </h1>
          <p className="text-gray-600">
            Upload attendance data and track employee productivity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FileUpload 
              onDataLoaded={setAttendanceData}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>
          
          <div className="lg:col-span-2">
            {attendanceData ? (
              <Dashboard 
                data={attendanceData}
                selectedMonth={selectedMonth}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Data Loaded
                </h3>
                <p className="text-gray-500">
                  Upload an Excel or CSV file to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


