# Deployment Guide

This guide will help you deploy the Leave & Productivity Analyzer application to Vercel or Netlify.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **MongoDB Database**: 
   - Local MongoDB, or
   - MongoDB Atlas (recommended for production)

## MongoDB Atlas Setup (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier is sufficient)
4. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Save the username and password
5. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
6. Get connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority`

## Deploy to Vercel

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure all files are committed

### Step 2: Deploy
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
6. Add Environment Variable:
   - Name: `DATABASE_URL`
   - Value: Your MongoDB connection string
7. Click "Deploy"

### Step 3: Verify
1. Wait for deployment to complete
2. Visit your deployment URL
3. Test file upload functionality
4. Verify data is being stored in MongoDB

## Deploy to Netlify

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure all files are committed

### Step 2: Deploy
1. Go to [Netlify](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add Environment Variable:
   - Go to Site settings → Environment variables
   - Add variable:
     - Key: `DATABASE_URL`
     - Value: Your MongoDB connection string
7. Click "Deploy site"

### Step 3: Verify
1. Wait for deployment to complete
2. Visit your deployment URL
3. Test file upload functionality
4. Verify data is being stored in MongoDB

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] File upload works
- [ ] Data is stored in MongoDB
- [ ] Dashboard displays correctly
- [ ] Calculations are accurate
- [ ] Responsive design works on mobile

## Troubleshooting

### Build Fails
- Check build logs for errors
- Ensure `DATABASE_URL` is set correctly
- Verify Prisma schema is correct
- Try running `npm run build` locally first

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes Vercel/Netlify IPs
- Check connection string format
- Ensure database user has correct permissions

### Runtime Errors
- Check browser console for errors
- Review server logs in Vercel/Netlify dashboard
- Verify environment variables are set

## Environment Variables

Required:
- `DATABASE_URL`: MongoDB connection string

Optional (for advanced configurations):
- `NODE_ENV`: Set to `production` in production

## Support

If you encounter issues:
1. Check the [README.md](./README.md) for common solutions
2. Review the [QUICKSTART.md](./QUICKSTART.md) guide
3. Check deployment platform logs
4. Verify MongoDB connection


