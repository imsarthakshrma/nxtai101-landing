# 🚀 Deployment Checklist for NXTAI101

## ✅ Pre-Deployment Checklist

### 1. **Environment Variables**

#### Production Environment Variables to Set:
```env
# Razorpay - SWITCH TO LIVE KEYS
RAZORPAY_KEY_ID=rzp_live_xxxxx                    # ⚠️ Change from test to live
RAZORPAY_KEY_SECRET=xxxxx                         # ⚠️ Change from test to live
RAZORPAY_WEBHOOK_SECRET=xxxxx                     # ⚠️ Generate new webhook secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx        # ⚠️ Change from test to live

# Supabase - Production Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Resend - Already configured ✅
RESEND_API_KEY=re_Q6zjArrQ_3hszy9AECwoBJTRMiowYkgpx

# Admin
ADMIN_PASSWORD=xxxxx                              # ⚠️ Use a strong password

# App URL - Update to production domain
NEXT_PUBLIC_APP_URL=https://nxtai101.com          # ⚠️ Change from localhost
```

---

### 2. **Razorpay Configuration**

#### A. Switch to Live Mode
- [ ] Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [ ] Switch from **Test Mode** to **Live Mode** (toggle in top-right)
- [ ] Copy **Live Key ID** and **Live Key Secret**
- [ ] Update environment variables

#### B. Configure Webhook for Production
- [ ] Go to Settings → Webhooks
- [ ] Create new webhook with URL: `https://nxtai101.com/api/razorpay/webhook`
- [ ] Select events:
  - ✅ `payment.captured`
  - ✅ `payment.failed`
  - ✅ `order.paid`
- [ ] Copy the **Webhook Secret**
- [ ] Update `RAZORPAY_WEBHOOK_SECRET` in production env

#### C. Test Payment Flow
- [ ] Make a test payment with a real card (₹1 or ₹199)
- [ ] Verify webhook is received
- [ ] Check database enrollment is created
- [ ] Verify email is sent
- [ ] Refund the test payment

---

### 3. **Supabase Database**

#### A. Run Production Schema
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] SQL Editor → Run `supabase-schema.sql`
- [ ] Verify all tables are created:
  - `sessions`
  - `enrollments`

#### B. Add Price Column (if not already done)
```sql
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 199;

UPDATE sessions 
SET price = 199 
WHERE price IS NULL OR price = 0;
```

#### C. Create First Session
```sql
INSERT INTO sessions (
  title,
  session_date,
  duration_minutes,
  zoom_link,
  zoom_meeting_id,
  zoom_passcode,
  max_capacity,
  price,
  status
) VALUES (
  'Spark 101 - The AI Awakening Session',
  '2025-10-25T19:00:00+05:30',  -- Update to actual date
  60,
  'https://zoom.us/j/YOUR_MEETING_ID?pwd=YOUR_PASSWORD',
  'YOUR MEETING ID',
  'YOUR PASSCODE',
  150,
  199,
  'upcoming'
);
```

#### D. Update Unique Index (if not already done)
```sql
-- Drop old index
DROP INDEX IF EXISTS idx_unique_session_email;

-- Create new partial unique index (only for successful payments)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_session_email_success 
  ON enrollments(session_id, email) 
  WHERE payment_status = 'success';
```

---

### 4. **Email Configuration (Resend)**

#### Already Configured ✅
- [x] Domain verified: `no-reply.nxtai101.com`
- [x] Sender email: `no-reply@nxtai101.com`
- [x] API key set in environment

#### Optional Improvements:
- [ ] Add custom reply-to email: `hello@nxtai101.com`
- [ ] Set up email forwarding for `no-reply@nxtai101.com`
- [ ] Test email delivery to Gmail, Outlook, Yahoo

---

### 5. **Domain & Hosting**

#### A. Domain Setup
- [ ] Domain registered: `nxtai101.com`
- [ ] DNS configured
- [ ] SSL certificate (auto-configured by Vercel/hosting provider)

#### B. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### C. Set Environment Variables in Vercel
- [ ] Go to Vercel Dashboard → Project → Settings → Environment Variables
- [ ] Add all production environment variables
- [ ] Redeploy after adding variables

---

### 6. **Security Checks**

- [ ] **Admin password** is strong (not "admin123")
- [ ] **Webhook secret** is set and verified
- [ ] **Service role key** is kept secret (never exposed to client)
- [ ] **API keys** are in environment variables (not hardcoded)
- [ ] **CORS** is configured properly
- [ ] **Rate limiting** considered (optional but recommended)

---

### 7. **Testing Checklist**

#### A. Payment Flow
- [ ] Test successful payment
- [ ] Test payment failure
- [ ] Test payment cancellation
- [ ] Test duplicate enrollment prevention
- [ ] Test retry after failed payment

