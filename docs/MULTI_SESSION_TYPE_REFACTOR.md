# 🎯 Multi-Session Type Refactor - Implementation Guide

**Date:** November 4, 2025  
**Objective:** Support multiple session types (Spark 101, Framework 101, Summit 101)

---

## 📋 **Overview**

NXTAI101 now supports three distinct session types:

1. **⚡ Spark 101** - Introduction to AI & ML (Beginner)
2. **🔧 Framework 101** - Deep dive into AI Frameworks (Intermediate)
3. **🏔️ Summit 101** - Advanced AI Applications (Advanced)

---

## 🗄️ **Database Changes**

### **New Columns Added:**

```sql
-- Session type enum
session_type session_type_enum DEFAULT 'spark101'

-- Additional metadata
description TEXT
level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced'))
tags TEXT[]
```

### **Migration File:**
`migration-add-session-type.sql`

**Run this migration:**
```bash
# In Supabase SQL Editor
-- Copy and paste the contents of migration-add-session-type.sql
```

---

## 📦 **Type Definitions**

### **Updated Types** (`src/types/database.ts`):

```typescript
export type SessionType = 'spark101' | 'framework101' | 'summit101';
export type SessionLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Session {
  // ... existing fields
  session_type: SessionType;
  level: SessionLevel;
  description: string | null;
  tags: string[] | null;
  is_free: boolean;
}

export const SESSION_TYPE_CONFIG = {
  spark101: {
    name: 'Spark 101',
    description: 'Introduction to AI & ML',
    color: 'purple',
    icon: '⚡',
    level: 'beginner',
  },
  framework101: {
    name: 'Framework 101',
    description: 'Deep dive into AI Frameworks',
    color: 'blue',
    icon: '🔧',
    level: 'intermediate',
  },
  summit101: {
    name: 'Summit 101',
    description: 'Advanced AI Applications',
    color: 'emerald',
    icon: '🏔️',
    level: 'advanced',
  },
};
```

---

## 🎨 **UI Components**

### **Session Type Colors:**

| Type | Color Scheme | Border | Icon |
|------|--------------|--------|------|
| Spark 101 | Purple → Indigo | Purple | ⚡ |
| Framework 101 | Blue → Cyan | Blue | 🔧 |
| Summit 101 | Emerald → Teal | Emerald | 🏔️ |

### **Session Card Design:**

```tsx
<div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl p-6">
  {/* Icon + Title */}
  <div className="flex items-center gap-3">
    <div className="text-3xl">⚡</div>
    <div>
      <h3>Session Title</h3>
      <p>Spark 101</p>
    </div>
  </div>
  
  {/* Details Grid */}
  {/* Enrollment Progress Bar */}
  {/* Action Buttons */}
</div>
```

---

## 📄 **Pages Refactored**

### **1. Sessions Page** (`/admin/sessions`)

**New Features:**
- ✅ Filter by session type (Spark, Framework, Summit)
- ✅ Filter by status (upcoming, ongoing, completed, cancelled)
- ✅ Search by title
- ✅ Stats cards showing count per type
- ✅ Color-coded session cards
- ✅ Progress bars for enrollment
- ✅ Responsive grid layout

**Components:**
- Stats cards (total, per type)
- Filter bar (search, status, type)
- Session cards with gradient backgrounds
- Empty state

### **2. Session Create Form** (`/admin/sessions/new`)

**New Fields:**
- ✅ Session Type selector (Spark/Framework/Summit)
- ✅ Level selector (Beginner/Intermediate/Advanced)
- ✅ Description textarea
- ✅ Tags input (comma-separated)
- ✅ Auto-fill defaults based on session type

**Smart Defaults:**
```typescript
// When user selects "Framework 101"
{
  level: 'intermediate',
  duration_minutes: 120,
  price: 1499,
  max_capacity: 75,
}
```

### **3. Session Edit Form** (`/admin/sessions/[id]/edit`)

