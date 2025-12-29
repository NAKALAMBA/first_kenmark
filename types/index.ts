export interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  date: string;
  inTime: string | null;
  outTime: string | null;
  workedHours: number | null;
  isLeave: boolean;
  expectedHours: number;
}

export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  totalExpectedHours: number;
  totalWorkedHours: number;
  leavesUsed: number;
  productivity: number;
  dailyRecords: AttendanceRecord[];
}

export interface AttendanceData {
  month: string;
  year: number;
  monthNumber: number;
  employees: EmployeeSummary[];
  totalExpectedHours: number;
  totalWorkedHours: number;
  totalLeaves: number;
  averageProductivity: number;
}


