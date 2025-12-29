# Leave & Productivity Analyzer

A comprehensive web application for tracking employee attendance, leave balance, and productivity from Excel/CSV data.

## Features

- 📊 **Excel/CSV File Upload**: Upload attendance data in Excel (.xlsx, .xls) or CSV format
- 📅 **Monthly Analysis**: Select any month and view detailed attendance statistics
- ⏰ **Working Hours Calculation**: 
  - Monday to Friday: 8.5 hours (10:00 AM to 6:30 PM)
  - Saturday: 4 hours (10:00 AM to 2:00 PM)
  - Sunday: Off
- 🏖️ **Leave Management**: Automatic leave detection (2 leaves per month allowed)
- 📈 **Productivity Tracking**: Calculate productivity as ratio of actual worked hours to expected hours
- 📱 **Responsive Dashboard**: Clean, modern UI with daily attendance breakdown
- 💾 **Database Storage**: MongoDB with Prisma ORM for data persistence

## Tech Stack

- **Frontend**: Next.js 16.x, React 18, TypeScript
- **Styling**: Tailwind CSS 3.x
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **ORM**: Prisma
- **File Processing**: xlsx library

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud like MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leave-productivity-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mongodb://localhost:27017/attendance_db"
   # Or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/attendance_db"
   ```

4. **Set up Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## File Format

The application accepts Excel or CSV files with the following columns:

| Column Name | Description | Required | Example |
|------------|-------------|----------|---------|
| Employee Name | Full name of employee | **Yes** | John Doe |
| Date | Attendance date | **Yes** | 2024-01-01 |
| In-Time | Check-in time | No | 10:00 |
| Out-Time | Check-out time | No | 18:30 |
| Employee ID | Unique employee identifier | **No** (auto-generated) | EMP001 |

### Supported Column Name Variations:
- **Employee Name** (Required): `Employee Name`, `EmployeeName`, `employee_name`, `Name`, `EMP Name`
- **Date** (Required): `Date`, `date`, `DATE`, `Attendance Date`
- **In-Time**: `In-Time`, `InTime`, `in_time`, `In Time`, `IN TIME`, `Check In`, `check_in`
- **Out-Time**: `Out-Time`, `OutTime`, `out_time`, `Out Time`, `OUT TIME`, `Check Out`, `check_out`
- **Employee ID** (Optional): `Employee ID`, `EmployeeID`, `employee_id`, `EmployeeId`, `EMP ID`

**Note**: If Employee ID is not provided, it will be automatically generated from the Employee Name (e.g., "John Doe" → "EMP_John_Doe").

### Notes:
- Missing In-Time or Out-Time will be marked as a leave
- Dates should be in YYYY-MM-DD format
- Time should be in HH:mm format (24-hour)

## Usage

1. **Select Month**: Choose the month you want to analyze
2. **Upload File**: Click or drag and drop your Excel/CSV file
3. **View Dashboard**: 
   - Overall statistics for all employees
   - Individual employee details
   - Daily attendance breakdown
   - Productivity metrics

## Business Rules

- **Working Hours**:
  - Monday to Friday: 8.5 hours per day (10:00 AM to 6:30 PM)
  - Saturday: 4 hours (half day from 10:00 AM to 2:00 PM)
  - Sunday: Off (no working hours expected)

- **Leave Policy**:
  - Each employee is allowed 2 leaves per month
  - Missing attendance on a working day (Monday-Saturday) is marked as a leave

- **Productivity Calculation**:
  - Productivity = (Actual Worked Hours / Expected Working Hours) × 100
  - Expected hours are calculated based on the number of working days in the selected month

## Project Structure

```
leave-productivity-analyzer/
├── app/
│   ├── api/
│   │   ├── upload/      # File upload endpoint
│   │   └── data/        # Data retrieval endpoint
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── Dashboard.tsx    # Dashboard component
│   └── FileUpload.tsx   # File upload component
├── lib/
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
├── types/
│   └── index.ts         # TypeScript types
└── public/              # Static files
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variable:
   - `DATABASE_URL`: Your MongoDB connection string
4. Click Deploy
5. Vercel will automatically detect Next.js and deploy

**Note**: Make sure to set `DATABASE_URL` in Vercel's environment variables section.

### Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and import your repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variable:
   - `DATABASE_URL`: Your MongoDB connection string
5. Click Deploy

**Note**: Netlify requires the `@netlify/plugin-nextjs` plugin (already configured in `netlify.toml`).

### Environment Variables for Production

Make sure to set:
- `DATABASE_URL`: Your MongoDB connection string (required)

For MongoDB Atlas (recommended for production):
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Replace `<username>` and `<password>` with your credentials
4. Add the connection string as `DATABASE_URL` in your deployment platform

## Sample Data

A sample CSV file (`employee_attendance_january_2024.csv`) is included in the repository for testing purposes.

To convert the CSV to Excel format (optional):
```bash
node scripts/convert-csv-to-excel.js
```

This will create `employee_attendance_january_2024.xlsx` in the root directory.

## Development

- **Run development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Prisma Studio**: `npm run prisma:studio` (to view database)

## Testing

1. Use the provided sample CSV file
2. Upload it for January 2024
3. Verify:
   - All employees are displayed
   - Working hours are calculated correctly
   - Leaves are detected properly
   - Productivity percentages are accurate

## Troubleshooting

### Database Connection Issues
- Verify MongoDB is running (if local)
- Check DATABASE_URL in `.env` file
- Ensure network access is configured (for MongoDB Atlas)

### File Upload Issues
- Check file format matches expected structure
- Verify file size is within limits
- Ensure all required columns are present

### Build Issues
- Run `npx prisma generate` before building
- Clear `.next` folder and rebuild

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

