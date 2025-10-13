import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestApartment() {
  try {
    console.log('🗑️ Deleting test apartment and all related data...');
    
    // Знаходимо тестову квартиру
    const testProperty = await prisma.properties.findFirst({
      where: {
        OR: [
          { name: { contains: 'Test Apartment' } },
          { id: 'prop_1760261133187' }
        ]
      }
    });
    
    if (!testProperty) {
      console.log('❌ Test apartment not found');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`\n🏠 Found test apartment:`);
    console.log(`   Name: ${testProperty.name}`);
    console.log(`   ID: ${testProperty.id}`);
    
    // Видаляємо всі пов'язані дані
    console.log(`\n🗑️ Deleting related data...`);
    
    // Видаляємо резервації
    const reservationsCount = await prisma.reservations.count({
      where: { property_id: testProperty.id }
    });
    if (reservationsCount > 0) {
      await prisma.reservations.deleteMany({
        where: { property_id: testProperty.id }
      });
      console.log(`✅ Deleted ${reservationsCount} reservations`);
    }
    
    // Видаляємо фотографії
    const photosCount = await prisma.property_photos.count({
      where: { property_id: testProperty.id }
    });
    if (photosCount > 0) {
      await prisma.property_photos.deleteMany({
        where: { property_id: testProperty.id }
      });
      console.log(`✅ Deleted ${photosCount} photos`);
    }
    
    // Пропускаємо документи (можуть мати іншу структуру)
    console.log(`⏭️  Skipping documents (different structure)`);
    
    // Видаляємо витрати
    const expensesCount = await prisma.expenses.count({
      where: { property_id: testProperty.id }
    });
    if (expensesCount > 0) {
      await prisma.expenses.deleteMany({
        where: { property_id: testProperty.id }
      });
      console.log(`✅ Deleted ${expensesCount} expenses`);
    }
    
    // Видаляємо саму квартиру
    await prisma.properties.delete({
      where: { id: testProperty.id }
    });
    console.log(`✅ Deleted test apartment`);
    
    // Показуємо статистику після видалення
    const remainingProperties = await prisma.properties.findMany({
      select: { id: true, name: true }
    });
    
    const totalReservations = await prisma.reservations.count();
    
    console.log(`\n📊 After deletion:`);
    console.log(`   Remaining properties: ${remainingProperties.length}`);
    console.log(`   Total reservations: ${totalReservations}`);
    
    if (remainingProperties.length > 0) {
      console.log(`\n🏠 Remaining properties:`);
      remainingProperties.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.name} (${prop.id})`);
      });
    }
    
    console.log(`\n🎉 Test apartment deleted successfully!`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteTestApartment();
