import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCorrectHash() {
  try {
    console.log('🔐 Creating correct password hash...');
    
    // Використовуємо bcrypt для створення хешу
    const bcrypt = require('bcrypt');
    
    const password = 'admin123';
    const saltRounds = 10;
    
    console.log(`📝 Password: ${password}`);
    console.log(`🔧 Salt rounds: ${saltRounds}`);
    
    // Створюємо новий хеш
    const newHash = await bcrypt.hash(password, saltRounds);
    console.log(`🔒 New hash: ${newHash}`);
    
    // Тестуємо хеш
    const isValid = await bcrypt.compare(password, newHash);
    console.log(`✅ Hash test: ${isValid ? 'VALID' : 'INVALID'}`);
    
    // Оновлюємо в базі даних
    await prisma.user.update({
      where: { email: 'admin@roomy.com' },
      data: {
        password: newHash
      }
    });
    
    console.log('\n✅ Password updated with correct hash!');
    console.log(`\n📋 Test login with:`);
    console.log(`   Email: admin@roomy.com`);
    console.log(`   Password: ${password}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createCorrectHash();
