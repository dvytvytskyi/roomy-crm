import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAirbnbSync() {
  try {
    console.log('🔄 Setting up Airbnb calendar sync...');
    
    // Отримуємо список всіх квартир
    const properties = await prisma.properties.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        airbnb_ical_import_url: true
      }
    });

    console.log(`\n📊 Found ${properties.length} properties:\n`);
    
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.name} (${property.nickname || property.id})`);
      console.log(`   ID: ${property.id}`);
      if (property.airbnb_ical_import_url) {
        console.log(`   ✅ Airbnb sync already configured`);
      } else {
        console.log(`   ❌ Airbnb sync not configured`);
      }
      console.log('');
    });

    // Якщо є квартири, налаштовуємо першу
    if (properties.length > 0) {
      const firstProperty = properties[0];
      if (!firstProperty) {
        console.log('❌ No properties found. Please create a property first.');
        await prisma.$disconnect();
        return;
      }
      
      const airbnbUrl = 'https://www.airbnb.com/calendar/ical/1189469667918587127.ics?s=61f84d1ddec43b9f4b7ffcd0a1f10c4a';
      
      console.log(`\n🔧 Configuring Airbnb sync for: ${firstProperty.name}`);
      console.log(`   Property ID: ${firstProperty.id}`);
      console.log(`   Airbnb URL: ${airbnbUrl}`);
      
      // Оновлюємо квартиру
      await prisma.properties.update({
        where: { id: firstProperty.id },
        data: {
          airbnb_ical_import_url: airbnbUrl
        }
      });

      console.log(`\n✅ Successfully configured Airbnb sync!`);
      console.log(`\n📤 Your export URL for Airbnb:`);
      console.log(`   http://localhost:3002/api/v2/calendar/properties/${firstProperty.id}/calendar.ics`);
      console.log(`\n📋 Steps to complete setup:`);
      console.log(`   1. Copy the export URL above`);
      console.log(`   2. Go to Airbnb calendar sync settings`);
      console.log(`   3. Click "Import Calendar"`);
      console.log(`   4. Paste the export URL`);
      console.log(`   5. Give it a name (e.g., "My PMS Sync")`);
      console.log(`   6. Click "Add calendar"`);
      
      console.log(`\n🔄 Automatic import from Airbnb will run every 5 minutes`);
    } else {
      console.log('❌ No properties found. Please create a property first.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupAirbnbSync();
