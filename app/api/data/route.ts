import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Attendance } from '@prisma/client';
import {
  getExpectedWorkingHours,
  getWorkingHoursForDay,
  isWorkingDay,
  formatDate,
  parseDate,
  calculateWorkedHours,
} from '@/lib/utils';
import { AttendanceData, EmployeeSummary, AttendanceRecord } from '@/types';
export const maxDuration = 600; 
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { error: 'Month parameter required' },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split('-').map(Number);
    const expectedHours = getExpectedWorkingHours(year, monthNum);
    
    // Check if Prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(year, monthNum - 1, 1),
              lt: new Date(year, monthNum, 1),
            },
          },
        },
      },
    });

    // Generate all days in the month
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    const allDays: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDays.push(new Date(d));
    }

    const employeeSummaries: EmployeeSummary[] = [];

    for (const employee of employees) {
      const attendanceMap = new Map<string, Attendance>(
        employee.attendances.map((att: Attendance) => [formatDate(att.date), att])
      );

      const dailyRecords: AttendanceRecord[] = [];

      for (const day of allDays) {
        const dateKey = formatDate(day);
        const expectedHoursForDay = getWorkingHoursForDay(day);
        const attendance = attendanceMap.get(dateKey);

        if (attendance) {
          dailyRecords.push({
            employeeId: employee.employeeId,
            employeeName: employee.name,
            date: dateKey,
            inTime: attendance.inTime,
            outTime: attendance.outTime,
            workedHours: attendance.workedHours,
            isLeave: attendance.isLeave,
            expectedHours: expectedHoursForDay,
          });
        } else if (isWorkingDay(day)) {
          // Missing attendance on working day = leave
          dailyRecords.push({
            employeeId: employee.employeeId,
            employeeName: employee.name,
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
            employeeId: employee.employeeId,
            employeeName: employee.name,
            date: dateKey,
            inTime: null,
            outTime: null,
            workedHours: null,
            isLeave: false,
            expectedHours: 0,
          });
        }
      }

      const totalWorkedHours = dailyRecords.reduce(
        (sum, record) => sum + (record.workedHours || 0),
        0
      );
      const leavesUsed = dailyRecords.filter((r) => r.isLeave && r.expectedHours > 0).length;
      const productivity = expectedHours > 0 ? (totalWorkedHours / expectedHours) * 100 : 0;

      employeeSummaries.push({
        employeeId: employee.employeeId,
        employeeName: employee.name,
        totalExpectedHours: expectedHours,
        totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
        leavesUsed,
        productivity: Math.round(productivity * 100) / 100,
        dailyRecords: dailyRecords.sort((a, b) => a.date.localeCompare(b.date)),
      });
    }

    const totalWorkedHours = employeeSummaries.reduce((sum, emp) => sum + emp.totalWorkedHours, 0);
    const totalLeaves = employeeSummaries.reduce((sum, emp) => sum + emp.leavesUsed, 0);
    const averageProductivity =
      employeeSummaries.length > 0
        ? employeeSummaries.reduce((sum, emp) => sum + emp.productivity, 0) / employeeSummaries.length
        : 0;

    const result: AttendanceData = {
      month: new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' }),
      year,
      monthNumber: monthNum,
      employees: employeeSummaries,
      totalExpectedHours: expectedHours,
      totalWorkedHours: Math.round(totalWorkedHours * 100) / 100,
      totalLeaves,
      averageProductivity: Math.round(averageProductivity * 100) / 100,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Data fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