**Updates:**
- ✅ Can change session type
- ✅ Can update description
- ✅ Can modify tags
- ✅ Warning if changing type with existing enrollments

### **4. Enrollments Page** (`/admin/enrollments`)

**New Features:**
- ✅ Filter by session type
- ✅ Group enrollments by session type
- ✅ Show session type badge
- ✅ Color-coded by session type
- ✅ Export filtered by type

---

## 🔧 **API Updates**

### **Sessions API** (`/api/admin/sessions`)

**GET - List Sessions:**
```typescript
// Query params
?session_type=spark101
?status=upcoming
?level=beginner

// Response
{
  sessions: Session[],
  stats: {
    total: number,
    by_type: {
      spark101: number,
      framework101: number,
      summit101: number,
    }
  }
}
```

**POST - Create Session:**
```typescript
{
  // ... existing fields
  session_type: 'spark101' | 'framework101' | 'summit101',
  level: 'beginner' | 'intermediate' | 'advanced',
  description: string,
  tags: string[],
}
```

### **Enrollments API** (`/api/admin/enrollments`)

**GET - List Enrollments:**
```typescript
// Query params
?session_type=framework101

// Response includes session type in joined data
{
  enrollments: EnrollmentWithSession[],
  stats: {
    by_type: {
      spark101: { count: number, revenue: number },
      framework101: { count: number, revenue: number },
      summit101: { count: number, revenue: number },
    }
  }
}
```

---

## 📊 **Dashboard Updates**

### **New Metrics:**

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Spark 101 Card */}
  <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
    <h3>⚡ Spark 101</h3>
    <p className="text-3xl">{stats.spark101.enrollments}</p>
    <p className="text-sm">₹{stats.spark101.revenue}</p>
  </div>
  
  {/* Framework 101 Card */}
  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
    <h3>🔧 Framework 101</h3>
    <p className="text-3xl">{stats.framework101.enrollments}</p>
    <p className="text-sm">₹{stats.framework101.revenue}</p>
  </div>
  
  {/* Summit 101 Card */}
  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
    <h3>🏔️ Summit 101</h3>
    <p className="text-3xl">{stats.summit101.enrollments}</p>
    <p className="text-sm">₹{stats.summit101.revenue}</p>
  </div>
</div>
```

---

## 🎯 **Implementation Steps**

### **Phase 1: Database** ✅
1. ✅ Create migration file
2. ⏭️ Run migration in Supabase
3. ⏭️ Verify columns added
4. ⏭️ Update existing sessions

### **Phase 2: Types & Config** ✅
1. ✅ Update TypeScript types
2. ✅ Add SESSION_TYPE_CONFIG
3. ✅ Export types

### **Phase 3: UI Components** 🚧
1. ✅ Create new sessions page design
2. ⏭️ Update session create form
3. ⏭️ Update session edit form
4. ⏭️ Update enrollments page
5. ⏭️ Update dashboard

### **Phase 4: API Routes** ⏭️
1. ⏭️ Update GET /api/admin/sessions (add filters)
2. ⏭️ Update POST /api/admin/sessions (add new fields)
3. ⏭️ Update PUT /api/admin/sessions/[id]
4. ⏭️ Update GET /api/admin/enrollments (add filters)
5. ⏭️ Update GET /api/admin/dashboard (add stats)

### **Phase 5: Testing** ⏭️
1. ⏭️ Test session creation for each type
2. ⏭️ Test filtering and search
3. ⏭️ Test enrollment flow
4. ⏭️ Test dashboard metrics
5. ⏭️ Test responsive design

---

## 🎨 **Design System**

### **Color Palette:**

```css
/* Spark 101 - Purple/Indigo */
--spark-from: rgb(168 85 247 / 0.2);
--spark-to: rgb(99 102 241 / 0.2);
--spark-border: rgb(168 85 247 / 0.3);
--spark-text: rgb(192 132 252);

