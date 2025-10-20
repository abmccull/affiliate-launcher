# Testing Guide - Affiliate Launcher

Comprehensive testing guide for validating all features of the Affiliate Launcher Whop app.

## Prerequisites

- App deployed to staging/development environment
- Test Whop company with admin access
- Test experience within the company
- At least 2 test user accounts (admin and affiliate)
- Database access for manual data inspection (optional)

## Test Environment Setup

### 1. Create Test Company

1. Create a test Whop company
2. Install the Affiliate Launcher app
3. Add test experience to the company
4. Invite test users as members

### 2. Test Users

Create these test accounts:

- **Admin User**: Company owner/admin for dashboard testing
- **Affiliate User 1**: Member for affiliate portal testing
- **Affiliate User 2**: Additional affiliate for payout testing

## Test Plan

### Phase 1: Access Controls

#### Test 1.1: Dashboard Access

**Steps:**
1. Login as admin user
2. Navigate to dashboard view
3. Verify access granted with admin level

**Expected:**
- ✅ Dashboard loads successfully
- ✅ User sees admin UI
- ✅ Can access all dashboard sections

#### Test 1.2: Dashboard Access Denied

**Steps:**
1. Login as non-admin user
2. Try to access dashboard view

**Expected:**
- ✅ Access denied message shown
- ✅ No sensitive data exposed

#### Test 1.3: Experience Access

**Steps:**
1. Login as member user
2. Navigate to experience view
3. Verify access granted

**Expected:**
- ✅ Experience view loads
- ✅ Affiliate portal accessible
- ✅ User can see public offers

#### Test 1.4: Experience Access Denied

**Steps:**
1. Login as non-member user
2. Try to access experience view

**Expected:**
- ✅ Access denied message shown

---

### Phase 2: Program Setup (Epic A)

#### Test 2.1: Create Program

**Steps:**
1. Login as admin
2. Go to dashboard
3. Fill program setup form:
   - Default Rate: 10%
   - Payout Frequency: Monthly
   - Cookie Window: 30 days
   - Status: Active
4. Submit form

**Expected:**
- ✅ Program created successfully
- ✅ Success message shown
- ✅ Program data persists in database
- ✅ Stats widgets appear
- ✅ Telemetry event logged: `program_created`

#### Test 2.2: Update Program

**Steps:**
1. Change default rate to 15%
2. Update payout frequency to weekly
3. Submit form

**Expected:**
- ✅ Program updated successfully
- ✅ New values saved
- ✅ Page refreshes with updated data

#### Test 2.3: Program Validation

**Steps:**
1. Try submitting form with invalid data:
   - Rate: -5
   - Rate: 150
   - Cookie window: 0

**Expected:**
- ✅ Validation errors shown
- ✅ Form submission blocked
- ✅ Helpful error messages

---

### Phase 3: Offers Management (Epic B)

#### Test 3.1: Create Offer

**Steps:**
1. Go to Offers page
2. Click "Create Offer"
3. Fill form:
   - Name: "Test Offer 1"
   - Description: "Test offer description"
   - Visibility: Public
   - Commission: 12% (override)
4. Submit

**Expected:**
- ✅ Offer created
- ✅ Appears in offers list
- ✅ Shows as "Draft" status
- ✅ Telemetry event logged: `offer_created`

#### Test 3.2: Publish Offer

**Steps:**
1. Edit the offer
2. Select an experience
3. Check "Published" checkbox
4. Save

**Expected:**
- ✅ Offer marked as published
- ✅ Push notification sent to experience members
- ✅ Notification includes deep link
- ✅ Telemetry event logged: `offer_published`

#### Test 3.3: View Offers in Experience

**Steps:**
1. Login as member user
2. Go to experience view
3. View available offers section

**Expected:**
- ✅ Published offer visible
- ✅ Offer details displayed correctly
- ✅ Commission rate shown
- ✅ Can click to view offer details

---

### Phase 4: Affiliate Management (Epic C)

#### Test 4.1: Apply to Program

**Steps:**
1. Login as affiliate user
2. Go to experience view
3. Click "Apply to Become an Affiliate"
4. Confirm application

**Expected:**
- ✅ Application submitted
- ✅ Status shows "Pending"
- ✅ Affiliate record created in database
- ✅ Telemetry event logged: `affiliate_applied`

#### Test 4.2: Approve Application

**Steps:**
1. Login as admin
2. Go to Affiliates page
3. View pending applications
4. Click approve on test affiliate
5. Set custom rate (optional)
6. Confirm approval

**Expected:**
- ✅ Application approved
- ✅ Status changed to "Approved"
- ✅ Push notification sent to affiliate
- ✅ Telemetry event logged: `affiliate_approved`

#### Test 4.3: Affiliate Link Generation

