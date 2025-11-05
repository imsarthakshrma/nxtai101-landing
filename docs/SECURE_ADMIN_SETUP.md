# 🔐 Secure Admin Setup Guide

## ⚠️ CRITICAL SECURITY NOTICE

**DO NOT use default credentials in production!** This guide will help you set up admin access securely.

---

## 🚀 Quick Start (Secure Method)

### Step 1: Generate a Strong Password

Create a strong, unique password for your admin account:

```bash
# Generate a random password (recommended)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*...)

### Step 2: Hash Your Password

Create a file `hash-my-password.js`:

```javascript
const bcrypt = require('bcryptjs');

async function hashPassword() {
  // REPLACE THIS with your actual password
  const password = 'YOUR_SECURE_PASSWORD_HERE';
  
  const hash = await bcrypt.hash(password, 10);
  console.log('\n=== SAVE THIS HASH ===');
  console.log(hash);
  console.log('=====================\n');
}

hashPassword();
```

Run it:
```bash
node hash-my-password.js
```

**⚠️ IMPORTANT:** Delete this file immediately after getting the hash!

```bash
rm hash-my-password.js
```

### Step 3: Run Database Migration

Run the security migration in Supabase SQL Editor:

```sql
-- File: migration-add-password-security.sql
```

### Step 4: Create Your Admin User

Create a file `seed-my-admin.sql` with YOUR details:

```sql
-- Replace with YOUR email and the hash from Step 2
INSERT INTO admin_users (email, password_hash, name, role, must_change_password)
VALUES (
  'your-email@yourdomain.com',  -- YOUR EMAIL
  'PASTE_YOUR_HASH_HERE',        -- HASH FROM STEP 2
  'Your Name',                    -- YOUR NAME
  'super_admin',
  FALSE  -- Set to TRUE if you want to force password change on first login
)
ON CONFLICT (email) DO NOTHING;
```

Run in Supabase SQL Editor, then **delete the file**:

```bash
rm seed-my-admin.sql
```

### Step 5: Verify Setup

```sql
-- Check your admin user was created
SELECT id, email, name, role, must_change_password, created_at
FROM admin_users
WHERE email = 'your-email@yourdomain.com';
```

### Step 6: Test Login

1. Go to `https://yourdomain.com/admin/login`
2. Enter YOUR email and password
3. If `must_change_password` was TRUE, you'll be prompted to change it

---

## 🛡️ Security Features Implemented

### 1. **Rate Limiting**
- **IP-based:** 10 attempts per 15 minutes
- **Email-based:** 5 attempts per 15 minutes
- Returns `429 Too Many Requests` with `Retry-After` header

### 2. **Account Lockout**
- Account locks after 5 failed login attempts
- Locked for 30 minutes
- Returns `423 Locked` status

### 3. **Password Requirements**
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Cannot reuse current password

### 4. **Forced Password Change**
- Set `must_change_password = TRUE` for new users
- Users redirected to `/admin/change-password` before accessing dashboard
- Cannot bypass this requirement

### 5. **Audit Logging**
- All login attempts logged (success and failure)
- Password changes logged
- IP addresses tracked
- Failed attempt counts stored

### 6. **Timing Attack Prevention**
- Constant-time password verification
- Generic error messages
- No information leakage about account existence

### 7. **JWT Validation**
- Runtime payload validation
- No unsafe type assertions
- Role validation against allowed values

---

## 🔧 Production Deployment Checklist

### Before Going Live:

- [ ] Generate unique, strong admin password
- [ ] Use your own email address (not example emails)
- [ ] Set `must_change_password = FALSE` only after setting a secure password
- [ ] Delete all password generation scripts
- [ ] Verify `JWT_SECRET` is set in production environment
- [ ] Test rate limiting is working
- [ ] Test account lockout is working
- [ ] Verify audit logs are being created
- [ ] Set up monitoring for failed login attempts
- [ ] Configure alerts for suspicious activity

### Environment Variables Required:

```env
# REQUIRED - Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🚨 Security Incident Response

### If You Suspect Unauthorized Access:

1. **Immediately lock all admin accounts:**
   ```sql
   UPDATE admin_users
   SET locked_until = NOW() + INTERVAL '24 hours'
   WHERE role IN ('admin', 'super_admin');
   ```

2. **Review audit logs:**
   ```sql
   SELECT *
   FROM admin_activity_log
   WHERE action IN ('login_success', 'failed_login', 'password_changed')
   ORDER BY created_at DESC
   LIMIT 100;
   ```

3. **Check for suspicious IPs:**
   ```sql
   SELECT 
     ip_address,
     COUNT(*) as attempt_count,
     MAX(created_at) as last_attempt
   FROM admin_activity_log
   WHERE action = 'failed_login'
   AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY ip_address
   ORDER BY attempt_count DESC;
   ```

4. **Force password reset for all admins:**
   ```sql
   UPDATE admin_users
   SET must_change_password = TRUE;
   ```

5. **Rotate JWT_SECRET** (invalidates all sessions)

---

## 📊 Monitoring Queries

### Failed Login Attempts (Last 24h):
```sql
SELECT 
  admin_id,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt,
  array_agg(DISTINCT ip_address) as ips
FROM admin_activity_log
WHERE action = 'failed_login'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY admin_id
ORDER BY failed_attempts DESC;
```

### Locked Accounts:
```sql
SELECT 
  email,
  name,
  locked_until,
  failed_login_attempts
FROM admin_users
WHERE locked_until > NOW()
ORDER BY locked_until DESC;
```

### Recent Admin Activity:
```sql
SELECT 
  au.email,
  aal.action,
  aal.ip_address,
  aal.created_at
FROM admin_activity_log aal
JOIN admin_users au ON aal.admin_id = au.id
ORDER BY aal.created_at DESC
LIMIT 50;
```

---

## 🔄 Password Rotation Policy

**Recommended:** Rotate admin passwords every 90 days

1. Set `must_change_password = TRUE` for all admins
2. Notify admins via email
3. They'll be prompted on next login
4. Track compliance in audit logs

---

## ❌ What NOT to Do

- ❌ Never commit passwords or hashes to git
- ❌ Never share admin credentials via email/Slack
- ❌ Never use simple passwords like "admin123"
- ❌ Never disable rate limiting in production
- ❌ Never use the same password across environments
- ❌ Never skip the password change requirement
- ❌ Never hardcode credentials in documentation

---

## ✅ Best Practices

- ✅ Use a password manager for admin credentials
- ✅ Enable 2FA (when implemented)
- ✅ Regularly review audit logs
- ✅ Use different passwords for dev/staging/prod
- ✅ Implement IP whitelisting if possible
- ✅ Monitor for brute force attempts
- ✅ Keep admin access to minimum necessary people
- ✅ Revoke access immediately when team members leave

---

## 🆘 Support

If you encounter issues:

1. Check audit logs for errors
2. Verify environment variables are set
3. Test with a fresh admin account
4. Review rate limit settings

**Never share your actual credentials when seeking help!**
