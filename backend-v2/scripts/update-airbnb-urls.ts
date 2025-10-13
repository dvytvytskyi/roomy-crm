import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAirbnbUrls() {
  try {
    console.log('🔄 Updating Airbnb iCal URLs for all properties...');
    
    // Отримуємо всі квартири
    const properties = await prisma.properties.findMany({
      select: { 
        id: true, 
        name: true, 
        airbnb_ical_import_url: true,
        booking_ical_import_url: true 
      }
    });
    
    console.log(`\n📊 Found ${properties.length} properties:`);
    properties.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.name} (${prop.id})`);
      console.log(`      Airbnb URL: ${prop.airbnb_ical_import_url || 'Not set'}`);
      console.log(`      Booking URL: ${prop.booking_ical_import_url || 'Not set'}`);
      console.log('');
    });
    
    // Оновлюємо Airbnb URL для всіх квартир
    const newAirbnbUrl = 'https://www.airbnb.com/calendar/ical/1189469667918587127.ics?s=61f84d1ddec43b9f4b7ffcd0a1f10c4a';
    
    console.log(`\n🔧 Updating Airbnb URL to: ${newAirbnbUrl}`);
    
    let updatedCount = 0;
    for (const property of properties) {
      try {
        await prisma.properties.update({
          where: { id: property.id },
          data: {
            airbnb_ical_import_url: newAirbnbUrl
          }
        });
        updatedCount++;
        console.log(`✅ Updated: ${property.name}`);
      } catch (error) {
        console.error(`❌ Error updating ${property.name}:`, error);
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   Updated: ${updatedCount} properties`);
    
    // Тепер запускаємо ручний імпорт
    console.log(`\n🔄 Running manual import...`);
    
    // Симулюємо виклик API для ручного імпорту
    try {
      const response = await fetch('http://localhost:3002/api/v2/calendar/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Manual import completed: ${result.message}`);
      } else {
        console.log(`❌ Manual import failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error calling import API: ${error}`);
    }
    
    // Показуємо статистику резервацій
    const reservations = await prisma.reservations.findMany({
      select: {
        source: true,
        status: true,
        guest_name: true,
        check_in: true,
        check_out: true
      },
      orderBy: { check_in: 'desc' },
      take: 10
    });
    
    console.log(`\n📊 Latest reservations:`);
    reservations.forEach((res, index) => {
      console.log(`   ${index + 1}. ${res.guest_name} (${res.source}) - ${res.check_in.toISOString().split('T')[0]} to ${res.check_out.toISOString().split('T')[0]} - ${res.status}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateAirbnbUrls();
