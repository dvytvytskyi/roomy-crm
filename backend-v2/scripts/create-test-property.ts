import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestProperty() {
  try {
    console.log('🏠 Creating test property...');
    
    // Перевіряємо чи є вже квартири
    const existingProperties = await prisma.properties.findMany();
    
    if (existingProperties.length > 0) {
      console.log(`\n✅ Properties already exist (${existingProperties.length}):`);
      existingProperties.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.name} (ID: ${prop.id})`);
      });
      await prisma.$disconnect();
      return;
    }

    // Створюємо тестову квартиру
    const property = await prisma.properties.create({
      data: {
        id: `prop_${Date.now()}`,
        name: 'Test Apartment Kyiv Center',
        nickname: 'Kyiv Apt 1',
        title: 'Cozy 2BR Apartment in Kyiv City Center',
        type: 'APARTMENT',
        type_of_unit: 'SINGLE',
        address: '123 Khreshchatyk Street',
        city: 'Kyiv',
        country: 'Ukraine',
        capacity: 4,
        bedrooms: 2,
        bathrooms: 1,
        price_per_night: 50,
        description: 'Beautiful apartment in the heart of Kyiv',
        amenities: ['wifi', 'kitchen', 'tv'],
        house_rules: ['no_smoking', 'no_pets'],
        tags: ['city_center', 'modern'],
        is_active: true,
        is_published: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('\n✅ Test property created successfully!');
    console.log(`\n📋 Property Details:`);
    console.log(`   ID: ${property.id}`);
    console.log(`   Name: ${property.name}`);
    console.log(`   Location: ${property.city}, ${property.country}`);
    console.log(`   Capacity: ${property.capacity} guests`);
    console.log(`   Bedrooms: ${property.bedrooms}`);
    console.log(`   Price: $${property.price_per_night}/night`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestProperty();
