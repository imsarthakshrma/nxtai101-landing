# NXTAI101 Setup Guide

Complete setup instructions for the Spark 101 payment and enrollment system.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Razorpay account
- Supabase account
- Resend account

---

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js resend
```

You already have `razorpay` installed. The `crypto` module is built into Node.js.

---

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for database to provision

### 2.2 Run Database Migration

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase-schema.sql`
3. Paste and run the SQL
4. Verify tables created: `sessions` and `enrollments`

### 2.3 Get API Keys

1. Go to Project Settings → API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 3: Set Up Razorpay

### 3.1 Get API Keys

1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Navigate to Settings → API Keys
3. Generate Test Keys (or use existing)
4. Copy:
   - `Key ID` → `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`

### 3.2 Set Up Webhook

1. Go to Settings → Webhooks
2. Click "Add New Webhook"
3. Enter webhook URL: `https://your-domain.com/api/razorpay/webhook`
   - For local testing: Use ngrok or similar tunnel
4. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
5. Copy `Webhook Secret` → `RAZORPAY_WEBHOOK_SECRET`

---

## Step 4: Set Up Resend

### 4.1 Create Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 4.2 Get API Key

1. Go to API Keys
2. Create new API key
3. Copy key → `RESEND_API_KEY`

### 4.3 Verify Domain (Optional for Production)

1. Go to Domains
2. Add your domain (e.g., nxtai101.com)
3. Add DNS records as instructed
4. Wait for verification

For testing, you can use `onboarding@resend.dev` as the sender.

---

## Step 5: Configure Environment Variables

### 5.1 Create .env.local

```bash
cp env.example .env.local
```

### 5.2 Fill in Values

Edit `.env.local` and add all your keys:

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Resend
RESEND_API_KEY=re_xxxxx

# Admin
ADMIN_PASSWORD=your_secure_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6: Update Email Sender (if needed)

If you haven't verified your domain in Resend, update the sender in `src/lib/email.ts`:

```typescript
// Change this line:
from: 'NXTAI101 <hello@nxtai101.com>',

// To this (for testing):
from: 'NXTAI101 <onboarding@resend.dev>',
```

---

## Step 7: Run the Application

### 7.1 Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### 7.2 Test the Flow

1. Click "Enroll in Spark 101" button
2. Select a session
3. Fill in enrollment form
4. Complete test payment (use Razorpay test cards)
5. Verify email received
6. Check Supabase database for enrollment record

---

## Step 8: Razorpay Test Cards

Use these test card numbers for testing:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`

More test cards: [razorpay.com/docs/payments/payments/test-card-details](https://razorpay.com/docs/payments/payments/test-card-details)

---

## Step 9: Create Test Session

### Option 1: Via SQL

Run in Supabase SQL Editor:

```sql
INSERT INTO sessions (title, session_date, zoom_link, zoom_meeting_id, zoom_passcode, max_capacity)
VALUES (
  'Spark 101 - Test Session',
  '2025-01-20 19:00:00+05:30',  -- Change to future date
  'https://zoom.us/j/123456789',
  '123 456 789',
  'spark101',
  150
);
```

### Option 2: Via Admin Dashboard (Coming Soon)

Once admin dashboard is built, you can create sessions through the UI.

---

## Step 10: Testing Webhooks Locally

Razorpay webhooks won't work on localhost. Use ngrok:

### 10.1 Install ngrok

```bash
npm install -g ngrok
```

### 10.2 Start ngrok

```bash
ngrok http 3000
```

### 10.3 Update Webhook URL

1. Copy ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Go to Razorpay Dashboard → Webhooks
3. Update webhook URL to: `https://abc123.ngrok.io/api/razorpay/webhook`

---

## Troubleshooting

### Issue: "Failed to fetch sessions"

**Solution:** Check Supabase connection and RLS policies.

```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'sessions';
```

### Issue: "Payment verification failed"

**Solution:** Check Razorpay keys are correct in `.env.local`

### Issue: "Email not received"

**Solutions:**
1. Check spam folder
2. Verify Resend API key
3. Check email logs in Resend dashboard
4. For testing, use `onboarding@resend.dev` as sender

### Issue: "Session is full" but it's not

**Solution:** Reset enrollment count:

```sql
UPDATE sessions
SET current_enrollments = 0
WHERE id = 'your-session-id';
```

---

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update Razorpay webhook URL to production domain

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel:
- Settings → Environment Variables
- Add each variable
- Redeploy

---

## Next Steps

1. ✅ Test complete payment flow
2. ✅ Verify email delivery
3. ✅ Check database records
4. 🔲 Build admin dashboard
5. 🔲 Add more sessions
6. 🔲 Go live with real Razorpay keys

---

## Support

- **Razorpay:** support@razorpay.com
- **Supabase:** support@supabase.com
- **Resend:** support@resend.com

---

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use test keys for development
- [ ] Switch to live keys only in production
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- [ ] Keep `RAZORPAY_KEY_SECRET` secret
- [ ] Enable webhook signature verification
- [ ] Use HTTPS in production

---

**You're all set! 🚀**

Run `npm run dev` and test the enrollment flow.
