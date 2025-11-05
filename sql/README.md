# 🗄️ SQL Scripts

This folder contains all database-related SQL scripts organized by purpose.

---

## 📂 Folder Structure

```
sql/
├── README.md              # This file
├── supabase-schema.sql    # Main database schema
├── migrations/            # Database migration scripts
├── seeds/                 # Database seed data scripts
└── verification/          # Scripts to verify database state
```

---

## 📋 Main Schema

### **`supabase-schema.sql`**
Complete database schema including:
- Tables (sessions, enrollments, admins, etc.)
- Indexes
- Constraints
- RLS policies
- Functions
- Triggers

**Usage:**
```bash
# Apply full schema (fresh database)
psql -h your-db-host -U postgres -d your-db-name -f sql/supabase-schema.sql
```

---

## 🔄 Migrations (`migrations/`)

Migration scripts to update existing databases. **Run in order:**

### **1. `migration-add-admin-tables.sql`**
- Creates admin users table
- Creates admin activity log table
- Sets up RLS policies
- **Rollback:** `rollback-admin-tables.sql`

### **2. `migration-add-password-security.sql`**
- Adds password hashing
- Adds failed login tracking
- Adds account lockout

### **3. `migration-add-session-type.sql`**
- Adds session_type column (spark101, framework101, summit101)
- Adds level column (beginner, intermediate, advanced)
- Adds description and tags

### **4. `migration-add-price-and-fix-unique-index.sql`**
- Adds is_free column
- Fixes unique enrollment constraint
- Allows multiple pending/failed enrollments

### **5. `migration-session-improvements.sql`**
- Additional session enhancements
- Performance optimizations

### **6. `migration-fix-function-search-path.sql`**
- Fixes database function security
- Sets proper search paths

**Usage:**
```bash
# Run a migration
psql -h your-db-host -U postgres -d your-db-name -f sql/migrations/migration-name.sql

# Rollback admin tables if needed
psql -h your-db-host -U postgres -d your-db-name -f sql/migrations/rollback-admin-tables.sql
```

---

## 🌱 Seeds (`seeds/`)

Scripts to populate database with initial data.

### **`seed-admin-user.sql`**
Creates the first admin user:
- Email: admin@nxtai101.com
- Password: Admin@123 (change immediately!)
- Role: super_admin

**Usage:**
```bash
psql -h your-db-host -U postgres -d your-db-name -f sql/seeds/seed-admin-user.sql
```

**⚠️ Security Note:** Change the default password immediately after first login!

---

## ✅ Verification (`verification/`)

Scripts to verify database state and configuration.

### **`verify-admin-tables.sql`**
Checks:
- Admin tables exist
- Columns are correct
- Indexes are in place
- RLS policies are active

### **`verify-admin-roles.sql`**
Checks:
- Admin user exists
- Roles are correct
- Permissions are set

**Usage:**
```bash
# Verify admin tables
psql -h your-db-host -U postgres -d your-db-name -f sql/verification/verify-admin-tables.sql

# Verify admin roles
psql -h your-db-host -U postgres -d your-db-name -f sql/verification/verify-admin-roles.sql
```

---

## 🚀 Quick Start

### **For Fresh Database:**
```bash
# 1. Apply main schema
psql -h your-db-host -U postgres -d your-db-name -f sql/supabase-schema.sql

# 2. Seed admin user
psql -h your-db-host -U postgres -d your-db-name -f sql/seeds/seed-admin-user.sql

# 3. Verify setup
psql -h your-db-host -U postgres -d your-db-name -f sql/verification/verify-admin-tables.sql
```

### **For Existing Database:**
```bash
# 1. Run migrations in order
psql -h your-db-host -U postgres -d your-db-name -f sql/migrations/migration-add-admin-tables.sql
psql -h your-db-host -U postgres -d your-db-name -f sql/migrations/migration-add-password-security.sql
# ... continue with other migrations

# 2. Seed admin user if needed
psql -h your-db-host -U postgres -d your-db-name -f sql/seeds/seed-admin-user.sql

# 3. Verify
psql -h your-db-host -U postgres -d your-db-name -f sql/verification/verify-admin-tables.sql
```

---

## 🔐 Using Supabase Dashboard

You can also run these scripts via Supabase Dashboard:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy-paste the SQL script content
4. Click **Run**

---

## 📝 Migration Best Practices

### **Before Running:**
1. ✅ Backup your database
2. ✅ Test on staging first
3. ✅ Read the migration script
4. ✅ Check for breaking changes

### **After Running:**
1. ✅ Run verification scripts
2. ✅ Test affected features
3. ✅ Monitor for errors
4. ✅ Update documentation

### **If Something Goes Wrong:**
1. Check rollback scripts (if available)
2. Restore from backup
3. Review error messages
4. Contact support if needed

---

## 🗂️ Database Schema Overview

### **Core Tables:**
- `sessions` - Training sessions
- `enrollments` - User enrollments
- `admins` - Admin users
- `admin_activity_log` - Admin action audit trail

### **Key Features:**
- ✅ Row Level Security (RLS)
- ✅ Automatic timestamps
- ✅ Foreign key constraints
- ✅ Unique indexes
- ✅ Audit logging

---

## 📚 Related Documentation

- `/docs/ADMIN_TABLES_MIGRATION.md` - Detailed migration guide
- `/docs/QUICK_START_ADMIN_MIGRATION.md` - Quick migration steps
- `/docs/NXTAI101_SYSTEM_ARCHITECTURE.md` - System architecture

---

**Last Updated:** November 5, 2025
