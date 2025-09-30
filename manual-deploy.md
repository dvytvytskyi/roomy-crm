# Manual Backend Deployment Guide

Since SSH access requires authentication, here's a manual deployment guide:

## 🎯 Option 1: Direct File Upload (if you have server access)

### Step 1: Upload Files
Upload these files to the server at `/var/www/roomy-backend/src/`:

1. **Controllers:**
   - `backend-modifications/authController.ts` → `src/controllers/authController.ts`
   - `backend-modifications/userController.ts` → `src/controllers/userController.ts`

2. **Routes:**
   - `backend-modifications/authRoutes.ts` → `src/routes/authRoutes.ts`
   - `backend-modifications/userRoutes.ts` → `src/routes/userRoutes.ts`

3. **Validation:**
   - `backend-modifications/validationSchemas.ts` → `src/validation/validationSchemas.ts`

4. **Seed Script:**
   - `backend-modifications/seed-admin.ts` → `seed-admin.ts`

### Step 2: Run Commands on Server
```bash
# Navigate to backend directory
cd /var/www/roomy-backend

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Create admin user
npx ts-node seed-admin.ts

# Restart backend
pm2 restart roomy-backend

# Check status
pm2 status roomy-backend
pm2 logs roomy-backend
```

## 🎯 Option 2: API-Based Deployment

### Create Admin User via API
```bash
# Register admin user with ADMIN role
curl -X POST http://5.223.55.121:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@roomy.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

### Test Admin Login
```bash
curl -X POST http://5.223.55.121:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123"}'
```

## 🎯 Option 3: Database Direct Modification

If you have database access, you can directly update the user role:

```sql
-- Update existing user to ADMIN role
UPDATE users 
SET role = 'ADMIN', 
    "updatedAt" = NOW()
WHERE email = 'admin@roomy.com';

-- Or create new admin user
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
    '$2b$12$0BN8ZWXCgy0fXDcHswkTq.R/iTqZTubKBFb.U08KEa.dnXbCyEXS6',
    'Admin',
    'User',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
);
```

## 🧪 Testing After Deployment

### Test 1: Admin Login
```bash
curl -X POST http://5.223.55.121:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123"}'
```

### Test 2: User Update (should work with ADMIN)
```bash
# Get token from login response
TOKEN="your_access_token_here"

curl -X PUT http://5.223.55.121:3001/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "phone": "+44 123 456 789"}'
```

### Test 3: Frontend Owner Update
1. Login to frontend with admin@roomy.com / admin123
2. Go to Properties → Property Details
3. Click "Change" in Owner section
4. Update owner data and save
5. Should work without "Access denied" error

## 🎯 Expected Results

After successful deployment:
- ✅ admin@roomy.com will have ADMIN role
- ✅ Owner update in frontend will work
- ✅ User management will be fully functional
- ✅ Role-based permissions will be enforced

## 🚨 Troubleshooting

### If deployment fails:
1. Check PM2 logs: `pm2 logs roomy-backend`
2. Verify file permissions
3. Check TypeScript compilation errors
4. Verify database connection
5. Check environment variables

### If admin user creation fails:
1. Check if user already exists
2. Verify password hashing
3. Check database constraints
4. Review error logs

### If owner update still fails:
1. Verify user has ADMIN role
2. Check token validity
3. Verify API endpoint permissions
4. Review frontend API calls
