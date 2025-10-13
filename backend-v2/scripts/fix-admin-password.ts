import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔐 Fixing admin password...');
    
    // Хешуємо новий пароль (використовуємо той самий хеш, що в БД)
    const newPassword = 'admin123';
    const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin123
    
    console.log(`📝 New password: ${newPassword}`);
    console.log(`🔒 Using pre-hashed password`);
    
    // Оновлюємо пароль адміна
    await prisma.user.update({
      where: { email: 'admin@roomy.com' },
      data: {
        password: hashedPassword
      }
    });

    console.log('\n✅ Admin password updated successfully!');
    console.log(`\n📋 Login credentials:`);
    console.log(`   Email: admin@roomy.com`);
    console.log(`   Password: ${newPassword}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Якщо користувач не існує, створимо його
    try {
      console.log('\n🔄 Admin user not found, creating new one...');
      
      const newPassword = 'admin123';
      const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // admin123
      
      await prisma.user.create({
        data: {
          id: 'admin-001',
          email: 'admin@roomy.com',
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          is_active: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('\n✅ New admin user created successfully!');
      console.log(`\n📋 Login credentials:`);
      console.log(`   Email: admin@roomy.com`);
      console.log(`   Password: ${newPassword}`);
      
    } catch (createError) {
      console.error('❌ Error creating admin:', createError);
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixAdminPassword();
