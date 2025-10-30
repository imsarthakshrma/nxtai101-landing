# Admin Tables Migration Guide

This guide walks you through adding the admin authentication tables to your Supabase database.

## Overview

The admin system requires two tables:
1. **admin_users** - Stores admin user accounts with authentication credentials
2. **admin_activity_log** - Tracks all admin actions for audit purposes

## Migration Steps

### Step 1: Run the Migration

Open your Supabase SQL Editor and run the migration file:

```bash
# File: migration-add-admin-tables.sql
```

This will create:
- `admin_users` table with columns: id, email, password_hash, name, role, last_login, created_at, updated_at
- `admin_activity_log` table with columns: id, admin_id, action, entity_type, entity_id, ip_address, user_agent, metadata, created_at
- Indexes for optimal query performance
- RLS policies for security
- Triggers for automatic timestamp updates

### Step 2: Generate Password Hash

Run the password hash generator to create a secure password hash:

```bash
node hash-password.js
```

This will output a bcrypt hash for the password `Hello@101`. Copy this hash.

### Step 3: Seed Initial Admin User

1. Open `seed-admin-user.sql`
2. Replace `$2a$10$REPLACE_THIS_WITH_ACTUAL_HASH_FROM_HASH_PASSWORD_JS` with the hash from Step 2
3. Update the email if needed (default: `admin@nxtai101.com`)
4. Run the seed file in Supabase SQL Editor

### Step 4: Verify Migration

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('admin_users', 'admin_activity_log');

-- Check admin user was created
SELECT id, email, name, role, created_at 
FROM admin_users;

-- Verify indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('admin_users', 'admin_activity_log');
```

## Table Schemas

### admin_users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| email | TEXT | UNIQUE NOT NULL | Admin email (login) |
| password_hash | TEXT | NOT NULL | Bcrypt hashed password |
| name | TEXT | | Admin display name |
| role | TEXT | NOT NULL, CHECK | Role: admin, super_admin, or moderator |
| last_login | TIMESTAMPTZ | | Last successful login timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### admin_activity_log

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| admin_id | UUID | NOT NULL, FK | References admin_users(id) |
| action | TEXT | NOT NULL | Action performed (e.g., login, logout) |
| entity_type | TEXT | | Type of entity affected |
| entity_id | UUID | | ID of entity affected |
| ip_address | TEXT | | Request IP address |
| user_agent | TEXT | | Request user agent |
| metadata | JSONB | | Additional action metadata |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp |

## Security Features

- **Row Level Security (RLS)**: Enabled on both tables
- **Service Role Only**: Only service role can access these tables
- **Password Hashing**: Bcrypt with 10 rounds
- **Cascade Delete**: Activity logs deleted when admin user is deleted
- **Unique Email**: Prevents duplicate admin accounts

## Default Credentials

After seeding, you can login with:
- **Email**: `admin@nxtai101.com`
- **Password**: `Hello@101`

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Rollback

If you need to rollback the migration:

```sql
-- Drop tables (this will delete all data!)
DROP TABLE IF EXISTS admin_activity_log CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_admin_users_email;
DROP INDEX IF EXISTS idx_admin_activity_log_admin_id;
DROP INDEX IF EXISTS idx_admin_activity_log_created_at;
DROP INDEX IF EXISTS idx_admin_activity_log_action;
```

## Troubleshooting

### Error: relation "admin_users" does not exist
- Ensure you ran `migration-add-admin-tables.sql` first
- Check that the migration completed without errors

### Error: duplicate key value violates unique constraint
- An admin with that email already exists
- Use a different email or update the existing record

### Login fails with "Invalid credentials"
- Verify the password hash was copied correctly
- Ensure the email matches exactly (case-insensitive)
- Check that the admin user exists in the database

## Next Steps

After migration:
1. Test admin login at `/admin/login`
2. Change default password
3. Create additional admin users as needed
4. Review activity logs regularly for security
