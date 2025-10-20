# Deployment Guide - Affiliate Launcher

Complete guide for deploying the Affiliate Launcher to production on Vercel.

## Pre-Deployment Checklist

- [ ] Whop app created in developer dashboard
- [ ] API key and App ID obtained
- [ ] PostgreSQL database ready (Vercel Postgres recommended)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database
3. Select PostgreSQL
4. Copy the `DATABASE_URL` connection string

### Option B: External Provider

Supported providers:
- Supabase
- Railway
- Neon
- AWS RDS
- Any PostgreSQL 12+ instance

## Step 2: Deploy to Vercel

### Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables (see below)
4. Click Deploy

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 3: Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

```env
# Whop Configuration (Required)
WHOP_API_KEY=your_api_key_from_whop_dashboard
NEXT_PUBLIC_WHOP_APP_ID=your_app_id_from_whop_dashboard

# Database (Required)
DATABASE_URL=your_postgresql_connection_string

# Webhook Secret (Required after webhook setup)
WHOP_WEBHOOK_SECRET=your_webhook_secret_from_whop

# Optional: Access Pass Plan IDs for app monetization
NEXT_PUBLIC_STARTER_PLAN_ID=plan_xxx
NEXT_PUBLIC_GROWTH_PLAN_ID=plan_xxx
NEXT_PUBLIC_SCALE_PLAN_ID=plan_xxx
```

## Step 4: Run Database Migrations

After first deployment, run migrations:

```bash
# In Vercel deployment logs or via CLI
npx prisma migrate deploy

# Or connect to your database directly and run migrations
```

Alternatively, use Vercel's Serverless Functions to run migrations:

1. Create a protected API route: `/api/migrate`
2. Call it once after deployment
3. Delete or protect the route

## Step 5: Configure Whop Dashboard

### 5.1 Update Base URL

1. Go to https://whop.com/dashboard/developer/
2. Select your app
3. Update Base URL to your Vercel deployment URL
   - Example: `https://your-app.vercel.app`

### 5.2 Configure Hosting Paths

In the Hosting section, set:

```
Dashboard View: /dashboard/[companyId]/[restPath]
Experience View: /experiences/[experienceId]/[restPath]
Discover View: /discover
```

### 5.3 Set up Webhooks

1. Go to Webhooks section in Whop dashboard
2. Click "Create Webhook"
3. Set URL: `https://your-app.vercel.app/api/webhooks`
4. Select events: `payment.succeeded`
5. Copy the webhook secret
6. Add to Vercel environment variables as `WHOP_WEBHOOK_SECRET`
7. Redeploy to apply the secret

### 5.4 Request Permissions

In the Permissions section, request:

- `member:basic:read` (Required) - View affiliate info
- `payment:read` (Required) - View earnings
- `payment:write` (Required) - Process payouts
- Mark all as required

### 5.5 Create Access Passes (Optional)

For app monetization:

1. Go to Access Passes section
2. Create passes for each tier:
   - Starter (Free or low cost)
   - Growth ($49/mo recommended)
   - Scale ($149/mo recommended)
3. Add pricing plans for each
4. Copy plan IDs to environment variables

## Step 6: Test End-to-End

### 6.1 Test Dashboard Access

1. Install the app into your test Whop company
2. Open dashboard view from Whop
3. Create a program with test settings
4. Verify program saves correctly

### 6.2 Test Offer Creation

1. Create a test offer
2. Mark it as published
3. Associate it with an experience
4. Check if notification sent (if experience has members)

### 6.3 Test Affiliate Flow

1. Open experience view as a member
2. Apply to affiliate program
3. Switch to dashboard and approve application
4. Check if notification sent
5. Generate affiliate link in experience view

### 6.4 Test Payouts

1. Manually create test earnings events in database OR
2. Wait for real conversions
3. Go to payouts page in dashboard
4. Process test payout
5. Verify Whop payment processes
6. Check notification sent

## Step 7: Monitoring & Logs

### Vercel Logs

Monitor your deployment:

```bash
vercel logs --prod
```

Or view in dashboard: Project → Deployments → Click deployment → Logs

### Database Monitoring

Use Prisma Studio for database inspection:

```bash
# Locally with production DATABASE_URL
npx prisma studio
```

### Webhook Monitoring

Check webhook delivery status in Whop dashboard:
- Go to Webhooks → Click webhook → View recent deliveries

## Step 8: Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Whop dashboard URLs updated
- [ ] Webhooks configured and tested
- [ ] Permissions requested and approved
- [ ] End-to-end flow tested
- [ ] Error monitoring set up (Sentry recommended)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics tracking added (optional)

## Troubleshooting

### Issue: "Invalid API Key"

**Solution**: Verify `WHOP_API_KEY` is correct and not wrapped in quotes in Vercel environment variables.

### Issue: Database Connection Errors

**Solution**: 
1. Check `DATABASE_URL` format: `postgresql://user:password@host:5432/database`
2. Ensure database allows connections from Vercel IPs
3. Check SSL requirements (add `?sslmode=require` if needed)

### Issue: Webhooks Not Received

**Solution**:
1. Verify webhook URL is correct (include `/api/webhooks`)
2. Check webhook secret matches environment variable
3. View webhook delivery attempts in Whop dashboard
4. Check Vercel function logs for errors

### Issue: Prisma Client Not Found

**Solution**:
1. Ensure `prisma generate` runs in build step
2. Check `package.json` scripts include postinstall:
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```
3. Redeploy after adding script

### Issue: Access Denied Errors

**Solution**:
1. Ensure user is an admin of the company (dashboard)
2. Ensure user is a member of the experience (experience view)
3. Check permissions are approved in Whop dashboard

## Rollback Procedure

If issues occur after deployment:

1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production
4. Previous version becomes live immediately

## Performance Optimization

### Database Connection Pooling

For high traffic, use Prisma Data Proxy or connection pooler:

```env
# Instead of direct DATABASE_URL
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=xxx"
```

### Caching

Consider adding caching for:
- Program settings (rarely change)
- Offer lists (invalidate on update)
- Earnings aggregations (cache with 5min TTL)

### Function Regions

Deploy to regions close to your users:
- US: `iad1` (Washington DC)
- EU: `fra1` (Frankfurt)
- APAC: `sin1` (Singapore)

## Maintenance

### Weekly Tasks
- Review error logs
- Check webhook delivery success rate
- Monitor database size

### Monthly Tasks
- Review and optimize slow queries
- Update dependencies
- Backup database
- Review access logs for security

### As Needed
- Scale database resources
- Update Whop SDK version
- Apply security patches

## Support Resources

- **Whop Developer Docs**: https://whop.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://prisma.io/docs

## Success Metrics

After deployment, monitor:

- **Activation Rate**: % of installs that create a program
- **Offer Publish Rate**: % of programs that publish an offer  
- **Affiliate Application Rate**: Applications per published offer
- **Payout Success Rate**: % of payouts processed successfully
- **Error Rate**: < 1% on critical endpoints
- **P95 Response Time**: < 500ms for dashboard pages

Target: 7 of 10 installs should publish an offer within 21 days.

