// Utility script to convert CSV to Excel format
// Usage: node scripts/convert-csv-to-excel.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'employee_attendance_january_2024.csv');
const excelPath = path.join(__dirname, '..', 'employee_attendance_january_2024.xlsx');

try {
  // Read CSV file
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(
    csvData.split('\n').map(line => line.split(','))
  );
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  
  // Write Excel file
  XLSX.writeFile(workbook, excelPath);
  
  console.log(`✅ Successfully converted CSV to Excel: ${excelPath}`);
} catch (error) {
  console.error('❌ Error converting file:', error.message);
  process.exit(1);
}


