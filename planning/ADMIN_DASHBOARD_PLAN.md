# 🎛️ Admin Dashboard - Planning & Implementation Guide

## 📋 Project Overview

**Goal:** Build a comprehensive admin dashboard for managing NXTAI101 sessions, enrollments, and analytics.

**Access:** Password-protected admin panel at `/admin`

**Tech Stack:**
- Next.js 14+ (App Router)
- Supabase (Database & Auth)
- Tailwind CSS + shadcn/ui
- Recharts (for analytics)
- React Hook Form + Zod (form validation)

---

## ✨ Core Features

### 1. **User Metrics Dashboard** 📊

#### Metrics to Display:
- **Total Enrollments** (all time)
- **Revenue Generated** (total & by session)
- **Conversion Rate** (visitors → enrollments)
- **Payment Success Rate** (successful / total attempts)
- **Upcoming Sessions Count**
- **Total Capacity vs. Current Enrollments**

#### Visualizations:
- **Line Chart:** Enrollments over time (daily/weekly/monthly)
- **Bar Chart:** Revenue by session
- **Pie Chart:** Payment status distribution (success/pending/failed)
- **Area Chart:** Traffic & conversion funnel

#### Real-time Stats:
- Live enrollment count
- Today's revenue
- Pending payments
- Session capacity alerts

---

### 2. **Session Management** 🗓️

#### Features:

**A. View All Sessions**
- Table view with columns:
  - Title
  - Date & Time
  - Price (with discount indicator)
  - Capacity (current/max)
  - Status (upcoming/ongoing/completed/cancelled)
  - Actions (Edit/Delete/Duplicate)
- Filters: Status, Date Range, Price
- Search: By title
- Sort: By date, price, enrollments

**B. Create New Session**
- Form fields:
  - Title (text)
  - Date & Time (datetime picker)
  - Duration (minutes)
  - Google Meet Link (URL)
  - Meeting Code (text)
  - PIN (text)
  - Max Capacity (number)
  - Price (number in INR)
  - Discount (optional):
    - Discount Type (percentage/fixed)
    - Discount Amount
    - Discount Code (optional)
    - Valid Until (date)
  - Status (dropdown)
- Validation:
  - Date must be in future
  - Price must be ≥ 0
  - Capacity must be > 0
  - Meeting link must be valid URL

**C. Edit Session**
- Same form as create
- Pre-filled with existing data
- Warning if session has enrollments
- Option to notify enrolled users of changes

**D. Delete Session**
- Confirmation dialog
- Warning if session has enrollments
- Options:
  - Delete only if no enrollments
  - Force delete (refund users)
  - Cancel session (keep data, mark as cancelled)

**E. Duplicate Session**
- Copy all details except date
- Quick way to create recurring sessions

**F. Bulk Actions**
- Select multiple sessions
- Bulk update status
- Bulk delete
- Export to CSV

---

### 3. **Enrollment Management** 👥

#### Features:

**A. View All Enrollments**
- Table view with columns:
  - Name
  - Email
  - Phone
  - Session Title
  - Session Date
  - Amount Paid
  - Payment Status (success/pending/failed/refunded)
  - Payment ID
  - Enrolled At
  - Email Sent Status
  - Actions (View/Refund/Resend Email)
- Filters:
  - Payment Status
  - Session
  - Date Range
  - Email Sent Status
- Search: By name, email, phone, payment ID
- Export to CSV/Excel

**B. Enrollment Details**
- Full user information
- Payment details
- Session information
- Email history
- Timeline of events
- Actions:
  - Resend confirmation email
  - Issue refund
  - Mark as attended
  - Add notes

**C. Payment Status Management**
- Manually mark payment as success/failed
- Issue refunds (with Razorpay integration)
- View payment history
- Download receipt

**D. Email Management**
- Resend confirmation email
- Send custom email to user
- View email delivery status
- Email logs

**E. Analytics by Enrollment**
- UTM source tracking
- Conversion funnel
- Drop-off points

---

## 🏗️ Technical Architecture

### Database Schema Updates

#### New Tables:

**1. `admin_users` Table**
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. `session_discounts` Table**
```sql
CREATE TABLE session_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount INTEGER NOT NULL,
  discount_code TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. `admin_activity_log` Table**
```sql
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Updates to Existing Tables:

**Sessions Table:**
```sql
ALTER TABLE sessions
ADD COLUMN discount_id UUID REFERENCES session_discounts(id),
ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
```

**Enrollments Table:**
```sql
ALTER TABLE enrollments
ADD COLUMN discount_applied INTEGER DEFAULT 0,
ADD COLUMN discount_code_used TEXT,
ADD COLUMN attended BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_notes TEXT;
```

