# Deploying to Vercel - Step by Step Guide

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **MongoDB Atlas Account** (optional) - For database, or skip if you don't need persistence

## Step 1: Prepare Your Code

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Leave & Productivity Analyzer"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `leave-productivity-analyzer` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/leave-productivity-analyzer.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up MongoDB Atlas (Optional)

**Note**: The app works without a database! You can skip this if you don't need data persistence.

### 2.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (free tier M0 is sufficient)

### 2.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Create username and password (save these!)
4. Set privileges to **Atlas admin** or **Read and write to any database**

### 2.3 Whitelist IP Addresses
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0) for Vercel
3. Or add Vercel's IP ranges if you prefer

### 2.4 Get Connection String
1. Go to **Clusters** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `attendance_db` (or any name)
6. Example: `mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority`

## Step 3: Deploy to Vercel

### 3.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select your GitHub repository
5. Click **Import**

### 3.2 Configure Project
Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `prisma generate && next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3.3 Add Environment Variables
1. In the **Environment Variables** section, add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your MongoDB connection string (from Step 2.4)
   - **Environment**: Production, Preview, Development (select all)

**Note**: If you're not using a database, you can skip this. The app will work without it.

### 3.4 Deploy
1. Click **Deploy**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Step 4: Verify Deployment

### 4.1 Test Your App
1. Visit your Vercel URL
2. Upload a test file
3. Verify all features work:
   - File upload
   - Month selection
   - Data processing
   - Dashboard display

### 4.2 Check Logs
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Check **Build Logs** for any errors
4. Check **Function Logs** for runtime errors

## Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Build Fails
- **Error**: "Prisma client not generated"
  - **Solution**: The build command includes `prisma generate`, so this shouldn't happen. If it does, check build logs.

- **Error**: "Module not found"
  - **Solution**: Ensure all dependencies are in `package.json` and run `npm install` locally first.

### Runtime Errors
- **Error**: "Database connection failed"
  - **Solution**: 
    - Check `DATABASE_URL` is set correctly in Vercel
    - Verify MongoDB Atlas IP whitelist includes Vercel
    - Remember: App works without database too!

- **Error**: "Function timeout"
  - **Solution**: Large file uploads might timeout. Vercel has a 10s timeout for Hobby plan. Consider:
    - Optimizing file processing
    - Using Vercel Pro for longer timeouts

### File Upload Issues
- **Error**: "Request entity too large"
  - **Solution**: Vercel has a 4.5MB limit for serverless functions. For larger files:
    - Use Vercel Pro
    - Or optimize file processing

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | No | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | Auto | Set by Vercel | `production` |

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] File upload works
- [ ] Month selection works
- [ ] Data processing works
- [ ] Dashboard displays correctly
- [ ] All employees appear
- [ ] Calculations are accurate
- [ ] Mobile responsive (test on phone)
- [ ] Error messages display properly

## Updating Your Deployment

After making changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. Vercel will automatically:
   - Detect the push
   - Start a new deployment
   - Deploy when build succeeds

3. Or manually trigger:
   - Go to Vercel Dashboard
   - Click **Redeploy** on latest deployment

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

## Quick Deploy Commands

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

---

**Your app is now live! 🚀**

Share your Vercel URL with others to test the Leave & Productivity Analyzer.

