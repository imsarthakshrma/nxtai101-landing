# Admin Role Type Alignment Fix

## Issue
There was a mismatch between the database schema and TypeScript types for admin user roles:

- **Database Schema** (`admin_users` table): `'admin' | 'super_admin' | 'moderator'`
- **TypeScript Type** (`AdminUser` interface): `'super_admin' | 'admin' | 'viewer'`

This caused a schema/type mismatch where the TypeScript code could reference a 'viewer' role that doesn't exist in the database.

---

## Changes Made

### 1. Updated TypeScript Interface
**File:** `src/lib/admin-auth.ts`

```typescript
// BEFORE
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'viewer';
}

// AFTER
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'admin' | 'moderator';
}
```

### 2. Updated Role Hierarchy
**File:** `src/lib/admin-auth.ts`

```typescript
// BEFORE
const roleHierarchy = {
  super_admin: 3,
  admin: 2,
  viewer: 1,
};

// AFTER
const roleHierarchy = {
  super_admin: 3,
  admin: 2,
  moderator: 1,
};
```

### 3. Updated Documentation
**File:** `planning/ADMIN_DASHBOARD_PLAN.md`

- Updated database schema example to use 'moderator'
- Updated role descriptions to use 'moderator' instead of 'viewer'

---

## Role Definitions

### Super Admin (Level 3)
- Full access to all features
- Can manage other admins
- Can modify system settings
- Can view all logs and analytics

### Admin (Level 2)
- Can manage sessions (create, edit, delete)
- Can manage enrollments
- Can view analytics
- Cannot manage other admins

### Moderator (Level 1)
- Read-only access
- Can view sessions and enrollments
- Can view analytics
- Cannot modify any data

---

## Database Schema

The database constraint is correctly defined as:

```sql
role TEXT NOT NULL DEFAULT 'admin' 
CHECK (role IN ('admin', 'super_admin', 'moderator'))
```

---

## Testing Checklist

- [x] TypeScript types updated
- [x] Role hierarchy updated
- [x] Documentation updated
- [ ] Test login with each role type
- [ ] Verify role-based permissions work correctly
- [ ] Test `hasRole()` function with all role combinations

---

## Migration Notes

**No database migration required** - the database schema was already correct. This was purely a TypeScript type alignment fix.

If you have any existing code that references 'viewer', search for it and replace with 'moderator':

```bash
# Search for any remaining references
grep -r "viewer" src/
```

---

## Future Enhancements

Consider adding more granular permissions:
- Session creator vs. session viewer
- Enrollment manager vs. enrollment viewer
- Analytics viewer
- Settings manager

This could be implemented with a separate `permissions` JSONB column or a `role_permissions` table.