---

### API Routes

#### Admin Authentication:
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Get current admin user

#### Session Management:
- `GET /api/admin/sessions` - List all sessions (with filters)
- `POST /api/admin/sessions` - Create new session
- `GET /api/admin/sessions/[id]` - Get session details
- `PUT /api/admin/sessions/[id]` - Update session
- `DELETE /api/admin/sessions/[id]` - Delete session
- `POST /api/admin/sessions/[id]/duplicate` - Duplicate session
- `POST /api/admin/sessions/bulk-update` - Bulk update sessions

#### Enrollment Management:
- `GET /api/admin/enrollments` - List all enrollments (with filters)
- `GET /api/admin/enrollments/[id]` - Get enrollment details
- `PUT /api/admin/enrollments/[id]` - Update enrollment
- `POST /api/admin/enrollments/[id]/resend-email` - Resend confirmation
- `POST /api/admin/enrollments/[id]/refund` - Issue refund
- `GET /api/admin/enrollments/export` - Export to CSV

#### Analytics:
- `GET /api/admin/analytics/overview` - Dashboard metrics
- `GET /api/admin/analytics/enrollments` - Enrollment trends
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `GET /api/admin/analytics/conversion` - Conversion funnel

#### Discount Management:
- `GET /api/admin/discounts` - List all discounts
- `POST /api/admin/discounts` - Create discount
- `PUT /api/admin/discounts/[id]` - Update discount
- `DELETE /api/admin/discounts/[id]` - Delete discount

---

### Frontend Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── login/
│   │   │   └── page.tsx            # Admin login page
│   │   ├── sessions/
│   │   │   ├── page.tsx            # Sessions list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create session
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Session details
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit session
│   │   ├── enrollments/
│   │   │   ├── page.tsx            # Enrollments list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Enrollment details
│   │   ├── analytics/
│   │   │   └── page.tsx            # Analytics dashboard
│   │   └── settings/
│   │       └── page.tsx            # Admin settings
│   └── api/
│       └── admin/
│           ├── login/
│           ├── sessions/
│           ├── enrollments/
│           ├── analytics/
│           └── discounts/
├── components/
│   └── admin/
│       ├── Sidebar.tsx             # Admin sidebar navigation
│       ├── DashboardCard.tsx       # Metric cards
│       ├── SessionTable.tsx        # Sessions data table
│       ├── SessionForm.tsx         # Create/Edit session form
│       ├── EnrollmentTable.tsx     # Enrollments data table
│       ├── EnrollmentDetails.tsx   # Enrollment detail view
│       ├── AnalyticsChart.tsx      # Charts component
│       ├── DiscountForm.tsx        # Discount creation form
│       └── ExportButton.tsx        # CSV export button
└── lib/
    ├── admin-auth.ts               # Admin authentication helpers
    └── admin-api.ts                # Admin API client functions
```

---

## 🎨 UI/UX Design

### Layout:

```
┌─────────────────────────────────────────────────┐
│  NXTAI101 Admin                    [User Menu]  │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │         Main Content Area           │
│          │                                      │
│ - Dashboard                                     │
│ - Sessions                                      │
│ - Enrollments                                   │
│ - Analytics                                     │
│ - Settings                                      │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Color Scheme:
- Primary: Indigo/Purple (matching main site)
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray

### Components:
- **shadcn/ui** components:
  - Table
  - Dialog
  - Form
  - Select
  - DatePicker
  - Card
  - Badge
  - Button
  - Input
  - Textarea
  - Checkbox
  - Switch

---

## 🔐 Security

### Authentication:
1. **Password-based auth** (for now)
   - Bcrypt password hashing
   - JWT tokens
   - Session management

2. **Future:** OAuth with Google/GitHub

### Authorization:
- Role-based access control (RBAC)
  - **Super Admin:** Full access
  - **Admin:** Manage sessions & enrollments
  - **Viewer:** Read-only access

### Security Measures:
- CSRF protection
- Rate limiting on admin routes
- Activity logging
- IP whitelisting (optional)
- 2FA (future)

---

## 📊 Analytics Implementation

### Metrics Calculation:

**Total Revenue:**
```sql
SELECT SUM(amount_paid) / 100 AS total_revenue
FROM enrollments
WHERE payment_status = 'success';
```

**Conversion Rate:**
```sql
-- Requires page view tracking
SELECT 
  (COUNT(DISTINCT email) * 100.0 / total_visitors) AS conversion_rate
FROM enrollments
WHERE payment_status = 'success';
```

**Payment Success Rate:**
```sql
SELECT 
  (COUNT(CASE WHEN payment_status = 'success' THEN 1 END) * 100.0 / COUNT(*)) AS success_rate
FROM enrollments;
```

