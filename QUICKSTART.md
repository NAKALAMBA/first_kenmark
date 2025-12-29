# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

**Option A: Local MongoDB**
1. Install MongoDB locally
2. Create `.env` file:
   ```
   DATABASE_URL="mongodb://localhost:27017/attendance_db"
   ```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Create `.env` file:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/attendance_db"
   ```

### Step 3: Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

### Step 6: Upload Sample Data
1. Select month: **2024-01** (January 2024)
2. Upload the file: `employee_attendance_january_2024.csv`
3. View the dashboard!

## 📝 Testing Checklist

- [ ] File uploads successfully
- [ ] All 5 employees are displayed
- [ ] Working hours are calculated correctly
- [ ] Leaves are detected (missing attendance)
- [ ] Productivity percentages are shown
- [ ] Daily breakdown table is visible
- [ ] Sundays are marked as "Off"
- [ ] Saturdays show 4 hours expected
- [ ] Weekdays show 8.5 hours expected

## 🐛 Troubleshooting

**Database Connection Error**
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify `.env` file exists and has correct `DATABASE_URL`

**File Upload Error**
- Ensure file has correct column names
- Check file format (Excel .xlsx/.xls or CSV)
- Verify dates are in YYYY-MM-DD format

**Build Error**
- Run `npx prisma generate` before building
- Clear `.next` folder: `rm -rf .next` (Mac/Linux) or `rmdir /s .next` (Windows)

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize the business rules in `lib/utils.ts`
- Add more features as needed!

