# GitHub Actions Setup

This repository uses GitHub Actions to automate deployments and run database migrations.

## Workflows

### `deploy.yml` - Automatic Deployment Pipeline

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

1. **migrate** (on push to main only)
   - Runs Prisma database migrations
   - Ensures database schema is up-to-date

2. **deploy-check** (on all pushes and PRs)
   - Lints code
   - Type checks with TypeScript
   - Builds the application
   - Validates deployment readiness

## Required GitHub Secrets

Add these secrets in your repository settings:
https://github.com/abmccull/affiliate-launcher/settings/secrets/actions

### Required Secrets:

1. **VERCEL_ORG_ID**
   - Get from: Vercel Dashboard → Settings → General
   - Copy "Organization ID" or "Team ID"

2. **VERCEL_PROJECT_ID**
   - Get from: Your Vercel project → Settings → General
   - Copy "Project ID"

3. **DATABASE_URL**
   - Your production PostgreSQL connection string
   - Get from: Vercel → Storage → Your database → .env.local tab

4. **WHOP_API_KEY**
   - Your Whop API key
   - Get from: https://whop.com/dashboard/developer/

5. **NEXT_PUBLIC_WHOP_APP_ID**
   - Your Whop App ID
   - Get from: https://whop.com/dashboard/developer/

## Setup Instructions

### 1. Deploy to Vercel First

```bash
# Vercel will auto-deploy from GitHub
# Just connect your repository at vercel.com/new
```

### 2. Add GitHub Secrets

After deploying to Vercel:

1. Get your Vercel Project ID:
   - Go to your Vercel project
   - Settings → General
   - Copy "Project ID"

2. Get your Vercel Org ID:
   - Vercel Dashboard → Settings → General
   - Copy "Organization ID"

3. Add secrets to GitHub:
   - Go to https://github.com/abmccull/affiliate-launcher/settings/secrets/actions
   - Click "New repository secret"
   - Add each secret one by one

### 3. Push to Main

Once secrets are configured, push to `main`:

```bash
git push origin main
```

The GitHub Action will automatically:
- ✅ Run migrations
- ✅ Lint code
- ✅ Type check
- ✅ Build app
- ✅ Validate deployment

## How It Works

1. **You push code** → GitHub receives push
2. **GitHub Actions runs** → Checks and migrations execute
3. **Vercel deploys** → Built-in GitHub integration deploys app
4. **Done!** → Your app is live with migrated database

## Vercel Auto-Deploy

Note: Vercel's built-in GitHub integration handles deployments automatically. The GitHub Action is for:
- Running database migrations
- Pre-deployment checks
- Code quality validation

You get **two layers of automation**:
1. GitHub Actions for migrations and checks
2. Vercel for actual deployment

## Monitoring

- **GitHub Actions**: Check workflow runs at https://github.com/abmccull/affiliate-launcher/actions
- **Vercel Deployments**: Check deployments at https://vercel.com/dashboard

## Troubleshooting

**Migration fails:**
- Check DATABASE_URL secret is correct
- Ensure database is accessible
- Check migration files are committed

**Build fails:**
- Check all secrets are added
- Verify environment variables
- Check TypeScript errors locally first

**Deployment doesn't trigger:**
- Ensure you pushed to `main` branch
- Check GitHub Actions tab for errors
- Verify Vercel GitHub integration is connected