**Steps:**
1. Login as approved affiliate
2. Go to experience view
3. View "Your Affiliate Link" section
4. Copy link

**Expected:**
- ✅ Link format: `company-url?affiliate=USER_ID`
- ✅ Copy button works
- ✅ Commission rate displayed
- ✅ Tier shown (if assigned)

#### Test 4.4: Set Custom Rates

**Steps:**
1. Login as admin
2. Go to affiliate detail page
3. Set custom rate: 20%
4. Set tier: "Gold"
5. Set rate expiry: 30 days from now
6. Save

**Expected:**
- ✅ Custom rate saved
- ✅ Tier assigned
- ✅ Expiry date set
- ✅ Affiliate sees updated rate in portal

#### Test 4.5: Reject Application

**Steps:**
1. Login as admin
2. Create another affiliate application
3. Reject the application

**Expected:**
- ✅ Status changed to "Rejected"
- ✅ Notification sent to user
- ✅ Telemetry event logged: `affiliate_rejected`

---

### Phase 5: Creatives Management (Epic D)

#### Test 5.1: Upload Creative

**Steps:**
1. Login as admin
2. Go to Creatives page
3. Click upload
4. Select test image file
5. Fill form:
   - Title: "Test Banner"
   - Type: Image
   - Offer: Select offer
   - Notes: "Use on social media"
6. Upload

**Expected:**
- ✅ File uploads to Whop
- ✅ Creative record created
- ✅ Push notification sent to affiliates
- ✅ Telemetry event logged: `creative_uploaded`

#### Test 5.2: View Creatives (Affiliate)

**Steps:**
1. Login as approved affiliate
2. Go to Creatives page
3. View available creatives

**Expected:**
- ✅ Uploaded creative visible
- ✅ Preview shown correctly
- ✅ Download button works
- ✅ Usage guidelines displayed

#### Test 5.3: Download Creative

**Steps:**
1. Click download button on a creative

**Expected:**
- ✅ File downloads correctly
- ✅ File name preserved
- ✅ File opens correctly

---

### Phase 6: Earnings & Payouts (Epic E)

#### Test 6.1: Manual Earnings Creation

**Steps:**
1. Access database directly
2. Create test earnings events:
   ```sql
   INSERT INTO "EarningsEvent" (id, "affiliateId", "offerId", type, amount, currency, "createdAt")
   VALUES 
   ('evt_1', 'affiliate_id', 'offer_id', 'click', 0, 'usd', NOW()),
   ('evt_2', 'affiliate_id', 'offer_id', 'conversion', 50.00, 'usd', NOW()),
   ('evt_3', 'affiliate_id', 'offer_id', 'conversion', 75.00, 'usd', NOW());
   ```

**Expected:**
- ✅ Records inserted successfully

#### Test 6.2: View Earnings (Admin)

**Steps:**
1. Login as admin
2. Go to Earnings page
3. View aggregated earnings

**Expected:**
- ✅ Shows total clicks: 1
- ✅ Shows total conversions: 2
- ✅ Shows pending amount: $125.00
- ✅ Top performers widget displays correctly

#### Test 6.3: View Earnings (Affiliate)

**Steps:**
1. Login as affiliate
2. Go to My Earnings page

**Expected:**
- ✅ Shows personal clicks
- ✅ Shows personal conversions
- ✅ Shows pending earnings
- ✅ Shows paid earnings (initially $0)

#### Test 6.4: Process Payout

**Steps:**
1. Login as admin
2. Go to Payouts page
3. Select affiliate with pending earnings
4. Click "Process Payout"
5. Confirm

**Expected:**
- ✅ Payout processed via Whop `payUser` API
- ✅ Payout batch record created
- ✅ Payout events created for affiliate
- ✅ Push notification sent to affiliate
- ✅ Pending earnings reset to $0
- ✅ Paid earnings increased by payout amount
- ✅ Telemetry event logged: `payout_processed`

#### Test 6.5: View Payout History

**Steps:**
1. Go to Payouts page
2. View payout history tab

**Expected:**
- ✅ Recent payout batch visible
- ✅ Shows batch details (amount, count, date)
- ✅ Shows individual payouts
- ✅ Status shows "completed"

---

### Phase 7: Notifications

#### Test 7.1: Offer Published Notification

**Steps:**
1. Publish an offer
2. Check notifications on member device

**Expected:**
- ✅ Push notification received
- ✅ Title: "New Affiliate Offer Available!"
- ✅ Content includes offer name
- ✅ Deep link works: opens to `/offers/{offerId}`
- ✅ `isMention` flag triggers immediate push

#### Test 7.2: Creative Added Notification

**Steps:**
1. Upload a new creative
2. Check affiliate notifications

**Expected:**
- ✅ Push notification received
- ✅ Title mentions new creative
- ✅ Deep link opens to `/creatives`

#### Test 7.3: Application Approved Notification

