# Database Migration Instructions

## Migration: init_users

### Overview
This migration creates the User table and related enums (UserRole, UserStatus) for the Backend V2 system.

### Files Created
- `prisma/migrations/20241201000000_init_users/migration.sql` - Main migration SQL
- `apply-migration.sql` - Standalone SQL script for manual application
- `verify-migration.sql` - Verification queries

### What This Migration Creates

#### 1. Enums
- **UserRole**: ADMIN, MANAGER, AGENT, OWNER, GUEST, CLEANER, MAINTENANCE_STAFF
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, VIP

#### 2. Users Table
```sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "country" TEXT,
    "flag" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
```

#### 3. Indexes
- Unique index on email
- Index on email (for queries)
- Index on role (for filtering)
- Index on status (for filtering)
- Index on created_at (for sorting)

### How to Apply the Migration

#### Option 1: Using Prisma CLI (Recommended)
```bash
cd backend-v2
npx prisma migrate deploy
```

#### Option 2: Manual SQL Execution
1. Connect to your PostgreSQL database
2. Run the SQL from `apply-migration.sql`
3. Verify using queries from `verify-migration.sql`

#### Option 3: Using Database Tool
1. Open your database management tool (DBeaver, pgAdmin, etc.)
2. Connect to your database
3. Execute the SQL from `apply-migration.sql`
4. Run verification queries from `verify-migration.sql`

### Verification Steps

After applying the migration, verify it was successful:

1. **Check Enums Exist**:
   ```sql
   SELECT typname FROM pg_type WHERE typname IN ('UserRole', 'UserStatus');
   ```

2. **Check Table Exists**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'users' AND table_schema = 'public';
   ```

3. **Check Table Structure**:
   ```sql
   \d users
   ```

4. **Check Indexes**:
   ```sql
   \di users*
   ```

### Expected Results

#### UserRole Enum Values
- ADMIN
- MANAGER
- AGENT
- OWNER
- GUEST
- CLEANER
- MAINTENANCE_STAFF

#### UserStatus Enum Values
- ACTIVE
- INACTIVE
- SUSPENDED
- VIP

#### Users Table Columns
- id (TEXT, PRIMARY KEY)
- email (TEXT, UNIQUE, NOT NULL)
- phone (TEXT, NULLABLE)
- first_name (TEXT, NOT NULL)
- last_name (TEXT, NOT NULL)
- password_hash (TEXT, NOT NULL)
- role (UserRole, DEFAULT 'GUEST')
- status (UserStatus, DEFAULT 'ACTIVE')
- avatar (TEXT, NULLABLE)
- country (TEXT, NULLABLE)
- flag (TEXT, NULLABLE)
- is_verified (BOOLEAN, DEFAULT false)
- last_login_at (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP, DEFAULT NOW())
- updated_at (TIMESTAMP, NOT NULL)

#### Indexes Created
- users_pkey (PRIMARY KEY on id)
- users_email_key (UNIQUE on email)
- users_email_idx (INDEX on email)
- users_role_idx (INDEX on role)
- users_status_idx (INDEX on status)
- users_created_at_idx (INDEX on created_at)

### Troubleshooting

#### Error: "Type already exists"
If you get an error about the enum types already existing, you can:
1. Drop the existing types: `DROP TYPE IF EXISTS "UserRole" CASCADE;`
2. Re-run the migration

#### Error: "Table already exists"
If the users table already exists:
1. Drop the table: `DROP TABLE IF EXISTS "users" CASCADE;`
2. Re-run the migration

#### Error: "Permission denied"
Make sure your database user has the necessary permissions:
- CREATE privileges on the database
- USAGE privileges on the schema

### Next Steps

After successfully applying this migration:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Test the Migration**:
   ```bash
   npm test
   ```

3. **Start the Backend V2 Server**:
   ```bash
   npm run dev
   ```

4. **Verify API Endpoints**:
   - Health check: http://localhost:3002/health
   - API info: http://localhost:3002/api/v2

### Rollback Instructions

If you need to rollback this migration:

```sql
-- Drop the users table
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop the enums
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;
```

**Note**: Rolling back will delete all user data. Make sure to backup your data before rolling back.

---

This migration is the first step in setting up the Backend V2 database schema. Subsequent migrations will add other tables (Properties, Reservations, Tasks, etc.) as needed.
