const { PrismaClient } = require('@prisma/client');
const ical = require('node-ical');

const prisma = new PrismaClient();

async function testICalImport() {
  try {
    const propertyId = 'property-1760619164285-k1oqe3aop';
    const airbnbUrl = 'https://www.airbnb.com/calendar/ical/982994149155611239.ics?s=27fa9c9ff82348a71c2a3a9929167a20';
    
    console.log(`🔄 Testing iCal import for property: ${propertyId}`);
    console.log(`📅 Airbnb URL: ${airbnbUrl}`);
    
    // Завантажуємо iCal файл
    console.log('📥 Fetching iCal data...');
    const response = await fetch(airbnbUrl, {
      headers: {
        'User-Agent': 'Roomy-Calendar-Importer/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const icalData = await response.text();
    console.log('✅ iCal data fetched successfully');
    
    // Парсимо iCal
    console.log('🔍 Parsing iCal data...');
    const events = ical.parseICS(icalData);
    console.log(`📊 Found ${Object.keys(events).length} events in iCal`);
    
    let importedCount = 0;
    let updatedCount = 0;
    
    for (const [uid, event] of Object.entries(events)) {
      if (event.type === 'VEVENT') {
        console.log(`📅 Processing event: ${event.summary} (${event.start} - ${event.end})`);
        
        const externalId = event.uid;
        const checkIn = new Date(event.start);
        const checkOut = new Date(event.end);
        
        // Перевіряємо, чи існує вже така резервація
        const existingReservation = await prisma.reservations.findFirst({
          where: {
            external_id: externalId,
            property_id: propertyId
          }
        });

        const reservationData = {
          property_id: propertyId,
          check_in: checkIn,
          check_out: checkOut,
          guests: 1,
          total_amount: 0,
          status: 'CONFIRMED',
          source: 'AIRBNB',
          external_id: externalId,
          guest_name: event.summary || 'Guest from Airbnb',
          guest_email: null,
          guest_phone: null,
          special_requests: event.description || null,
          updated_at: new Date()
        };

        if (existingReservation) {
          // Оновлюємо існуючу резервацію
          await prisma.reservations.update({
            where: { id: existingReservation.id },
            data: reservationData
          });
          console.log(`✅ Updated reservation: ${externalId}`);
          updatedCount++;
        } else {
          // Створюємо нову резервацію
          const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await prisma.reservations.create({
            data: {
              ...reservationData,
              id: reservationId,
              reservation_id: reservationId,
              created_at: new Date()
            }
          });
          console.log(`✅ Created new reservation: ${externalId}`);
          importedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Import completed successfully!`);
    console.log(`📊 New reservations: ${importedCount}`);
    console.log(`📊 Updated reservations: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error during iCal import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testICalImport();
