# Troubleshooting Guide

## Common Issues and Solutions

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Cause**: The API route is returning HTML (an error page) instead of JSON.

**Solutions**:

1. **Check if the development server is running**:
   ```bash
   npm run dev
   ```

2. **Verify the API route exists**:
   - Check that `app/api/upload/route.ts` exists
   - The file should export a `POST` function

3. **Check for build errors**:
   ```bash
   npm run build
   ```
   Fix any TypeScript or build errors before running the dev server.

4. **Verify dependencies are installed**:
   ```bash
   npm install
   ```

5. **Check the browser console**:
   - Open browser DevTools (F12)
   - Check the Network tab to see the actual response
   - Look for any error messages in the Console tab

6. **Check server logs**:
   - Look at the terminal where `npm run dev` is running
   - Check for any error messages

7. **Database connection issues**:
   - If MongoDB isn't set up, the app should still work (database is optional)
   - Check that `DATABASE_URL` in `.env` is correct (or remove it to test without DB)

8. **File format issues**:
   - Ensure the uploaded file is a valid Excel (.xlsx, .xls) or CSV file
   - Check that the file has the correct columns: Employee ID, Employee Name, Date, In-Time, Out-Time

### Error: "Failed to process file"

**Possible causes**:
- Invalid file format
- Missing required columns
- Corrupted file
- File too large

**Solutions**:
- Use the provided sample CSV file: `employee_attendance_january_2024.csv`
- Ensure file has correct column headers
- Check file size (should be under 10MB)

### Error: "Module not found" or Import errors

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Database Connection Errors

**If you see database errors but want to test without DB**:

1. Remove or comment out `DATABASE_URL` in `.env`
2. The app will work without database (data won't persist)
3. All calculations will still work correctly

**To set up MongoDB**:
1. Install MongoDB locally, OR
2. Use MongoDB Atlas (free):
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to `.env` as `DATABASE_URL`

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

### TypeScript Errors

**If you see TypeScript errors**:
```bash
# Check for errors
npm run build

# Fix any type errors
# Regenerate Prisma types
npx prisma generate
```

### File Upload Not Working

1. **Check file size**: Should be under 10MB (configured in `next.config.js`)
2. **Check file format**: Must be .xlsx, .xls, or .csv
3. **Check browser console**: Look for JavaScript errors
4. **Check network tab**: See if request is being sent

### Empty Response or No Data

1. **Check file format**: Ensure columns match expected format
2. **Check month selection**: Must match the dates in your file
3. **Check date format**: Should be YYYY-MM-DD
4. **Check time format**: Should be HH:mm (24-hour format)

## Debugging Steps

1. **Check browser console** (F12 → Console tab)
2. **Check network requests** (F12 → Network tab)
3. **Check server logs** (terminal running `npm run dev`)
4. **Test API directly**:
   - Visit `http://localhost:3000/api/upload` (should return JSON)
   - Use Postman or curl to test POST request

## Getting Help

If issues persist:
1. Check all error messages (browser console + server logs)
2. Verify all dependencies are installed
3. Try with the sample CSV file provided
4. Check that Next.js version is compatible (16.x)


