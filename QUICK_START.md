# Quick Start Guide - Affiliate Launcher

Get your Affiliate Launcher up and running in minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database ready
- [ ] Whop developer account
- [ ] Git repository created

## 5-Minute Setup

### 1. Install Dependencies (2 min)

```bash
cd "Affiliate App"
npm install
```

### 2. Configure Environment (1 min)

Create `.env.local` file:

```env
# Get these from https://whop.com/dashboard/developer/
WHOP_API_KEY=your_api_key_here
NEXT_PUBLIC_WHOP_APP_ID=your_app_id_here

# Your PostgreSQL database
DATABASE_URL=postgresql://user:password@localhost:5432/affiliate_launcher

# Will add after webhook setup
WHOP_WEBHOOK_SECRET=
```

### 3. Setup Database (1 min)

```bash
# Run migrations
npm run db:migrate

# Verify schema
npm run db:studio
```

### 4. Start Development Server (1 min)

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Configure Whop Dashboard (immediate)

1. Go to https://whop.com/dashboard/developer/
2. Select your app
3. Set paths:
   - Dashboard: `/dashboard/[companyId]/[restPath]`
   - Experience: `/experiences/[experienceId]/[restPath]`
   - Discover: `/discover`

## First Test

### Test Dashboard Access

1. Install app into your test Whop company
2. Open dashboard from Whop (should open your local dev server)
3. Create a program:
   - Rate: 10%
   - Frequency: Monthly
   - Save

✅ If program saves successfully, you're ready to go!

### Test Experience View

1. Add an experience to your test company
2. Open experience view (should open your local dev server)
3. Apply to affiliate program
4. Approve from dashboard
5. Check that affiliate link appears

✅ If link shows `company-url?affiliate=USER_ID`, it's working!

## Common Issues

### "Invalid API Key"
→ Check WHOP_API_KEY in .env.local

### Database Connection Error
→ Verify DATABASE_URL format and database is running

### Webhooks Not Working
→ Set up ngrok tunnel for local testing:
```bash
npx ngrok http 3000
```
Use ngrok URL in webhook settings

## Next Steps

Once local development works:

1. **Deploy to Vercel**
   - See `DEPLOYMENT.md` for full guide
   - Set environment variables in Vercel
   - Run migrations in production

2. **Configure Production Webhooks**
   - Update webhook URL to production
   - Add WHOP_WEBHOOK_SECRET to environment

3. **Request Permissions**
   - member:basic:read
   - payment:read
   - payment:write

4. **Run Tests**
   - Follow `TESTING_GUIDE.md`
   - Test end-to-end affiliate flow
   - Verify payouts work

## Development Workflow

```bash
# Start dev server
npm run dev

# View database
npm run db:studio

# Create migration after schema changes
npm run db:migrate

# Check for errors
npm run lint
```

## File Structure

Key files to know:

```
app/
├── api/              # API endpoints
├── dashboard/        # Creator views
├── experiences/      # Affiliate views
└── discover/         # Public page

lib/
├── whop-sdk.ts      # Whop integration
├── access.ts        # Permission checks
├── notifications.ts  # Push notifications
└── prisma.ts        # Database client

prisma/
└── schema.prisma    # Database schema
```

## Getting Help

- **Full Setup**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Testing**: See `TESTING_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

## Success Checklist

Before deploying to production:

- [ ] Local development server runs
- [ ] Can create program in dashboard
- [ ] Can publish offer
- [ ] Can apply as affiliate in experience view
- [ ] Can approve affiliate from dashboard
- [ ] Affiliate link generates correctly
- [ ] No console errors
- [ ] Database migrations applied
- [ ] All environment variables set

## Production Deployment (5 min)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial Affiliate Launcher v1"
git push

# 2. Deploy to Vercel
# - Import repository in Vercel dashboard
# - Add environment variables
# - Deploy

# 3. Run migrations
vercel --prod
# Then in deployment logs or via:
npx prisma migrate deploy

# 4. Update Whop dashboard URLs to production

# 5. Test end-to-end flow
```

That's it! You now have a complete affiliate program management system.

## Support

Questions? Check:
1. This guide
2. `README.md` - Full documentation
3. `TESTING_GUIDE.md` - Troubleshooting
4. Whop docs: https://whop.com/docs