**Steps:**
1. Approve an affiliate
2. Check user notifications

**Expected:**
- ✅ Notification received
- ✅ Title: "Application Approved!"
- ✅ Deep link opens to experience homepage

#### Test 7.4: Payout Notification

**Steps:**
1. Process payout
2. Check affiliate notifications

**Expected:**
- ✅ Notification received
- ✅ Shows payout amount
- ✅ Deep link opens to `/payouts`

---

### Phase 8: Webhooks

#### Test 8.1: Payment Succeeded Webhook

**Steps:**
1. Make a test payment in Whop
2. Check webhook delivery in Whop dashboard
3. Check server logs

**Expected:**
- ✅ Webhook received
- ✅ Webhook validated correctly
- ✅ Handler processes payment data
- ✅ Returns 200 status quickly
- ✅ Logs show webhook processing

#### Test 8.2: Webhook Validation

**Steps:**
1. Send invalid webhook (wrong signature)
2. Check logs

**Expected:**
- ✅ Validation fails
- ✅ Returns 200 (to prevent retries)
- ✅ Error logged
- ✅ No data processed

---

### Phase 9: Discover View

#### Test 9.1: Public Access

**Steps:**
1. Open discover view in incognito mode (no login)
2. Review page content

**Expected:**
- ✅ Page loads without authentication
- ✅ Features listed correctly
- ✅ Pricing tiers displayed
- ✅ Install button visible
- ✅ Responsive design works

---

### Phase 10: Performance & Edge Cases

#### Test 10.1: Large Data Sets

**Steps:**
1. Create 50+ offers
2. Create 100+ affiliates
3. Navigate dashboard and experience views

**Expected:**
- ✅ Pages load within 2 seconds
- ✅ No performance degradation
- ✅ Pagination works (if implemented)

#### Test 10.2: Concurrent Operations

**Steps:**
1. Have 2 admins edit same offer simultaneously
2. Save changes

**Expected:**
- ✅ Last save wins (optimistic update)
- ✅ No data corruption
- ✅ Users notified if needed

#### Test 10.3: Expired Offers

**Steps:**
1. Create offer with end date in past
2. View in experience

**Expected:**
- ✅ Expired offer not shown (or marked expired)
- ✅ Can't apply to expired offers

#### Test 10.4: Zero Earnings Payout

**Steps:**
1. Try to process payout for affiliate with $0 pending

**Expected:**
- ✅ Payout skipped or error shown
- ✅ No API call made to Whop
- ✅ Appropriate message displayed

#### Test 10.5: Duplicate Applications

**Steps:**
1. Apply to program
2. Try to apply again

**Expected:**
- ✅ Error shown: "Already applied"
- ✅ Existing application returned
- ✅ No duplicate records created

---

## Automated Testing Suggestions

### Unit Tests

Create tests for:
- Access control functions
- Earnings calculations
- Payout processing logic
- Notification formatting

### Integration Tests

Test:
- API routes with mock authentication
- Database operations
- Webhook validation

### E2E Tests (Playwright/Cypress)

Automate:
- Complete affiliate application flow
- Offer creation and publishing
- Payout processing

## Security Checklist

- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS attacks prevented (React escaping)
- [ ] CSRF protection in place
- [ ] API routes require authentication
- [ ] Access checks on all sensitive operations
- [ ] Webhook signatures validated
- [ ] Environment variables not exposed to client
- [ ] No sensitive data in logs
- [ ] Rate limiting on API routes (recommended)

## Performance Benchmarks

Target metrics:
- **Dashboard load**: < 2 seconds
- **Experience load**: < 1.5 seconds
- **API response time**: < 500ms (P95)
- **Database query time**: < 100ms average
- **Webhook processing**: < 200ms
- **Payout processing**: < 5 seconds per affiliate

## Regression Testing

Before each deployment, run:
1. Access control tests
2. Critical user flows (apply, approve, payout)
3. Notification delivery
4. Webhook processing

## Bug Reporting Template

When reporting bugs, include:

```
**Title**: Brief description

**Environment**: Production/Staging/Local

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Console Errors**: Any errors in browser/server console

**User Info**: User ID, company ID, etc (if applicable)

**Additional Context**: Any other relevant information
```

## Success Criteria

The app passes testing if:

- ✅ All Phase 1-9 tests pass
- ✅ No security vulnerabilities found
- ✅ Performance benchmarks met
- ✅ Zero data corruption issues
- ✅ Notifications deliver reliably (>95% rate)
- ✅ Payouts process successfully
- ✅ No critical bugs found

## Known Limitations (v1)

Document any known limitations:
- Earnings tracking is manual (no automatic conversion tracking yet)
- CSV export not yet implemented
- No bulk operations for affiliates
- Limited analytics/reporting

These are acceptable for v1 and can be addressed in future releases.

