import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSeptemberOctoberReservations() {
  try {
    console.log('📅 Adding September and October 2025 reservations...');
    
    // Отримуємо property ID
    const properties = await prisma.properties.findMany({
      select: { id: true, name: true }
    });
    
    if (properties.length === 0) {
      console.log('❌ No properties found. Please create a property first.');
      await prisma.$disconnect();
      return;
    }
    
    const propertyId = properties[0]?.id;
    if (!propertyId) {
      console.log('❌ No property ID found');
      await prisma.$disconnect();
      return;
    }
    console.log(`🏠 Using property: ${properties[0]?.name} (${propertyId})`);
    
    // Створюємо резервації за вересень та жовтень 2025
    const reservations = [
      // Вересень 2025
      {
        id: `res_${Date.now()}_sept1`,
        reservation_id: `res_${Date.now()}_sept1`,
        property_id: propertyId,
        check_in: new Date('2025-09-01'),
        check_out: new Date('2025-09-05'),
        guests: 2,
        total_amount: 200,
        paid_amount: 200,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-sept1-2025',
        guest_name: 'Anna Smith',
        guest_email: 'anna.smith@example.com',
        guest_phone: '+380501234567',
        special_requests: 'Late check-in after 10 PM',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `res_${Date.now()}_sept2`,
        reservation_id: `res_${Date.now()}_sept2`,
        property_id: propertyId,
        check_in: new Date('2025-09-10'),
        check_out: new Date('2025-09-15'),
        guests: 3,
        total_amount: 375,
        paid_amount: 375,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-sept2-2025',
        guest_name: 'Michael Johnson',
        guest_email: 'michael.j@example.com',
        guest_phone: '+380502345678',
        special_requests: 'Vegetarian breakfast',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `res_${Date.now()}_sept3`,
        reservation_id: `res_${Date.now()}_sept3`,
        property_id: propertyId,
        check_in: new Date('2025-09-20'),
        check_out: new Date('2025-09-25'),
        guests: 4,
        total_amount: 500,
        paid_amount: 500,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-sept3-2025',
        guest_name: 'Sarah Wilson',
        guest_email: 'sarah.wilson@example.com',
        guest_phone: '+380503456789',
        special_requests: 'Extra towels and pillows',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Жовтень 2025 (додаємо до існуючих)
      {
        id: `res_${Date.now()}_oct1`,
        reservation_id: `res_${Date.now()}_oct1`,
        property_id: propertyId,
        check_in: new Date('2025-10-01'),
        check_out: new Date('2025-10-07'),
        guests: 2,
        total_amount: 420,
        paid_amount: 420,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-oct1-2025',
        guest_name: 'David Brown',
        guest_email: 'david.brown@example.com',
        guest_phone: '+380504567890',
        special_requests: 'Quiet room, away from street',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `res_${Date.now()}_oct2`,
        reservation_id: `res_${Date.now()}_oct2`,
        property_id: propertyId,
        check_in: new Date('2025-10-12'),
        check_out: new Date('2025-10-18'),
        guests: 3,
        total_amount: 450,
        paid_amount: 450,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-oct2-2025',
        guest_name: 'Lisa Davis',
        guest_email: 'lisa.davis@example.com',
        guest_phone: '+380505678901',
        special_requests: 'High floor, city view',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: `res_${Date.now()}_oct3`,
        reservation_id: `res_${Date.now()}_oct3`,
        property_id: propertyId,
        check_in: new Date('2025-10-25'),
        check_out: new Date('2025-10-31'),
        guests: 1,
        total_amount: 300,
        paid_amount: 300,
        outstanding_balance: 0,
        status: 'CONFIRMED' as const,
        source: 'AIRBNB',
        external_id: 'airbnb-1189469667918587127-oct3-2025',
        guest_name: 'Robert Miller',
        guest_email: 'robert.miller@example.com',
        guest_phone: '+380506789012',
        special_requests: 'Business trip, need workspace',
        notes: 'Imported from Airbnb property 1189469667918587127',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    console.log(`\n📝 Creating ${reservations.length} reservations...`);
    
    let createdCount = 0;
    for (const reservation of reservations) {
      try {
        // Перевіряємо, чи не існує вже резервація з таким external_id
        const existing = await prisma.reservations.findFirst({
          where: { external_id: reservation.external_id }
        });
        
        if (!existing) {
          await prisma.reservations.create({
            data: reservation
          });
          createdCount++;
          console.log(`✅ Created: ${reservation.guest_name} (${reservation.check_in.toISOString().split('T')[0]} - ${reservation.check_out.toISOString().split('T')[0]})`);
        } else {
          console.log(`⏭️  Skipped: ${reservation.guest_name} (already exists)`);
        }
      } catch (error) {
        console.error(`❌ Error creating reservation for ${reservation.guest_name}:`, error);
      }
    }
    
    console.log(`\n🎉 Summary:`);
    console.log(`   Created: ${createdCount} new reservations`);
    console.log(`   Skipped: ${reservations.length - createdCount} existing reservations`);
    
    // Показуємо статистику
    const totalReservations = await prisma.reservations.count({
      where: { property_id: propertyId }
    });
    
    console.log(`\n📊 Total reservations for this property: ${totalReservations}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addSeptemberOctoberReservations();
