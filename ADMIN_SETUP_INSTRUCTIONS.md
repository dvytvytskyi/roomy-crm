# Admin Setup Instructions for System Administrator

## 🎯 Current Situation

The backend system is currently deployed but has the following limitations:
- All users are created with `GUEST` role by default
- Owner data update requires `ADMIN` role
- No direct way to change user roles through API

## 🔧 Required Actions

### Option 1: Database Direct Modification (Recommended)

Connect to the PostgreSQL database and run the following SQL:

```sql
-- Update existing admin user to ADMIN role
UPDATE users 
SET role = 'ADMIN', 
    "updatedAt" = NOW()
WHERE email = 'admin@roomy.com';

-- Verify the change
SELECT id, email, "firstName", "lastName", role, "isActive" 
FROM users 
WHERE email = 'admin@roomy.com';
```

### Option 2: Create New Admin User

```sql
-- Create new admin user with ADMIN role
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    "isActive",
    "isVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin_user_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'admin@roomy.com',
    '$2b$12$0BN8ZWXCgy0fXDcHswkTq.R/iTqZTubKBFb.U08KEa.dnXbCyEXS6', -- password: admin123
    'Admin',
    'User',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
);
```

### Option 3: Deploy Modified Backend Files

If you have server access, deploy the modified backend files from the `backend-modifications/` directory:

1. **Upload modified files:**
   - `authController.ts` → `/var/www/roomy-backend/src/controllers/`
   - `userController.ts` → `/var/www/roomy-backend/src/controllers/`
   - `authRoutes.ts` → `/var/www/roomy-backend/src/routes/`
   - `userRoutes.ts` → `/var/www/roomy-backend/src/routes/`
   - `validationSchemas.ts` → `/var/www/roomy-backend/src/validation/`
   - `seed-admin.ts` → `/var/www/roomy-backend/`

2. **Run deployment commands:**
   ```bash
   cd /var/www/roomy-backend
   npm install
   npm run build
   npx ts-node seed-admin.ts
   pm2 restart roomy-backend
   ```

## 🧪 Testing After Setup

### Test 1: Admin Login
```bash
curl -X POST http://5.223.55.121:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123"}'
```

Expected response should show `"role": "ADMIN"`

### Test 2: Owner Update
1. Login to frontend with `admin@roomy.com` / `admin123`
2. Go to Properties → Property Details
3. Click "Change" in Owner section
4. Update owner data and save
5. Should work without "Access denied" error

## 🎯 Expected Results

After successful setup:
- ✅ `admin@roomy.com` will have `ADMIN` role
- ✅ Owner update in frontend will work
- ✅ User management will be fully functional
- ✅ Role-based permissions will be enforced

## 📞 Support

If you need assistance:
1. Check PM2 logs: `pm2 logs roomy-backend`
2. Verify database connection
3. Check environment variables
4. Review error logs in console

## 🔄 Current Workaround

Until admin role is set up, the system will show:
> "Access denied. Owner data update requires ADMIN role. Current user has GUEST role. Please contact system administrator to upgrade your account."

This is expected behavior and indicates the system is working correctly but needs admin privileges to be configured.