#### B. Email Delivery
- [ ] Test confirmation email
- [ ] Check spam folder
- [ ] Verify calendar invite attachment
- [ ] Test on multiple email providers (Gmail, Outlook, Yahoo)

#### C. Session Management
- [ ] Test session full scenario
- [ ] Test session selection
- [ ] Test multiple sessions
- [ ] Verify capacity updates correctly

#### D. Admin Dashboard
- [ ] Test admin login
- [ ] View enrollments
- [ ] Check session list
- [ ] Verify data accuracy

#### E. Mobile Responsiveness
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Test on tablet
- [ ] Test form submission on mobile

---

### 8. **Performance Optimization**

- [ ] Enable caching for static assets
- [ ] Optimize images (use Next.js Image component)
- [ ] Enable compression
- [ ] Test page load speed (aim for < 3 seconds)
- [ ] Check Lighthouse score (aim for > 90)

---

### 9. **Legal & Compliance**

- [ ] **Privacy Policy** is finalized and accessible
- [ ] **Terms & Conditions** are finalized and accessible
- [ ] **Refund Policy** is clear
- [ ] **GST compliance** (if applicable in India)
- [ ] **Cookie consent** (if using analytics)

---

### 10. **Analytics & Monitoring**

#### A. Add Analytics (Optional but Recommended)
```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### B. Error Tracking (Optional)
- [ ] Set up Sentry or similar error tracking
- [ ] Configure error alerts
- [ ] Set up uptime monitoring

---

### 11. **Content Review**

- [ ] **Landing page** copy is final
- [ ] **Session descriptions** are accurate
- [ ] **Pricing** is correct (₹199)
- [ ] **Contact information** is correct
- [ ] **Social media links** are added (if applicable)
- [ ] **Logo and branding** are finalized

---

### 12. **Backup & Recovery**

- [ ] **Database backup** strategy in place
- [ ] **Environment variables** backed up securely
- [ ] **Code** pushed to Git repository
- [ ] **Deployment rollback** plan ready

---

### 13. **Post-Deployment Tasks**

#### Immediately After Deployment:
- [ ] Test live payment with ₹1
- [ ] Verify webhook is working
- [ ] Check email delivery
- [ ] Test admin dashboard
- [ ] Monitor error logs

#### Within 24 Hours:
- [ ] Share with test users
- [ ] Collect feedback
- [ ] Fix any critical bugs
- [ ] Monitor payment success rate
- [ ] Check email delivery rate

#### Within 1 Week:
- [ ] Analyze user behavior
- [ ] Optimize conversion funnel
- [ ] Add missing features
- [ ] Improve UX based on feedback

---

## 🚨 Critical Items (Must Do Before Launch)

1. ✅ **Switch Razorpay to Live Mode**
2. ✅ **Update Production Webhook URL**
3. ✅ **Create Real Session in Database**
4. ✅ **Set Strong Admin Password**
5. ✅ **Update NEXT_PUBLIC_APP_URL**
6. ✅ **Test Live Payment Flow**
7. ✅ **Verify Email Delivery**

---

## 📝 Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
# ... add all other env vars
```

### Alternative: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import Git repository
3. Add environment variables
4. Deploy

---

## 🔍 Post-Deployment Monitoring

### Key Metrics to Track:
- **Payment Success Rate** (target: > 95%)
- **Email Delivery Rate** (target: > 98%)
- **Page Load Time** (target: < 3s)
- **Conversion Rate** (visitors → enrollments)
- **Error Rate** (target: < 1%)

### Where to Monitor:
- **Razorpay Dashboard**: Payment analytics
- **Resend Dashboard**: Email delivery stats
- **Vercel Dashboard**: Performance metrics
- **Supabase Dashboard**: Database queries
- **Browser Console**: Client-side errors

---

## 🆘 Emergency Contacts & Resources

### If Something Goes Wrong:
1. **Payment Issues**: Check Razorpay Dashboard → Logs
2. **Email Issues**: Check Resend Dashboard → Logs
3. **Database Issues**: Check Supabase Dashboard → Logs
4. **Deployment Issues**: Check Vercel Dashboard → Deployments

### Support Links:
- [Razorpay Support](https://razorpay.com/support/)
- [Resend Support](https://resend.com/support)
- [Supabase Support](https://supabase.com/support)
- [Vercel Support](https://vercel.com/support)

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set
- [ ] Razorpay in live mode
- [ ] Webhook configured and tested
- [ ] Real session created in database
- [ ] Test payment successful
- [ ] Email delivery confirmed
- [ ] Mobile responsive
- [ ] Admin dashboard accessible
- [ ] Legal pages accessible
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Analytics set up
- [ ] Backup strategy in place

---

**Once all items are checked, you're ready to launch! 🚀**

Good luck with your launch! 🎉
