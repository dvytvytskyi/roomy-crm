import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPublicUrl() {
  try {
    console.log('🌐 Creating public URL for testing...');
    
    // Отримуємо property ID
    const properties = await prisma.properties.findMany({
      select: { id: true, name: true }
    });
    
    if (properties.length > 0) {
      const propertyId = properties[0]?.id;
      
      console.log(`\n📋 For Airbnb calendar sync, you have two options:`);
      console.log(`\n🟢 OPTION 1: Use ngrok (Recommended for testing)`);
      console.log(`   1. Sign up at: https://dashboard.ngrok.com/signup`);
      console.log(`   2. Install authtoken: https://dashboard.ngrok.com/get-started/your-authtoken`);
      console.log(`   3. Run: ngrok http 3002`);
      console.log(`   4. Use the https://xxx.ngrok-free.app URL`);
      
      console.log(`\n🟡 OPTION 2: Use localtunnel (Alternative)`);
      console.log(`   1. Install: npm install -g localtunnel`);
      console.log(`   2. Run: lt --port 3002`);
      console.log(`   3. Use the https://xxx.loca.lt URL`);
      
      console.log(`\n📤 Your calendar export endpoint will be:`);
      console.log(`   https://YOUR_PUBLIC_URL/api/v2/calendar/properties/${propertyId}/calendar.ics`);
      
      console.log(`\n🔧 Current local URL (for testing):`);
      console.log(`   http://localhost:3002/api/v2/calendar/properties/${propertyId}/calendar.ics`);
      
      console.log(`\n📋 Steps for Airbnb:`);
      console.log(`   1. Get your public URL using ngrok or localtunnel`);
      console.log(`   2. Replace YOUR_PUBLIC_URL with the actual URL`);
      console.log(`   3. Paste the full URL in Airbnb "Other website link"`);
      console.log(`   4. Set calendar name to "My PMS Sync"`);
      console.log(`   5. Click "Add calendar"`);
      
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

createPublicUrl();
