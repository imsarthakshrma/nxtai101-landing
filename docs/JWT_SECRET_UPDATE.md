# JWT_SECRET Security Update

## Overview
Removed hardcoded JWT_SECRET fallback and implemented fail-fast validation to ensure the application won't start without a proper JWT secret configured.

## Changes Made

### 1. **src/lib/admin-auth.ts** ✅
- **Removed**: Hardcoded fallback `"your-secret-key-change-this"`
- **Added**: Module-level validation that throws error if `JWT_SECRET` is missing or empty
- **Exported**: `JWT_SECRET` constant for use in other modules
- **Behavior**: Application will fail immediately at startup if `JWT_SECRET` is not set

**Before:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
```

**After:**
```typescript
// Validate JWT_SECRET at module initialization - fail fast if missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  throw new Error('JWT_SECRET must be set in environment variables');
}

export const JWT_SECRET = process.env.JWT_SECRET;
```

### 2. **env.example** ✅
Added JWT_SECRET with documentation:
```env
# JWT Secret (REQUIRED - used for admin authentication tokens)
# Generate a secure random string: openssl rand -base64 32
JWT_SECRET=your_jwt_secret_here_change_this
```

### 3. **SETUP_GUIDE.md** ✅
Added JWT_SECRET to environment variables section with generation instructions.

### 4. **DEPLOYMENT_CHECKLIST.md** ✅
Added JWT_SECRET to production environment variables checklist.

## Security Benefits

1. **No Default Fallback**: Eliminates risk of deploying with insecure default secret
2. **Fail Fast**: Application won't start if JWT_SECRET is missing, preventing runtime errors
3. **Clear Error Message**: Developers immediately know what's missing
4. **Exported Constant**: Other modules can import validated JWT_SECRET if needed

## Setup Instructions

### For Development

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
JWT_SECRET=your_generated_secret_here
```

### For Production

1. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to your hosting platform's environment variables:
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Site settings → Environment variables
   - **Railway**: Variables tab

3. Redeploy the application

## Error Handling

### If JWT_SECRET is missing:
```
Error: JWT_SECRET must be set in environment variables
```

**Solution**: Add `JWT_SECRET` to your environment variables and restart the application.

### If JWT_SECRET is empty string:
```
Error: JWT_SECRET must be set in environment variables
```

**Solution**: Provide a non-empty value for `JWT_SECRET`.

## Migration Checklist

- [x] Remove hardcoded fallback from admin-auth.ts
- [x] Add validation at module initialization
- [x] Export JWT_SECRET constant
- [x] Update env.example
- [x] Update SETUP_GUIDE.md
- [x] Update DEPLOYMENT_CHECKLIST.md
- [ ] Generate JWT_SECRET for development
- [ ] Add JWT_SECRET to .env.local
- [ ] Test application starts successfully
- [ ] Add JWT_SECRET to production environment
- [ ] Deploy and verify

## Testing

1. **Test fail-fast behavior**:
   ```bash
   # Remove JWT_SECRET from .env.local temporarily
   npm run dev
   # Should see error: "JWT_SECRET must be set in environment variables"
   ```

2. **Test with valid secret**:
   ```bash
   # Add JWT_SECRET back to .env.local
   npm run dev
   # Application should start normally
   ```

3. **Test admin authentication**:
   - Login at `/admin/login`
   - Verify JWT token is generated
   - Verify token validation works

## Related Files

- `src/lib/admin-auth.ts` - JWT validation and token generation
- `src/app/api/admin/login/route.ts` - Uses JWT for admin login
- `src/app/api/admin/logout/route.ts` - Clears JWT token
- `src/app/api/admin/me/route.ts` - Validates JWT token

## Security Best Practices

1. **Never commit JWT_SECRET** to version control
2. **Use different secrets** for development and production
3. **Rotate secrets periodically** (invalidates all existing tokens)
4. **Use strong random values** (minimum 32 characters, base64 encoded)
5. **Store securely** in environment variables, never in code

## Troubleshooting

### Application won't start
→ Ensure `JWT_SECRET` is set in `.env.local` or environment variables

### Admin login fails with "Invalid token"
→ JWT_SECRET may have changed, invalidating existing tokens. Users need to login again.

### Different secret in production vs development
→ This is expected and recommended. Tokens are not portable between environments.

---

**Status**: ✅ Complete - Application now requires JWT_SECRET to start