**Enrollments Over Time:**
```sql
SELECT 
  DATE(enrolled_at) AS date,
  COUNT(*) AS enrollments
FROM enrollments
WHERE payment_status = 'success'
GROUP BY DATE(enrolled_at)
ORDER BY date;
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation** (Week 1)
- [ ] Set up admin routes structure
- [ ] Create database schema updates
- [ ] Implement admin authentication
- [ ] Build admin layout with sidebar
- [ ] Create dashboard overview page

### **Phase 2: Session Management** (Week 2)
- [ ] Build sessions list page
- [ ] Create session form (create/edit)
- [ ] Implement session CRUD API routes
- [ ] Add session filters & search
- [ ] Implement session deletion with warnings
- [ ] Add duplicate session feature

### **Phase 3: Enrollment Management** (Week 3)
- [ ] Build enrollments list page
- [ ] Create enrollment details page
- [ ] Implement enrollment filters & search
- [ ] Add email resend functionality
- [ ] Implement refund functionality
- [ ] Add CSV export

### **Phase 4: Analytics** (Week 4)
- [ ] Implement analytics API routes
- [ ] Build dashboard metrics cards
- [ ] Create enrollment trends chart
- [ ] Create revenue analytics chart
- [ ] Add conversion funnel visualization
- [ ] Implement real-time stats

### **Phase 5: Advanced Features** (Week 5)
- [ ] Implement discount system
- [ ] Add bulk actions for sessions
- [ ] Create activity log viewer
- [ ] Add admin user management
- [ ] Implement role-based permissions

### **Phase 6: Polish & Testing** (Week 6)
- [ ] UI/UX refinements
- [ ] Mobile responsiveness
- [ ] Error handling & validation
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation

---

## 📝 Implementation Checklist

### Database:
- [ ] Create `admin_users` table
- [ ] Create `session_discounts` table
- [ ] Create `admin_activity_log` table
- [ ] Update `sessions` table schema
- [ ] Update `enrollments` table schema
- [ ] Create database indexes for performance
- [ ] Set up RLS policies for admin tables

### Backend:
- [ ] Admin authentication middleware
- [ ] Session management API routes
- [ ] Enrollment management API routes
- [ ] Analytics API routes
- [ ] Discount management API routes
- [ ] CSV export functionality
- [ ] Email resend functionality
- [ ] Refund integration with Razorpay

### Frontend:
- [ ] Admin login page
- [ ] Admin layout with sidebar
- [ ] Dashboard overview
- [ ] Sessions list & management
- [ ] Enrollments list & management
- [ ] Analytics dashboard
- [ ] Forms with validation
- [ ] Data tables with sorting/filtering
- [ ] Charts and visualizations

### Security:
- [ ] Password hashing
- [ ] JWT authentication
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Activity logging
- [ ] Input validation

### Testing:
- [ ] Unit tests for API routes
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Security testing
- [ ] Performance testing

---

## 🛠️ Development Tools

### Required Packages:
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "bcryptjs": "^2.4.3",
    "date-fns": "^3.0.0",
    "jsonwebtoken": "^9.0.2",
    "papaparse": "^5.4.1",
    "react-hook-form": "^7.49.3",
    "recharts": "^2.10.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/papaparse": "^5.3.14"
  }
}
```

### shadcn/ui Components to Add:
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add dropdown-menu
```

---

## 🎯 Success Metrics

### For Admin Dashboard:
- [ ] Can create/edit/delete sessions in < 30 seconds
- [ ] Can view all enrollments with filters
- [ ] Can export enrollment data to CSV
- [ ] Can issue refunds directly from dashboard
- [ ] Can see real-time analytics
- [ ] Dashboard loads in < 2 seconds
- [ ] Mobile responsive
- [ ] Zero security vulnerabilities

---

## 📚 Next Steps

1. **Review this plan** and provide feedback
2. **Prioritize features** (which to build first)
3. **Set timeline** (how many weeks/sprints)
4. **Start with Phase 1** (Foundation)
5. **Iterate and improve** based on usage

---

## 💡 Future Enhancements

- **Email Templates Editor:** Visual editor for email templates
- **Automated Reminders:** Schedule reminder emails
- **Waitlist Management:** For full sessions
- **Certificate Generation:** Auto-generate certificates
- **Zoom Integration:** Auto-create meetings
- **Slack/Discord Notifications:** Real-time alerts
- **Multi-language Support:** i18n for dashboard
- **Dark Mode:** Theme toggle
- **Advanced Analytics:** Cohort analysis, retention
- **A/B Testing:** Test different pricing/messaging

---

**Ready to build? Let's start with Phase 1! 🚀**
