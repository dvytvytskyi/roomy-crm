# Backend Modifications - Deployment Instructions

## 🎯 Overview
This directory contains modified backend files to support ADMIN role creation and improved user permissions.

## 📁 Modified Files

### 1. **authController.ts**
- ✅ **Modified registration** to accept role parameter
- ✅ **Enhanced login** with proper role handling
- ✅ **Added profile endpoint** for authenticated users
- ✅ **Added refresh token** functionality

### 2. **userController.ts**
- ✅ **Modified updateUser** to allow users to update their own data
- ✅ **Added role-based permissions** (ADMIN/MANAGER can update anyone)
- ✅ **Enhanced security** with proper permission checks
- ✅ **Added user statistics** endpoint

### 3. **seed-admin.ts**
- ✅ **Creates ADMIN user** with email: admin@roomy.com
- ✅ **Creates test users** for different roles
- ✅ **Handles existing users** gracefully

### 4. **authRoutes.ts & userRoutes.ts**
- ✅ **Updated routes** with proper validation
- ✅ **Added authentication middleware**
- ✅ **Enhanced error handling**

### 5. **validationSchemas.ts**
- ✅ **Added role validation** for registration
- ✅ **Enhanced user update validation**
- ✅ **Added role change validation**

## 🚀 Deployment Steps

### Step 1: Backup Current Backend
```bash
# SSH to server
ssh root@5.223.55.121

# Backup current backend
cd /var/www/roomy-backend
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)
```

### Step 2: Deploy Modified Files
```bash
# Copy modified files to server
scp backend-modifications/authController.ts root@5.223.55.121:/var/www/roomy-backend/src/controllers/
scp backend-modifications/userController.ts root@5.223.55.121:/var/www/roomy-backend/src/controllers/
scp backend-modifications/authRoutes.ts root@5.223.55.121:/var/www/roomy-backend/src/routes/
scp backend-modifications/userRoutes.ts root@5.223.55.121:/var/www/roomy-backend/src/routes/
scp backend-modifications/validationSchemas.ts root@5.223.55.121:/var/www/roomy-backend/src/validation/
scp backend-modifications/seed-admin.ts root@5.223.55.121:/var/www/roomy-backend/
```

### Step 3: Install Dependencies (if needed)
```bash
# SSH to server
ssh root@5.223.55.121
cd /var/www/roomy-backend

# Install any new dependencies
npm install
```

### Step 4: Create Admin User
```bash
# Run the seed script
cd /var/www/roomy-backend
npx ts-node seed-admin.ts
```

### Step 5: Restart Backend
```bash
# Restart PM2 process
pm2 restart roomy-backend
pm2 logs roomy-backend
```

## 🧪 Testing

### Test 1: Create ADMIN User
```bash
curl -X POST http://5.223.55.121:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123", "firstName": "Admin", "lastName": "User", "role": "ADMIN"}'
```

### Test 2: Login as ADMIN
```bash
curl -X POST http://5.223.55.121:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@roomy.com", "password": "admin123"}'
```

### Test 3: Update User (should work now)
```bash
# Get token from login response
TOKEN="your_access_token_here"

curl -X PUT http://5.223.55.121:3001/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "phone": "+44 123 456 789"}'
```

## 🔧 Key Changes

### 1. **Role Support in Registration**
- Users can now be created with specific roles
- Default role is still 'GUEST' if not specified
- ADMIN role can be assigned during registration

### 2. **Improved User Permissions**
- Users can update their own data (firstName, lastName, email, phone)
- ADMIN and MANAGER can update any user's data
- Proper permission checks for all user operations

### 3. **Enhanced Security**
- Role-based access control (RBAC)
- Proper authentication middleware
- Input validation for all endpoints

### 4. **Admin User Creation**
- Seed script creates admin@roomy.com with ADMIN role
- Creates test users for different roles
- Handles existing users gracefully

## 🎯 Expected Results

After deployment:
1. ✅ **admin@roomy.com** will have ADMIN role
2. ✅ **Owner update** will work in frontend
3. ✅ **Role-based permissions** will be enforced
4. ✅ **User management** will be fully functional

## 🚨 Rollback Plan

If issues occur:
```bash
# SSH to server
ssh root@5.223.55.121
cd /var/www/roomy-backend

# Restore backup
rm -rf src
mv src_backup_YYYYMMDD_HHMMSS src

# Restart backend
pm2 restart roomy-backend
```

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs roomy-backend`
2. Verify database connection
3. Check environment variables
4. Review error logs in console
