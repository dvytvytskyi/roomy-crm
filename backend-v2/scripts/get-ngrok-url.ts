import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getNgrokUrl() {
  try {
    console.log('🔗 Getting ngrok public URL...');
    
    // Отримуємо URL з ngrok API
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    
    if (data.tunnels && data.tunnels.length > 0) {
      const publicUrl = data.tunnels[0].public_url;
      console.log(`\n✅ ngrok URL: ${publicUrl}`);
      
      // Отримуємо property ID
      const properties = await prisma.properties.findMany({
        select: { id: true, name: true }
      });
      
      if (properties.length > 0) {
        const propertyId = properties[0]?.id;
        const calendarUrl = `${publicUrl}/api/v2/calendar/properties/${propertyId}/calendar.ics`;
        
        console.log(`\n📤 Full calendar export URL for Airbnb:`);
        console.log(`   ${calendarUrl}`);
        
        console.log(`\n📋 Steps for Airbnb setup:`);
        console.log(`   1. Copy the URL above`);
        console.log(`   2. Paste it in Airbnb "Other website link" field`);
        console.log(`   3. Set calendar name to "My PMS Sync"`);
        console.log(`   4. Click "Add calendar"`);
      }
    } else {
      console.log('❌ No ngrok tunnels found. Make sure ngrok is running.');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error getting ngrok URL:', error);
    console.log('\n💡 Make sure ngrok is running:');
    console.log('   ngrok http 3002');
    await prisma.$disconnect();
    process.exit(1);
  }
}

getNgrokUrl();
