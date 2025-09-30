import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🌱 Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@roomy.com' }
    });

    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating role...');
      
      // Update existing user to ADMIN role
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@roomy.com' },
        data: {
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          updatedAt: new Date()
        }
      });

      console.log('✅ Admin user updated successfully:', {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      });

      return updatedAdmin;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@roomy.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        isVerified: true
      }
    });

    console.log('✅ Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createTestUsers() {
  try {
    console.log('🌱 Creating test users...');

    const testUsers = [
      {
        email: 'manager@roomy.com',
        password: 'manager123',
        firstName: 'Manager',
        lastName: 'User',
        role: 'MANAGER' as const
      },
      {
        email: 'agent@roomy.com',
        password: 'agent123',
        firstName: 'Agent',
        lastName: 'User',
        role: 'AGENT' as const
      },
      {
        email: 'owner@roomy.com',
        password: 'owner123',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER' as const
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const user = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            isActive: true,
            isVerified: true
          }
        });

        console.log(`✅ ${userData.role} user created:`, user.email);
      } else {
        console.log(`👤 ${userData.role} user already exists:`, userData.email);
      }
    }
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...');

    // Create admin user
    await createAdminUser();

    // Create test users
    await createTestUsers();

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Available test accounts:');
    console.log('👑 Admin: admin@roomy.com / admin123');
    console.log('👨‍💼 Manager: manager@roomy.com / manager123');
    console.log('👨‍💻 Agent: agent@roomy.com / agent123');
    console.log('🏠 Owner: owner@roomy.com / owner123');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createAdminUser, createTestUsers };
