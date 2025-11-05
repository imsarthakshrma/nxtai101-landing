# NXTAI101 System Architecture

**Version:** 1.0  
**Last Updated:** October 7, 2025  
**Project:** Spark 101 Payment & Enrollment System

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Flow](#system-flow)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Email System](#email-system)
7. [Frontend Components](#frontend-components)
8. [Admin Dashboard](#admin-dashboard)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Environment Variables](#environment-variables)
12. [Error Handling & Edge Cases](#error-handling--edge-cases)
13. [Future Enhancements](#future-enhancements)

---

## Overview

### Business Model
NXTAI101 offers live AI education sessions via Zoom. The first course, **Spark 101**, is a 60-minute crash course priced at ₹199, with approximately 150 participants per session.

### System Purpose
This system handles:
- Session scheduling and management
- Payment processing via Razorpay
- User enrollment and data collection
- Automated email confirmations with Zoom links
- Admin operations (view enrollments, resend emails, export data)

### Key Requirements
- ✅ No user accounts (guest checkout)
- ✅ Pre-scheduled sessions with capacity limits (150 max)
- ✅ Unique Zoom link per session
- ✅ Automated email delivery with calendar invites
- ✅ Admin dashboard for operations
- ✅ Payment verification and webhook handling

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework with SSR |
| **UI Components** | shadcn/ui + Radix UI | Pre-built accessible components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Database** | Supabase (PostgreSQL) | Hosted database with real-time features |
| **Payment Gateway** | Razorpay | Indian payment processing |
| **Email Service** | Resend | Transactional email delivery |
| **Hosting** | Vercel | Serverless deployment |
| **Language** | TypeScript | Type-safe development |

---

## System Flow

### User Enrollment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. Landing Page (nxtai101.com)
   │
   ├─→ User clicks "Enroll in Spark 101"
   │
2. Session Selection Modal
   │
   ├─→ User selects session date
   │   (Shows: Date, Time, Available Seats)
   │
3. Enrollment Form
   │
   ├─→ User fills:
   │   • Name (required)
   │   • Email (required)
   │   • Phone (required)
   │   • Company (optional)
   │   • LinkedIn (optional)
   │
4. Razorpay Checkout Opens
   │
   ├─→ User completes payment (₹199)
   │
5. Payment Processing
   │
   ├─→ Frontend: Verify signature
   ├─→ Backend: Webhook receives event
   ├─→ Database: Update enrollment status
   │
6. Success Page
   │
   ├─→ Show confirmation
   ├─→ Display Zoom link
   ├─→ "Check your email" message
   │
7. Email Delivery
   │
   └─→ Confirmation email sent via Resend
       • Payment receipt
       • Session details
       • Zoom link + passcode
       • Calendar invite (.ics)
```

### Payment Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT VERIFICATION                          │
└─────────────────────────────────────────────────────────────────┘

Frontend Verification (Immediate)
   │
   ├─→ User completes Razorpay checkout
   ├─→ Razorpay returns: order_id, payment_id, signature
   ├─→ POST /api/razorpay/verify-payment
   ├─→ Server verifies HMAC signature
   ├─→ Update database: payment_status = 'success'
   ├─→ Trigger email send
   └─→ Redirect to success page

Webhook Verification (Backup)
   │
   ├─→ Razorpay sends webhook: payment.captured
   ├─→ POST /api/razorpay/webhook
   ├─→ Verify webhook signature
   ├─→ Check if already processed
   ├─→ If not processed: Update database + Send email
   └─→ Return 200 OK
```

---

## Database Schema

### Supabase Tables

#### Table 1: `sessions`

Stores all scheduled Spark 101 sessions.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session Info
  title TEXT NOT NULL,                    -- "Spark 101 - Jan 15, 2025"
  session_date TIMESTAMPTZ NOT NULL,      -- 2025-01-15 19:00:00+05:30
  duration_minutes INTEGER DEFAULT 60,
  
  -- Zoom Details
  zoom_link TEXT NOT NULL,                -- Unique Zoom link per session
  zoom_meeting_id TEXT,                   -- Optional: 123 456 7890
  zoom_passcode TEXT,                     -- Optional: abc123
  
  -- Capacity Management
  max_capacity INTEGER DEFAULT 150,       -- Max participants
  current_enrollments INTEGER DEFAULT 0,  -- Auto-incremented on enrollment
  
  -- Status
  status TEXT DEFAULT 'upcoming',         -- upcoming | ongoing | completed | cancelled
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);
```

**Sample Data:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Spark 101 - January 15, 2025",
  "session_date": "2025-01-15T19:00:00+05:30",
  "duration_minutes": 60,
  "zoom_link": "https://zoom.us/j/123456789",
  "zoom_meeting_id": "123 456 789",
  "zoom_passcode": "spark101",
  "max_capacity": 150,
  "current_enrollments": 47,
  "status": "upcoming"
}
```

---

#### Table 2: `enrollments`

Stores all user enrollments and payment details.

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- User Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,                           -- Optional
  linkedin_url TEXT,                      -- Optional
  
  -- Payment Details
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount_paid INTEGER NOT NULL,           -- In paise (19900 = ₹199)
  currency TEXT DEFAULT 'INR',
  payment_status TEXT DEFAULT 'pending',  -- pending | success | failed | refunded
  
  -- Email Tracking
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  confirmation_email_id TEXT,             -- Resend email ID for tracking
  
  -- Payment Timestamps
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  payment_verified_at TIMESTAMPTZ,
  
  -- Marketing Attribution (Optional)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_enrollments_session ON enrollments(session_id);
CREATE INDEX idx_enrollments_email ON enrollments(email);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX idx_enrollments_razorpay_order ON enrollments(razorpay_order_id);
CREATE INDEX idx_enrollments_razorpay_payment ON enrollments(razorpay_payment_id);

-- Prevent duplicate enrollments for same session
CREATE UNIQUE INDEX idx_unique_session_email ON enrollments(session_id, email);
```

**Sample Data:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "company": "Acme Inc",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "razorpay_order_id": "order_NXTAIxxxxxxxxxxx",
  "razorpay_payment_id": "pay_NXTAIxxxxxxxxxxx",
  "razorpay_signature": "abc123...",
  "amount_paid": 19900,
  "currency": "INR",
  "payment_status": "success",
  "email_sent": true,
  "email_sent_at": "2025-01-10T10:30:00Z",
  "payment_verified_at": "2025-01-10T10:29:45Z",
  "enrolled_at": "2025-01-10T10:29:30Z"
}
```

---

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Public can read upcoming sessions
CREATE POLICY "Public can view upcoming sessions"
  ON sessions FOR SELECT
  USING (status = 'upcoming');

-- Only service role can insert/update sessions
CREATE POLICY "Service role can manage sessions"
  ON sessions FOR ALL
  USING (auth.role() = 'service_role');

-- Public can insert enrollments (via API)
CREATE POLICY "Public can create enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (true);

-- Only service role can read/update enrollments
CREATE POLICY "Service role can manage enrollments"
  ON enrollments FOR ALL
  USING (auth.role() = 'service_role');
```

---

## API Architecture

### API Routes Overview

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/sessions/available` | GET | Fetch upcoming sessions | No |
| `/api/razorpay/create-order` | POST | Create Razorpay order | No |
| `/api/razorpay/verify-payment` | POST | Verify payment signature | No |
| `/api/razorpay/webhook` | POST | Handle Razorpay webhooks | Webhook signature |
| `/api/enrollments/send-confirmation` | POST | Resend confirmation email | Admin only |
| `/api/admin/sessions` | GET/POST/PUT | Manage sessions | Admin only |
| `/api/admin/enrollments` | GET | View enrollments | Admin only |

---

### Route 1: `GET /api/sessions/available`

**Purpose:** Fetch upcoming sessions with available seats.

**Request:**
```http
GET /api/sessions/available
```

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Spark 101 - January 15, 2025",
      "session_date": "2025-01-15T19:00:00+05:30",
      "duration_minutes": 60,
      "max_capacity": 150,
      "current_enrollments": 47,
      "available_seats": 103,
      "is_full": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Spark 101 - January 22, 2025",
      "session_date": "2025-01-22T19:00:00+05:30",
      "duration_minutes": 60,
      "max_capacity": 150,
      "current_enrollments": 12,
      "available_seats": 138,
      "is_full": false
    }
  ]
}
```

**Logic:**
```typescript
// Fetch sessions where:
// - status = 'upcoming'
// - session_date > NOW()
// - current_enrollments < max_capacity
// Order by session_date ASC
```

---

### Route 2: `POST /api/razorpay/create-order`

**Purpose:** Create Razorpay order and enrollment record.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 199,
  "user_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "company": "Acme Inc",
    "linkedin_url": "https://linkedin.com/in/johndoe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_NXTAIxxxxxxxxxxx",
    "amount": 19900,
    "currency": "INR",
    "receipt": "receipt_1704902400000"
  },
  "enrollment_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Logic:**
1. Validate session exists and has capacity
2. Check for duplicate enrollment (same email + session)
3. Create enrollment record (status: pending)
4. Create Razorpay order
5. Return order details + enrollment ID

**Error Handling:**
- Session full → 400 "Session is full"
- Session not found → 404 "Session not found"
- Duplicate enrollment → 400 "Already enrolled"
- Razorpay error → 500 "Failed to create order"

---

### Route 3: `POST /api/razorpay/verify-payment`

**Purpose:** Verify payment signature and update enrollment.

**Request:**
```json
{
  "razorpay_order_id": "order_NXTAIxxxxxxxxxxx",
  "razorpay_payment_id": "pay_NXTAIxxxxxxxxxxx",
  "razorpay_signature": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "enrollment_id": "660e8400-e29b-41d4-a716-446655440001",
  "order_id": "order_NXTAIxxxxxxxxxxx",
  "payment_id": "pay_NXTAIxxxxxxxxxxx"
}
```

**Logic:**
1. Verify HMAC signature: `HMAC_SHA256(order_id|payment_id, secret)`
2. Find enrollment by `razorpay_order_id`
3. Update enrollment:
   - `payment_status = 'success'`
   - `razorpay_payment_id = payment_id`
   - `razorpay_signature = signature`
   - `payment_verified_at = NOW()`
4. Increment session `current_enrollments`
5. Trigger email send
6. Return success

**Error Handling:**
- Invalid signature → 400 "Invalid payment signature"
- Enrollment not found → 404 "Enrollment not found"
- Already verified → 200 "Already verified"

---

### Route 4: `POST /api/razorpay/webhook`

**Purpose:** Handle Razorpay webhook events (backup verification).

**Request Headers:**
```
X-Razorpay-Signature: webhook_signature_here
```

**Request Body:**
```json
{
  "entity": "event",
  "account_id": "acc_xxxxx",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_NXTAIxxxxxxxxxxx",
        "amount": 19900,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_NXTAIxxxxxxxxxxx",
        "email": "john@example.com",
        "contact": "+919876543210",
        "created_at": 1704902400
      }
    }
  },
  "created_at": 1704902410
}
```

**Response:**
```json
{
  "success": true
}
```

**Logic:**
1. Verify webhook signature: `HMAC_SHA256(raw_body, webhook_secret)`
2. Parse event type
3. Handle based on event:

**Event: `payment.captured`**
- Find enrollment by `order_id`
- If already processed → return 200
- Update enrollment status to 'success'
- Send confirmation email
- Return 200

**Event: `payment.failed`**
- Find enrollment by `order_id`
- Update status to 'failed'
- Log error details
- Return 200

**Event: `payment.refunded`**
- Find enrollment by `payment_id`
- Update status to 'refunded'
- Send refund confirmation email
- Return 200

**Error Handling:**
- Invalid signature → 400 "Invalid signature"
- Unknown event → 200 (log and ignore)
- Database error → 500 (Razorpay will retry)

---

### Route 5: `POST /api/enrollments/send-confirmation`

**Purpose:** Resend confirmation email (admin feature).

**Request:**
```json
{
  "enrollment_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email_id": "resend_email_id_here"
}
```

**Logic:**
1. Fetch enrollment + session details
2. Generate email with Zoom link
3. Send via Resend
4. Update `email_sent_at` timestamp
5. Return success

---

## Email System

### Email Service: Resend

**Configuration:**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(enrollment, session) {
  const emailHtml = generateConfirmationEmail(enrollment, session);
  const icsFile = generateCalendarInvite(session);
  
  const { data, error } = await resend.emails.send({
    from: 'NXTAI101 <hello@nxtai101.com>',
    to: enrollment.email,
    subject: `✅ You're enrolled in Spark 101 - ${formatDate(session.session_date)}`,
    html: emailHtml,
    attachments: [
      {
        filename: 'spark101-session.ics',
        content: icsFile,
      },
    ],
  });
  
  return { data, error };
}
```

---

### Email Template: Confirmation

**Subject:** `✅ You're enrolled in Spark 101 - January 15, 2025`

**HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .session-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .zoom-link { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to NXTAI101!</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>{{name}}</strong>,</p>
      
      <p>Your payment of <strong>₹199</strong> for Spark 101 is confirmed.</p>
      
      <div class="session-details">
        <h2>📅 Session Details</h2>
        <p><strong>Date:</strong> {{session_date}}</p>
        <p><strong>Time:</strong> {{session_time}} IST</p>
        <p><strong>Duration:</strong> 60 minutes</p>
      </div>
      
      <h3>🔗 Join via Zoom</h3>
      <a href="{{zoom_link}}" class="zoom-link">Join Zoom Session</a>
      
      <p><strong>Meeting ID:</strong> {{zoom_meeting_id}}<br>
      <strong>Passcode:</strong> {{zoom_passcode}}</p>
      
      <p>📎 <strong>Calendar invite attached</strong> - Add to your calendar so you don't miss it!</p>
      
      <h3>What to expect:</h3>
      <ul>
        <li>AI fundamentals explained simply</li>
        <li>Prompt engineering do's and don'ts</li>
        <li>Introduction to context engineering</li>
        <li>Live Q&A with 150 fellow learners</li>
      </ul>
      
      <p><strong>Pro tip:</strong> Join 5 minutes early to test your audio/video.</p>
      
      <p>See you there! 🚀</p>
      
      <p>Team NXTAI101<br>
      <a href="mailto:hello@nxtai101.com">hello@nxtai101.com</a></p>
    </div>
    
    <div class="footer">
      <p>© 2025 NXTAI101. All rights reserved.</p>
      <p>Payment ID: {{razorpay_payment_id}}</p>
    </div>
  </div>
</body>
</html>
```

---

### Calendar Invite (.ics file)

```typescript
function generateCalendarInvite(session) {
  const startDate = new Date(session.session_date);
  const endDate = new Date(startDate.getTime() + session.duration_minutes * 60000);
  
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NXTAI101//Spark 101//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${session.id}@nxtai101.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Spark 101 - NXTAI101
DESCRIPTION:Join us for Spark 101\\n\\nZoom Link: ${session.zoom_link}\\nMeeting ID: ${session.zoom_meeting_id}\\nPasscode: ${session.zoom_passcode}
LOCATION:${session.zoom_link}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Spark 101 starts in 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
  
  return Buffer.from(ics).toString('base64');
}
```

---

## Frontend Components

### Component 1: Session Selector

**File:** `src/components/session-selector.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function SessionSelector({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  async function fetchSessions() {
    const res = await fetch('/api/sessions/available');
    const data = await res.json();
    setSessions(data.sessions);
    setLoading(false);
  }
  
  return (
    <div className="grid gap-4">
      {sessions.map((session) => (
        <div key={session.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{session.title}</h3>
          <p className="text-sm text-gray-600">
            {format(new Date(session.session_date), 'PPP p')}
          </p>
          <p className="text-sm">
            {session.available_seats} seats available
          </p>
          <Button 
            onClick={() => onSelectSession(session)}
            disabled={session.is_full}
          >
            {session.is_full ? 'Full' : 'Select Session'}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

---

### Component 2: Enrollment Form + Payment

**File:** `src/components/enrollment-form.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RazorpayCheckout } from './razorpay-checkout';

export function EnrollmentForm({ session, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    linkedin_url: '',
  });
  
  const [showPayment, setShowPayment] = useState(false);
  
  function handleSubmit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setShowPayment(true);
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Full Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        type="email"
        placeholder="Email *"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        type="tel"
        placeholder="Phone *"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <Input
        placeholder="Company (Optional)"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
      />
      <Input
        placeholder="LinkedIn URL (Optional)"
        value={formData.linkedin_url}
        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
      />
      
      {!showPayment ? (
        <Button type="submit" className="w-full">
          Proceed to Payment (₹199)
        </Button>
      ) : (
        <RazorpayCheckout
          sessionId={session.id}
          amount={199}
          userInfo={formData}
          onSuccess={onSuccess}
        />
      )}
    </form>
  );
}
```

---

### Component 3: Razorpay Checkout (Updated)

**File:** `src/components/razorpay-checkout.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function RazorpayCheckout({ sessionId, amount, userInfo, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  async function handlePayment() {
    try {
      setLoading(true);
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
      
      // Create order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          amount,
          user_info: userInfo,
        }),
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error);
      }
      
      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'NXTAI101',
        description: 'Spark 101 - AI Fundamentals',
        order_id: orderData.order.id,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        theme: {
          color: '#667eea',
        },
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            toast.success('Payment successful!');
            onSuccess(verifyData.enrollment_id);
          } else {
            throw new Error('Payment verification failed');
          }
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Button onClick={handlePayment} disabled={loading} className="w-full">
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
}
```

---

## Admin Dashboard

### Access
- **URL:** `/admin` (or `team.nxtai101.com` in future)
- **Auth:** Simple password protection (MVP) → Proper auth later

### Pages

#### Page 1: Sessions Management (`/admin/sessions`)

**Features:**
- View all sessions (upcoming, past, cancelled)
- Create new session (form: date, time, Zoom link, capacity)
- Edit session details
- Cancel session
- View enrollment count per session

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Sessions Management                    [+ New]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Upcoming Sessions (3)                              │
│  ┌─────────────────────────────────────────────┐  │
│  │ Spark 101 - Jan 15, 2025                    │  │
│  │ 7:00 PM IST • 47/150 enrolled               │  │
│  │ [Edit] [View Enrollments] [Cancel]          │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Past Sessions (12)                                 │
│  ┌─────────────────────────────────────────────┐  │
│  │ Spark 101 - Dec 20, 2024                    │  │
│  │ Completed • 142/150 attended                 │  │
│  │ [View Details]                               │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

#### Page 2: Enrollments (`/admin/enrollments`)

**Features:**
- View all enrollments (filterable by session)
- Search by name/email
- Export to CSV
- Resend confirmation email
- View payment details
- Mark as refunded

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Enrollments                                        │
├─────────────────────────────────────────────────────┤
│  Filter: [All Sessions ▼]  Search: [___________]   │
│  [Export CSV]                                       │
├─────────────────────────────────────────────────────┤
│  Name          Email           Session      Status  │
│  John Doe      john@...        Jan 15      Success │
│  Jane Smith    jane@...        Jan 15      Success │
│  Bob Wilson    bob@...         Jan 15      Pending │
├─────────────────────────────────────────────────────┤
│  Total: 47 enrollments • Revenue: ₹9,353           │
└─────────────────────────────────────────────────────┘
```

---

## Security & Authentication

### Admin Authentication (MVP)

**Simple Password Protection:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    const password = process.env.ADMIN_PASSWORD;
    
    if (authHeader !== `Bearer ${password}`) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
  }
  
  return NextResponse.next();
}
```

### Future: Proper Admin Auth
- Supabase Auth with admin role
- Email/password login
- Session management
- Multi-admin support

---

### Payment Security

**Razorpay Signature Verification:**
```typescript
import crypto from 'crypto';

function verifyPaymentSignature(orderId, paymentId, signature) {
  const text = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  return generated === signature;
}
```

**Webhook Signature Verification:**
```typescript
function verifyWebhookSignature(body, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  return expected === signature;
}
```

---

## Deployment & Infrastructure

### Hosting: Vercel

**Configuration:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### Database: Supabase

**Setup:**
1. Create project at supabase.com
2. Run SQL migrations
3. Enable Row Level Security
4. Get API keys (anon + service role)

### Email: Resend

**Setup:**
1. Create account at resend.com
2. Verify domain (nxtai101.com)
3. Get API key
4. Test email delivery

### Payment: Razorpay

**Setup:**
1. Create account at razorpay.com
2. Get test keys (rzp_test_xxx)
3. Configure webhook URL: `https://nxtai101.com/api/razorpay/webhook`
4. Enable events: payment.captured, payment.failed, payment.refunded
5. Get webhook secret
6. Switch to live keys for production

---

## Environment Variables

### Required Variables

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Resend
RESEND_API_KEY=re_xxx...

# Admin (MVP)
ADMIN_PASSWORD=your_secure_password

# App
NEXT_PUBLIC_APP_URL=https://nxtai101.com
NODE_ENV=production
```

---

## Error Handling & Edge Cases

### Edge Case 1: Session Full During Payment

**Scenario:** User starts payment, session fills up before completion.

**Solution:**
- Check capacity in `create-order` API
- Lock seat temporarily (5 min timeout)
- If payment fails, release seat

---

### Edge Case 2: Payment Success but Email Fails

**Scenario:** Payment captured but email service down.

**Solution:**
- Webhook will retry email send
- Admin can manually resend from dashboard
- Store `email_sent = false` flag

---

### Edge Case 3: User Pays Twice

**Scenario:** User clicks "Pay" multiple times.

**Solution:**
- Unique constraint on `(session_id, email)`
- Check for existing enrollment before creating order
- Show "Already enrolled" message

---

### Edge Case 4: Webhook Arrives Before Frontend Verification

**Scenario:** Webhook processes payment before user sees success page.

**Solution:**
- Both webhook and frontend update database
- Use idempotency: check if already processed
- Return success if already verified

---

### Edge Case 5: Refund Request

**Scenario:** User wants refund.

**Solution:**
- Admin marks enrollment as 'refunded'
- Call Razorpay refund API
- Send refund confirmation email
- Don't delete enrollment (keep for records)

---

## Future Enhancements

### Phase 2: Framework 101 & Summit 101

**New Features Needed:**
- User accounts (multi-day course access)
- Course content delivery
- Progress tracking
- Video hosting integration
- Certificate generation

### Phase 3: Marketing & Analytics

**Features:**
- UTM tracking and attribution
- Conversion funnel analytics
- Email marketing integration (Mailchimp/ConvertKit)
- Referral program
- Discount codes

### Phase 4: Scale & Automation

**Features:**
- Automated session creation
- Zoom API integration (auto-create meetings)
- Reminder emails (24h, 1h before session)
- Post-session feedback forms
- Recording delivery

---

## Appendix

### Useful Commands

```bash
# Install dependencies
npm install razorpay resend @supabase/supabase-js

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
psql -h db.xxx.supabase.co -U postgres -d postgres -f migrations/001_initial.sql
```

### Support Contacts

- **Razorpay Support:** support@razorpay.com
- **Supabase Support:** support@supabase.com
- **Resend Support:** support@resend.com
- **Vercel Support:** support@vercel.com

---

**End of Document**

*Last updated: October 7, 2025*  
*Version: 1.0*  
*Author: NXTAI101 Development Team*
