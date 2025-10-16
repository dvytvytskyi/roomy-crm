const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAirbnbUrl() {
  try {
    const propertyId = 'property-1760619164285-k1oqe3aop';
    const airbnbUrl = 'https://www.airbnb.com/calendar/ical/982994149155611239.ics?s=27fa9c9ff82348a71c2a3a9929167a20';
    
    console.log(`🔄 Updating Airbnb iCal URL for property: ${propertyId}`);
    console.log(`📅 Airbnb URL: ${airbnbUrl}`);
    
    const result = await prisma.properties.update({
      where: { id: propertyId },
      data: { 
        airbnb_ical_import_url: airbnbUrl 
      }
    });
    
    console.log('✅ Airbnb iCal URL updated successfully!');
    console.log(`📊 Property: ${result.name}`);
    console.log(`🔗 Airbnb URL: ${result.airbnb_ical_import_url}`);
    
  } catch (error) {
    console.error('❌ Error updating Airbnb URL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAirbnbUrl();
