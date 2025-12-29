import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import {
  calculateWorkedHours,
  getExpectedWorkingHours,
  getWorkingHoursForDay,
  isWorkingDay,
  parseDate,
  formatDate,
} from '@/lib/utils';
import { AttendanceData, EmployeeSummary, AttendanceRecord } from '@/types';

// Route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Test endpoint
export async function GET() {
  return NextResponse.json(
    { message: 'Upload API is working' },
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let month = formData.get('month') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate and clean month string
    if (!month) {
      return NextResponse.json(
        { error: 'Month not provided. Please select a month before uploading.' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Clean month string (remove any whitespace)
    month = month.trim();

    // Log for debugging
    console.log('Received month:', month, 'File:', file.name);

    // Parse month string (YYYY-MM)
    const monthParts = month.split('-');
    if (monthParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid month format. Use YYYY-MM' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const year = parseInt(monthParts[0], 10);
    const monthNum = parseInt(monthParts[1], 10);

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const expectedHours = getExpectedWorkingHours(year, monthNum);

    // Read file
    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('File is empty');
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to read file: ${error.message || 'Unknown error'}` },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in file');
      }
    } catch (error: any) {
      return NextResponse.json(
        { error: `Invalid file format: ${error.message || 'Unable to parse Excel/CSV file'}` },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      return NextResponse.json(
        { error: 'Worksheet is empty or invalid' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Convert to JSON - preserve empty cells as empty strings
    let rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '', // Default value for empty cells
      blankrows: false // Skip completely blank rows
    });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`Parsed ${rawData.length} rows from file`);
    
    // Debug: Log first row to see structure
    if (rawData.length > 0) {
      const firstRow = rawData[0];
      console.log('Sample row keys:', Object.keys(firstRow));
      console.log('Sample row (first 3):', JSON.stringify(rawData.slice(0, 3), null, 2));
      
      // Log all possible column name variations we're looking for
      console.log('Looking for columns:', {
        'Employee ID': firstRow['Employee ID'] !== undefined ? 'FOUND (optional)' : 'NOT FOUND (will generate from name)',
        'Employee Name': firstRow['Employee Name'] !== undefined ? 'FOUND (required)' : 'NOT FOUND',
        'Date': firstRow['Date'] !== undefined ? 'FOUND (required)' : 'NOT FOUND',
        'In-Time': firstRow['In-Time'] !== undefined ? 'FOUND' : 'NOT FOUND',
        'Out-Time': firstRow['Out-Time'] !== undefined ? 'FOUND' : 'NOT FOUND',
      });
    }

    // Process data
    const employeeMap = new Map<string, Map<string, AttendanceRecord>>();
    const employeeNames = new Map<string, string>();
    
    let processedCount = 0;
    let skippedCount = 0;

    for (const row of rawData as any[]) {
      // Get all keys from the row to help debug
      const rowKeys = Object.keys(row);
      
      // Handle different column name variations - try all possible variations
      // Check exact matches first, then case-insensitive
      const getValue = (keys: string[]) => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
          }
          // Try case-insensitive match
          const lowerKey = key.toLowerCase();
          for (const rowKey of rowKeys) {
            if (rowKey.toLowerCase() === lowerKey) {
              return row[rowKey];
            }
          }
        }
        return null;
      };
      
      const employeeId = getValue(['Employee ID', 'EmployeeID', 'employee_id', 'EmployeeId', 'EMP ID', 'emp_id']) || '';
      const employeeName = getValue(['Employee Name', 'EmployeeName', 'employee_name', 'Name', 'EMP Name', 'emp_name']) || '';
      const dateStr = getValue(['Date', 'date', 'DATE', 'Attendance Date']) || '';
      
      // Get time values - handle all variations
      let inTime = getValue(['In-Time', 'InTime', 'in_time', 'In Time', 'IN TIME', 'Check In', 'check_in']);
      let outTime = getValue(['Out-Time', 'OutTime', 'out_time', 'Out Time', 'OUT TIME', 'Check Out', 'check_out']);
      
      // Convert empty strings, undefined, or null to null
      if (inTime === '' || inTime === undefined || inTime === null) inTime = null;
      if (outTime === '' || outTime === undefined || outTime === null) outTime = null;
      
      // If inTime/outTime are strings, trim them
      if (typeof inTime === 'string') inTime = inTime.trim() || null;
      if (typeof outTime === 'string') outTime = outTime.trim() || null;

      // Skip if missing essential data (Employee Name and Date are required, Employee ID is optional)
      if (!employeeName || employeeName.trim() === '' || !dateStr || dateStr === '' || dateStr.trim() === '') {
        skippedCount++;
        continue;
      }

      // Generate Employee ID from name if not provided
      let finalEmployeeId = employeeId;
      if (!finalEmployeeId || finalEmployeeId.trim() === '') {
        // Generate a unique ID from employee name
        // Use name as base, create a consistent ID
        finalEmployeeId = `EMP_${employeeName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
      }

      // Store employee name (using employeeId as key for consistency)
      if (!employeeNames.has(finalEmployeeId)) {
        employeeNames.set(finalEmployeeId, employeeName.trim());
      }

      // Parse date
      let date: Date;
      try {
        if (typeof dateStr === 'number') {
          // Excel date number - convert to Date
          const excelEpoch = new Date(1899, 11, 30);
          date = new Date(excelEpoch.getTime() + dateStr * 86400000);
        } else if (typeof dateStr === 'string' && dateStr.trim() !== '') {
          date = parseDate(dateStr.trim());
        } else {
          continue;
        }
      } catch (error) {
        console.warn(`Failed to parse date: ${dateStr}`, error);
        continue;
      }

      // Check if date is in the selected month
      if (date.getFullYear() !== year || date.getMonth() + 1 !== monthNum) {
        continue;
      }

      const dateKey = formatDate(date);
      const expectedHoursForDay = getWorkingHoursForDay(date);
      
      // Calculate worked hours - handle empty/null times
      const workedHours = calculateWorkedHours(inTime, outTime, date);
      
      // Mark as leave if either time is missing or empty
      const isLeave = !inTime || !outTime || 
                     (typeof inTime === 'string' && inTime.trim() === '') ||
                     (typeof outTime === 'string' && outTime.trim() === '');
      
      // Initialize employee map if needed (use finalEmployeeId)
      if (!employeeMap.has(finalEmployeeId)) {
        employeeMap.set(finalEmployeeId, new Map());
      }

      const dayMap = employeeMap.get(finalEmployeeId)!;
      dayMap.set(dateKey, {
        employeeId: finalEmployeeId,
        employeeName: employeeName.trim(),
        date: dateKey,
        inTime: inTime && typeof inTime === 'string' && inTime.trim() !== '' ? inTime.trim() : null,
        outTime: outTime && typeof outTime === 'string' && outTime.trim() !== '' ? outTime.trim() : null,
        workedHours,
        isLeave,
        expectedHours: expectedHoursForDay,
      });
      
      processedCount++;
    }
    
    console.log(`Processed ${processedCount} rows, skipped ${skippedCount} rows`);
    console.log(`Found ${employeeNames.size} unique employees`);
    console.log(`Employee IDs:`, Array.from(employeeNames.keys()));

    // Generate all days in the month and fill missing days
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    const allDays: Date[] = [];
    
    // Generate all days in the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, monthNum - 1, day);
      allDays.push(date);
    }
    
    console.log(`Generated ${allDays.length} days for ${year}-${monthNum.toString().padStart(2, '0')}`);

    // Process each employee found in the file
    // Use employeeNames to ensure we process all employees, even if they have no records in selected month
    const employees: EmployeeSummary[] = [];
    
    // Get all unique employee IDs from the file
    const allEmployeeIds = new Set([...employeeMap.keys(), ...employeeNames.keys()]);
    
    console.log(`Processing ${allEmployeeIds.size} employees for month ${year}-${monthNum.toString().padStart(2, '0')}`);

    for (const employeeId of allEmployeeIds) {
      const employeeName = employeeNames.get(employeeId) || employeeId;
      const dayMap = employeeMap.get(employeeId) || new Map<string, AttendanceRecord>();
      const dailyRecords: AttendanceRecord[] = [];

      // Add all days in the month
      for (const day of allDays) {
        const dateKey = formatDate(day);
        const expectedHoursForDay = getWorkingHoursForDay(day);

        if (dayMap.has(dateKey)) {
          dailyRecords.push(dayMap.get(dateKey)!);
        } else if (isWorkingDay(day)) {
          // Missing attendance on working day = leave
          dailyRecords.push({
            employeeId,
            employeeName,
            date: dateKey,
            inTime: null,
            outTime: null,
            workedHours: null,
            isLeave: true,
            expectedHours: expectedHoursForDay,
          });
        } else {
          // Sunday - no attendance expected
          dailyRecords.push({
            employeeId,
            employeeName,
            date: dateKey,
            inTime: null,
            outTime: null,
            workedHours: null,
            isLeave: false,
            expectedHours: 0,
          });
        }
      }

      // Calculate totals
      const totalWorkedHours = dailyRecords.reduce(
        (sum, record) => sum + (record.workedHours || 0),
        0
      );
      
      // Count leaves: only working days (expectedHours > 0) that are marked as leave
      const leavesUsed = dailyRecords.filter((r) => r.isLeave && r.expectedHours > 0).length;
      
      // Calculate productivity
      const productivity = expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Employee ${employeeName} (${employeeId}):`, {
          totalExpectedHours: expectedHours,
          totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
          leavesUsed,
          productivity: Math.round(productivity * 100) / 100,
          recordsCount: dailyRecords.length,
          recordsWithData: dailyRecords.filter(r => r.workedHours !== null).length
        });
      }

      employees.push({
        employeeId,
        employeeName,
        totalExpectedHours: expectedHours,
        totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
        leavesUsed,
        productivity: Math.round(productivity * 100) / 100,
        dailyRecords: dailyRecords.sort((a, b) => a.date.localeCompare(b.date)),
      });
    }

    // Calculate overall statistics
    const totalWorkedHours = employees.reduce((sum, emp) => sum + emp.totalWorkedHours, 0);
    const totalLeaves = employees.reduce((sum, emp) => sum + emp.leavesUsed, 0);
    const averageProductivity =
      employees.length > 0
        ? employees.reduce((sum, emp) => sum + emp.productivity, 0) / employees.length
        : 0;

    // Validate we have employees
    if (employees.length === 0) {
      console.warn('No employees found in processed data');
      return NextResponse.json(
        { 
          error: 'No employee data found in the file for the selected month. Please check:\n1. The file contains data for the selected month\n2. Column names match: Employee ID, Employee Name, Date, In-Time, Out-Time\n3. Dates are in YYYY-MM-DD format',
          debug: {
            rowsParsed: rawData.length,
            employeesFound: employeeNames.size,
            monthSelected: `${year}-${monthNum.toString().padStart(2, '0')}`,
            sampleRow: rawData.length > 0 ? Object.keys(rawData[0]) : []
          }
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result: AttendanceData = {
      month: new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' }),
      year,
      monthNumber: monthNum,
      employees,
      totalExpectedHours: expectedHours,
      totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
      totalLeaves,
      averageProductivity: Math.round(averageProductivity * 100) / 100,
    };
    
    console.log('Final result:', {
      employeesCount: employees.length,
      totalExpectedHours: result.totalExpectedHours,
      totalWorkedHours: result.totalWorkedHours,
      totalLeaves: result.totalLeaves,
      averageProductivity: result.averageProductivity
    });

    // Store in database (optional - continue even if it fails)
    if (isPrismaAvailable() && prisma) {
      try {
        for (const emp of employees) {
          // Upsert employee
          const employee = await prisma.employee.upsert({
            where: { employeeId: emp.employeeId },
            update: { name: emp.employeeName },
            create: {
              employeeId: emp.employeeId,
              name: emp.employeeName,
            },
          });

          // Upsert attendance records
          for (const record of emp.dailyRecords) {
            await prisma.attendance.upsert({
              where: {
                employeeId_date: {
                  employeeId: employee.id,
                  date: parseDate(record.date),
                },
              },
              update: {
                inTime: record.inTime,
                outTime: record.outTime,
                workedHours: record.workedHours,
                isLeave: record.isLeave,
              },
              create: {
                employeeId: employee.id,
                date: parseDate(record.date),
                inTime: record.inTime,
                outTime: record.outTime,
                workedHours: record.workedHours,
                isLeave: record.isLeave,
              },
            });
          }
        }
      } catch (dbError: any) {
        console.error('Database error (non-fatal):', dbError?.message || dbError);
        // Continue even if DB fails - return the calculated data
      }
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // Log full error for debugging
    console.error('Upload error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    // Extract meaningful error message
    let errorMessage = 'Failed to process file';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && errorMessage.includes('Prisma')) {
      errorMessage = 'Database connection error. Please check your configuration.';
    }
    
    // Always return JSON, even on error
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.stack?.substring(0, 500) 
        }),
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

