# Quick Deployment Checklist

## Before Deploying

- [ ] Code is committed to Git
- [ ] Pushed to GitHub repository
- [ ] All dependencies are in `package.json`
- [ ] Tested locally with `npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors

## Vercel Setup

- [ ] Created Vercel account
- [ ] Connected GitHub account
- [ ] Imported repository
- [ ] Verified build settings (auto-detected)
- [ ] Added `DATABASE_URL` environment variable (optional)
- [ ] Clicked Deploy

## After Deployment

- [ ] App loads at Vercel URL
- [ ] File upload works
- [ ] Month selection works
- [ ] Data processing works
- [ ] Dashboard displays correctly
- [ ] Tested on mobile device
- [ ] Checked Vercel logs for errors

## MongoDB Atlas (Optional)

- [ ] Created MongoDB Atlas account
- [ ] Created cluster
- [ ] Created database user
- [ ] Whitelisted IP addresses (0.0.0.0/0)
- [ ] Got connection string
- [ ] Added to Vercel environment variables

## Quick Commands

```bash
# Test build locally
npm run build

# Check for errors
npm run lint

# Deploy with Vercel CLI (optional)
npx vercel

# Deploy to production
npx vercel --prod
```

---

**See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.**


