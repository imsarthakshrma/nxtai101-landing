# Quick Start: Admin Tables Migration

## 🚀 5-Minute Setup

### Step 1: Run Migration (2 min)
Open Supabase SQL Editor and paste:
```bash
# File: migration-add-admin-tables.sql
```
Click **Run** ▶️

### Step 2: Generate Password Hash (1 min)
```bash
node hash-password.js
```
Copy the hash output.

### Step 3: Create Admin User (1 min)
1. Open `seed-admin-user.sql`
2. Replace `$2a$10$REPLACE_THIS_WITH_ACTUAL_HASH_FROM_HASH_PASSWORD_JS` with your hash
3. Run in Supabase SQL Editor

### Step 4: Verify (1 min)
Run in Supabase SQL Editor:
```bash
# File: verify-admin-tables.sql
```

### Step 5: Secure Setup

⚠️ **CRITICAL SECURITY WARNING:**

**DO NOT use default credentials!** Follow the secure setup process:

1. **Read:** `SECURE_ADMIN_SETUP.md` for complete security guide
2. **Generate:** Your own strong password (see guide)
3. **Hash:** Your password using `hash-my-password.js`
4. **Create:** Admin user with YOUR email and hashed password
5. **Test:** Login at `/admin/login` with YOUR credentials
6. **Delete:** All password generation scripts immediately

**Default credentials (admin@nxtai101.com / Hello@101) are NEVER acceptable in production!**

---

## ✅ Success Checklist
- [ ] Migration ran without errors
- [ ] Admin user created
- [ ] Login successful
- [ ] Activity logged
- [ ] Password changed

---

## 🆘 Troubleshooting

### "relation admin_users does not exist"
→ Run `migration-add-admin-tables.sql` first

### "Invalid credentials" on login
→ Verify password hash was copied correctly

### "duplicate key value"
→ Admin already exists, use different email or update existing

---

## 📚 Full Documentation
- `ADMIN_TABLES_MIGRATION.md` - Complete guide
- `ADMIN_TABLES_SUMMARY.md` - Technical details
- `verify-admin-tables.sql` - Diagnostic queries

---

**Total Time: ~5 minutes** ⏱️
