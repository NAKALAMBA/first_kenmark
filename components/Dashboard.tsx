'use client';

import { useState } from 'react';
import { AttendanceData, EmployeeSummary } from '@/types';

interface DashboardProps {
  data: AttendanceData;
  selectedMonth: string;
}

export default function Dashboard({ data, selectedMonth }: DashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    data.employees.length > 0 ? data.employees[0].employeeId : null
  );

  const selectedEmployeeData = data.employees.find(
    (emp) => emp.employeeId === selectedEmployee
  );

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Overall Statistics - {data.month} {data.year}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Expected Hours"
            value={String(data.totalExpectedHours.toFixed(1))}
            unit="hours"
            color="blue"
          />
          <StatCard
            title="Total Worked Hours"
            value={String(data.totalWorkedHours.toFixed(1))}
            unit="hours"
            color="green"
          />
          <StatCard
            title="Total Leaves Used"
            value={String(data.totalLeaves)}
            unit="days"
            color="orange"
          />
          <StatCard
            title="Average Productivity"
            value={String(data.averageProductivity.toFixed(1))}
            unit="%"
            color="purple"
          />
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Employees</h2>
        <div className="space-y-3">
          {data.employees.map((employee) => (
            <EmployeeCard
              key={employee.employeeId}
              employee={employee}
              isSelected={selectedEmployee === employee.employeeId}
              onClick={() => setSelectedEmployee(employee.employeeId)}
            />
          ))}
        </div>
      </div>

      {/* Employee Details */}
      {selectedEmployeeData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {selectedEmployeeData.employeeName} - Daily Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Expected Hours"
              value={String(selectedEmployeeData.totalExpectedHours.toFixed(1))}
              unit="hours"
              color="blue"
            />
            <StatCard
              title="Worked Hours"
              value={String(selectedEmployeeData.totalWorkedHours.toFixed(1))}
              unit="hours"
              color="green"
            />
            <StatCard
              title="Leaves Used"
              value={`${selectedEmployeeData.leavesUsed} / 2`}
              unit=""
              color={selectedEmployeeData.leavesUsed > 2 ? 'red' : 'orange'}
            />
            <StatCard
              title="Productivity"
              value={String(selectedEmployeeData.productivity.toFixed(1))}
              unit="%"
              color={
                selectedEmployeeData.productivity >= 90
                  ? 'green'
                  : selectedEmployeeData.productivity >= 70
                  ? 'yellow'
                  : 'red'
              }
            />
          </div>

          {/* Daily Attendance Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In-Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Out-Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worked Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedEmployeeData.dailyRecords.map((record) => {
                  const date = new Date(record.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const isSunday = dayName === 'Sun';
                  
                  return (
                    <tr
                      key={record.date}
                      className={
                        record.isLeave
                          ? 'bg-red-50'
                          : isSunday
                          ? 'bg-gray-50'
                          : ''
                      }
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {dayName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.inTime || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.outTime || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {record.workedHours !== null
                          ? record.workedHours.toFixed(2)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {record.expectedHours.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {record.isLeave ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Leave
                          </span>
                        ) : isSunday ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Off
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
}

function StatCard({ title, value, unit, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold">
        {value} {unit && <span className="text-lg">{unit}</span>}
      </p>
    </div>
  );
}

interface EmployeeCardProps {
  employee: EmployeeSummary;
  isSelected: boolean;
  onClick: () => void;
}

function EmployeeCard({ employee, isSelected, onClick }: EmployeeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{employee.employeeName}</h3>
          <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500">Productivity</p>
              <p
                className={`text-lg font-bold ${
                  employee.productivity >= 90
                    ? 'text-green-600'
                    : employee.productivity >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {employee.productivity.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Leaves</p>
              <p
                className={`text-lg font-bold ${
                  employee.leavesUsed > 2 ? 'text-red-600' : 'text-orange-600'
                }`}
              >
                {employee.leavesUsed}/2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