/* Framework 101 - Blue/Cyan */
--framework-from: rgb(59 130 246 / 0.2);
--framework-to: rgb(6 182 212 / 0.2);
--framework-border: rgb(59 130 246 / 0.3);
--framework-text: rgb(96 165 250);

/* Summit 101 - Emerald/Teal */
--summit-from: rgb(16 185 129 / 0.2);
--summit-to: rgb(20 184 166 / 0.2);
--summit-border: rgb(16 185 129 / 0.3);
--summit-text: rgb(52 211 153);
```

### **Typography:**

```css
/* Session Type Names */
font-family: 'Instrument Serif', serif;
font-size: 1.125rem; /* 18px */
font-weight: 700;

/* Session Titles */
font-family: 'Instrument Serif', serif;
font-size: 1.5rem; /* 24px */
font-weight: 700;

/* Descriptions */
font-family: 'Inter', sans-serif;
font-size: 0.875rem; /* 14px */
color: rgb(156 163 175); /* gray-400 */
```

---

## 📝 **Example Usage**

### **Creating a Framework 101 Session:**

```typescript
const newSession = {
  title: "Deep Dive: TensorFlow & PyTorch",
  session_type: "framework101",
  level: "intermediate",
  description: "Learn to build neural networks with TensorFlow and PyTorch",
  tags: ["tensorflow", "pytorch", "deep-learning"],
  session_date: "2025-11-15T14:00:00Z",
  duration_minutes: 120,
  max_capacity: 75,
  price: 1499,
  zoom_link: "https://zoom.us/j/...",
};
```

### **Filtering Sessions:**

```typescript
// Get all Framework 101 sessions
const frameworkSessions = sessions.filter(
  s => s.session_type === 'framework101'
);

// Get upcoming intermediate sessions
const upcomingSessions = sessions.filter(
  s => s.level === 'intermediate' && 
       getComputedStatus(s) === 'upcoming'
);
```

---

## 🚀 **Benefits**

### **For Admins:**
- ✅ Better organization of different session types
- ✅ Easy filtering and searching
- ✅ Clear visual distinction
- ✅ Better analytics per session type

### **For Users:**
- ✅ Clear learning path (Beginner → Intermediate → Advanced)
- ✅ Easy to find relevant sessions
- ✅ Better understanding of content level

### **For Business:**
- ✅ Track performance per session type
- ✅ Optimize pricing per type
- ✅ Better marketing segmentation
- ✅ Clearer product offering

---

## 📈 **Future Enhancements**

1. **Prerequisites System**
   - Spark 101 required for Framework 101
   - Framework 101 required for Summit 101

2. **Learning Paths**
   - Visual progression chart
   - Completion tracking
   - Certificates per path

3. **Bundles**
   - Buy all 3 sessions at discount
   - Season passes
   - Corporate packages

4. **Advanced Filtering**
   - Filter by tags
   - Filter by instructor
   - Filter by date range
   - Filter by price range

5. **Analytics**
   - Conversion funnel per type
   - Retention rates
   - Popular progression paths

---

## ✅ **Checklist**

### **Database:**
- [ ] Run migration
- [ ] Verify columns
- [ ] Update existing data
- [ ] Test constraints

### **Backend:**
- [ ] Update API routes
- [ ] Add filtering logic
- [ ] Update validation
- [ ] Test endpoints

### **Frontend:**
- [ ] Update sessions page
- [ ] Update create form
- [ ] Update edit form
- [ ] Update enrollments page
- [ ] Update dashboard
- [ ] Test all flows

### **Testing:**
- [ ] Create sessions of each type
- [ ] Test filtering
- [ ] Test enrollment flow
- [ ] Test responsive design
- [ ] Test edge cases

---

**Status:** 🚧 In Progress - Database and types complete, UI refactor in progress

**Next Steps:**
1. Replace old sessions page with new design
2. Update create/edit forms
3. Update API routes
4. Update dashboard
5. Test end-to-end
