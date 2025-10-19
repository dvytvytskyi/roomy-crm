import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🚀 Creating test users for portal testing...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create TEST AGENT
    const agent = await prisma.user.upsert({
      where: { email: 'agent@roomy.com' },
      update: {},
      create: {
        id: 'test-agent-001',
        email: 'agent@roomy.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Agent',
        role: UserRole.AGENT,
        is_active: true,
        isVerified: true,
        date_of_birth: new Date('1990-01-01'),
      },
    });

    console.log('✅ TEST AGENT created:');
    console.log('   Email: agent@roomy.com');
    console.log('   Password: test123');
    console.log('   Role: AGENT');
    console.log('   ID:', agent.id);
    console.log('');

    // Create TEST OWNER
    const owner = await prisma.user.upsert({
      where: { email: 'owner@roomy.com' },
      update: {},
      create: {
        id: 'test-owner-001',
        email: 'owner@roomy.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Owner',
        role: UserRole.OWNER,
        is_active: true,
        isVerified: true,
        date_of_birth: new Date('1985-01-01'),
      },
    });

    console.log('✅ TEST OWNER created:');
    console.log('   Email: owner@roomy.com');
    console.log('   Password: test123');
    console.log('   Role: OWNER');
    console.log('   ID:', owner.id);
    console.log('');

    // Assign some properties to AGENT (update first 3 properties)
    const agentProperties = await prisma.properties.updateMany({
      where: {
        OR: [
          { id: 'prop1' },
          { id: 'prop2' },
          { id: 'prop3' },
        ],
      },
      data: {
        agent_id: agent.id,
      },
    });

    console.log(`✅ Assigned ${agentProperties.count} properties to TEST AGENT\n`);

    // Assign some properties to OWNER (update first 2 properties)
    const ownerProperties = await prisma.properties.updateMany({
      where: {
        OR: [
          { id: 'prop1' },
          { id: 'prop2' },
        ],
      },
      data: {
        owner_id: owner.id,
      },
    });

    console.log(`✅ Assigned ${ownerProperties.count} properties to TEST OWNER\n`);

    // Create test reservations for AGENT's properties
    console.log('📅 Creating test reservations for AGENT properties...\n');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Reservation 1 - Current (prop1)
    await prisma.reservations.upsert({
      where: { id: 'test-agent-res-1' },
      update: {},
      create: {
        id: 'test-agent-res-1',
        reservation_id: 'AGT-RES-001',
        property_id: 'prop1',
        guest_id: 'admin-001',
        agent_id: agent.id,
        check_in: tomorrow,
        check_out: nextWeek,
        guests: 2,
        total_amount: 1500,
        paid_amount: 1500,
        outstanding_balance: 0,
        status: 'CONFIRMED',
        source: 'AIRBNB',
        guest_name: 'John Agent Booking',
        guest_email: 'john.agent@example.com',
        guest_phone: '+971501234567',
        created_at: now,
        updated_at: now,
      },
    });

    // Reservation 2 - Upcoming (prop2)
    await prisma.reservations.upsert({
      where: { id: 'test-agent-res-2' },
      update: {},
      create: {
        id: 'test-agent-res-2',
        reservation_id: 'AGT-RES-002',
        property_id: 'prop2',
        guest_id: 'admin-001',
        agent_id: agent.id,
        check_in: nextWeek,
        check_out: nextMonth,
        guests: 4,
        total_amount: 3500,
        paid_amount: 2000,
        outstanding_balance: 1500,
        status: 'CONFIRMED',
        source: 'BOOKING_COM',
        guest_name: 'Sarah Agent Booking',
        guest_email: 'sarah.agent@example.com',
        guest_phone: '+971509876543',
        created_at: now,
        updated_at: now,
      },
    });

    // Reservation 3 - Pending (prop3)
    await prisma.reservations.upsert({
      where: { id: 'test-agent-res-3' },
      update: {},
      create: {
        id: 'test-agent-res-3',
        reservation_id: 'AGT-RES-003',
        property_id: 'prop3',
        guest_id: 'admin-001',
        agent_id: agent.id,
        check_in: nextMonth,
        check_out: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
        guests: 6,
        total_amount: 5000,
        paid_amount: 1000,
        outstanding_balance: 4000,
        status: 'PENDING',
        source: 'DIRECT',
        guest_name: 'Mike Agent Booking',
        guest_email: 'mike.agent@example.com',
        guest_phone: '+971507654321',
        created_at: now,
        updated_at: now,
      },
    });

    console.log('✅ Created 3 test reservations for AGENT properties\n');

    // Create test reservations for OWNER's properties
    console.log('📅 Creating test reservations for OWNER properties...\n');

    // Reservation 1 - Owner property (prop1)
    await prisma.reservations.upsert({
      where: { id: 'test-owner-res-1' },
      update: {},
      create: {
        id: 'test-owner-res-1',
        reservation_id: 'OWN-RES-001',
        property_id: 'prop1',
        guest_id: 'admin-001',
        agent_id: agent.id,
        check_in: new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
        check_out: new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000),
        guests: 3,
        total_amount: 2500,
        paid_amount: 2500,
        outstanding_balance: 0,
        status: 'CONFIRMED',
        source: 'AIRBNB',
        guest_name: 'Emma Owner Booking',
        guest_email: 'emma.owner@example.com',
        guest_phone: '+971501111111',
        created_at: now,
        updated_at: now,
      },
    });

    // Reservation 2 - Owner property (prop2)
    await prisma.reservations.upsert({
      where: { id: 'test-owner-res-2' },
      update: {},
      create: {
        id: 'test-owner-res-2',
        reservation_id: 'OWN-RES-002',
        property_id: 'prop2',
        guest_id: 'admin-001',
        agent_id: agent.id,
        check_in: new Date(nextMonth.getTime() + 20 * 24 * 60 * 60 * 1000),
        check_out: new Date(nextMonth.getTime() + 27 * 24 * 60 * 60 * 1000),
        guests: 2,
        total_amount: 4200,
        paid_amount: 4200,
        outstanding_balance: 0,
        status: 'CONFIRMED',
        source: 'DIRECT',
        guest_name: 'Oliver Owner Booking',
        guest_email: 'oliver.owner@example.com',
        guest_phone: '+971502222222',
        created_at: now,
        updated_at: now,
      },
    });

    console.log('✅ Created 2 test reservations for OWNER properties\n');

    console.log('🎉 TEST USERS & RESERVATIONS READY!');
    console.log('');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('');
    console.log('AGENT Portal (http://localhost:3000/agent-portal):');
    console.log('  Email: agent@roomy.com');
    console.log('  Password: test123');
    console.log('');
    console.log('OWNER Portal (http://localhost:3000/owner-portal):');
    console.log('  Email: owner@roomy.com');
    console.log('  Password: test123');
    console.log('');
    console.log('ADMIN CRM (http://localhost:3000/login):');
    console.log('  Email: admin@roomy.com');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

