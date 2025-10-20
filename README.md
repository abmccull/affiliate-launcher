# Affiliate Launcher - Whop App

Complete affiliate program management solution for Whop creators. Launch your affiliate program in under 10 minutes with full automation for offers, applications, creatives, earnings tracking, and payouts.

## Features

- ✅ **Program Setup** - Configure commission rates, payout frequency, and cookie windows
- ✅ **Custom Offers** - Create public, invite-only, or private affiliate offers
- ✅ **Affiliate Management** - Approve/reject applications, set custom rates and tiers
- ✅ **Creative Assets** - Upload and manage marketing materials for affiliates
- ✅ **Earnings Tracking** - Real-time tracking of clicks, conversions, and commissions
- ✅ **One-Click Payouts** - Process batch payouts via Whop's payment system
- ✅ **Push Notifications** - Auto-notify affiliates about offers, creatives, and payouts
- ✅ **Dashboard View** - Creator dashboard for program management
- ✅ **Experience View** - Affiliate portal for members
- ✅ **Discover View** - Public marketing page

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **SDK**: @whop/api for Whop integration
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (22+ recommended)
- PostgreSQL database
- Whop account and app credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd affiliate-launcher
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Whop Configuration
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_app_id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/affiliate_launcher

# Webhook Secret
WHOP_WEBHOOK_SECRET=your_webhook_secret

# Optional: Access Pass Plan ID (for Pro tier)
NEXT_PUBLIC_PRO_PLAN_ID=plan_pro
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Whop Dashboard Configuration

### 1. App Settings

Go to https://whop.com/dashboard/developer/ and configure:

- **App Name**: Affiliate Launcher
- **Description**: Complete affiliate program management solution
- **Base URL**: Your deployment URL (e.g., https://your-app.vercel.app)

### 2. Hosting Configuration

Set up the following paths in the Hosting section:

- **Dashboard View**: `/dashboard/[companyId]/[restPath]`
- **Experience View**: `/experiences/[experienceId]/[restPath]`
- **Discover View**: `/discover`

### 3. Webhooks

Create a webhook endpoint:

- **URL**: `https://your-app.vercel.app/api/webhooks`
- **Events**: `payment.succeeded`
- Copy the webhook secret to your `.env.local`

### 4. Permissions

Request the following permissions:

- `member:basic:read` - View affiliate information
- `payment:read` - View earnings and commissions
- `payment:write` - Process payouts to affiliates

## Database Schema

The app uses the following main tables:

- **Program** - Affiliate program configuration per company
- **Offer** - Individual affiliate offers/campaigns
- **Affiliate** - User applications and affiliate records
- **Creative** - Marketing assets for affiliates
- **EarningsEvent** - Track clicks, conversions, and payouts
- **PayoutBatch** - Batch payout processing records

## API Routes

### Programs
- `GET /api/programs?companyId={id}` - Get program
- `POST /api/programs` - Create/update program

### Offers
- `GET /api/offers?programId={id}&companyId={id}` - List offers
- `POST /api/offers` - Create offer
- `GET /api/offers/[offerId]` - Get offer details
- `PUT /api/offers/[offerId]` - Update offer (includes publish)
- `DELETE /api/offers/[offerId]` - Delete offer

### Affiliates
- `GET /api/affiliates?programId={id}&companyId={id}` - List affiliates
- `POST /api/affiliates/apply` - Apply to program
- `GET /api/affiliates/[affiliateId]` - Get affiliate details
- `PUT /api/affiliates/[affiliateId]` - Update affiliate (rates, tiers)
- `PUT /api/affiliates/[affiliateId]/approve` - Approve application
- `PUT /api/affiliates/[affiliateId]/reject` - Reject application
- `GET /api/affiliates/me/earnings` - Get current user's earnings

### Creatives
- `GET /api/creatives?offerId={id}&companyId={id}` - List creatives
- `POST /api/creatives/upload` - Upload creative (multipart/form-data)
- `DELETE /api/creatives/[creativeId]` - Delete creative

### Earnings & Payouts
- `GET /api/earnings?programId={id}&companyId={id}` - Get aggregated earnings
- `GET /api/payouts?programId={id}&companyId={id}` - Get payout history
- `POST /api/payouts/process` - Process batch payouts

### Webhooks
- `POST /api/webhooks` - Handle Whop webhooks

## Notifications

The app automatically sends push notifications for:

- **New Offer Published** - Notifies all experience members
- **New Creative Added** - Notifies all affiliates
- **Application Approved/Rejected** - Notifies specific affiliate
- **Payout Processed** - Notifies affiliate with amount
- **Milestone Reached** - Notifies company admins

All notifications include deep links to relevant sections of the app.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Setup

Use Vercel Postgres or any PostgreSQL provider:

```bash
# After deploying, run migrations
npx prisma migrate deploy
```

### Post-Deployment

1. Update Whop dashboard with production URLs
2. Configure webhook endpoint
3. Test end-to-end flow:
   - Create program
   - Publish offer
   - Apply as affiliate
   - Process payout

## Development

### Running Locally

```bash
npm run dev
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Testing

```bash
# Run linting
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
affiliate-launcher/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Creator dashboard pages
│   ├── experiences/      # Affiliate portal pages
│   ├── discover/         # Public marketing page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── whop-sdk.ts      # Whop SDK configuration
│   ├── prisma.ts        # Prisma client
│   ├── access.ts        # Access control helpers
│   └── notifications.ts  # Notification helpers
├── prisma/
│   └── schema.prisma    # Database schema
└── components/          # Shared React components
```

## Pricing

- **Pro Plan** ($29/mo): Everything you need to scale
  - Unlimited offers & affiliates
  - One-click batch payouts
  - Real-time analytics dashboard
  - Custom commission rates
  - Creative asset library
  - Email support
  - **7-day free trial** - No credit card required

## Support

For issues or questions:
- Create an issue on GitHub
- Contact support@yourdomain.com
- Join our Discord community

## License

MIT License - see LICENSE file for details

## Roadmap

### v1.1
- Batch payout scheduling
- Advanced analytics dashboard
- CSV export for reports
- Email notifications

### v2.0
- Multi-company dashboard
- Milestone automations
- API webhooks for external integrations
- Custom branded affiliate portals
