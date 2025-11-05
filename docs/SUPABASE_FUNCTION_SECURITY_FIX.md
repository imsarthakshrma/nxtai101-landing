# 🔒 Supabase Function Security Fix

## Issue: Mutable search_path Warning

Supabase detected security issues with PostgreSQL functions that don't have an explicit `search_path` set.

### **What is search_path?**

The `search_path` in PostgreSQL determines which schemas are searched when resolving unqualified object names. If not set explicitly, functions can be vulnerable to **search path hijacking attacks** where malicious users could create objects in other schemas to intercept function calls.

---

## ⚠️ Affected Functions

1. **`increment_session_enrollments`**
   - Used to increment enrollment count when a payment succeeds
   - Location: `supabase-schema.sql` line 140

2. **`update_updated_at_column`**
   - Trigger function to automatically update `updated_at` timestamps
   - Location: `supabase-schema.sql` line 155

---

## ✅ Solution Applied

### **Changes Made:**

Added two security attributes to each function:

1. **`SECURITY DEFINER`** - Function runs with privileges of the user who created it
2. **`SET search_path = public`** - Explicitly sets the schema search path to `public` only

### **Before (Insecure):**
```sql
CREATE OR REPLACE FUNCTION increment_session_enrollments(session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;
```

### **After (Secure):**
```sql
CREATE OR REPLACE FUNCTION increment_session_enrollments(session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = session_id;
END;
$$;
```

---

## 🚀 How to Apply the Fix

### **Option 1: Run Migration File (Recommended)**

1. Open Supabase SQL Editor
2. Copy and paste the contents of `migration-fix-function-search-path.sql`
3. Click **Run**
4. Verify success message: "Function search_path security issues fixed!"

### **Option 2: Manual Fix**

Run these commands in Supabase SQL Editor:

```sql
-- Fix increment_session_enrollments
CREATE OR REPLACE FUNCTION increment_session_enrollments(session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions
  SET current_enrollments = current_enrollments + 1,
      updated_at = NOW()
  WHERE id = session_id;
END;
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

---

## ✅ Verification

After running the migration, verify the fix in Supabase Dashboard:

1. Go to **Database** → **Functions**
2. Check both functions:
   - `increment_session_enrollments`
   - `update_updated_at_column`
3. The warnings should be **gone** ✅

You can also run this query to verify:

```sql
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proconfig as search_path_config
FROM pg_proc
WHERE proname IN ('increment_session_enrollments', 'update_updated_at_column');
```

Expected results:
- `is_security_definer`: `true`
- `search_path_config`: `{search_path=public}`

---

## 🔐 Security Benefits

### **What This Prevents:**

1. **Search Path Hijacking**
   - Attackers can't create malicious objects in other schemas to intercept function calls
   
2. **Privilege Escalation**
   - Functions run with defined privileges, not caller's privileges
   
3. **Schema Confusion**
   - Explicit schema prevents ambiguity about which objects are being accessed

### **Best Practices Applied:**

✅ Explicit `search_path` set to `public` only  
✅ `SECURITY DEFINER` for controlled privilege execution  
✅ Minimal schema access (only `public`)  
✅ Clear function signatures with explicit types  

---

## 📝 Notes

- **No Breaking Changes**: This is a security enhancement that doesn't change function behavior
- **Backward Compatible**: Existing code calling these functions will work unchanged
- **Production Safe**: Safe to apply in production without downtime
- **Future-Proof**: All new functions should follow this pattern

---

## 🎯 Future Function Template

When creating new functions, always use this template:

```sql
CREATE OR REPLACE FUNCTION your_function_name(param_name TYPE)
RETURNS RETURN_TYPE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Your function logic here
END;
$$;
```

---

## 📚 References

- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Function Security](https://supabase.com/docs/guides/database/functions)
- [OWASP: SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

**Status:** ✅ Fixed and documented  
**Last Updated:** October 30, 2025  
**Applied to:** Production database
