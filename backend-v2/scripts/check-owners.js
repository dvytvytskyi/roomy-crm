const { PrismaClient } = require('@prisma/client');

async function checkOwners() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking owners in database...\n');

    // Get all users with OWNER role
    const owners = await prisma.user.findMany({
      where: {
        role: 'OWNER'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        is_active: true,
        createdAt: true,
        _count: {
          select: {
            properties_properties_owner_idTousers: true
          }
        }
      }
    });

    console.log(`📊 Total owners found: ${owners.length}\n`);

    if (owners.length === 0) {
      console.log('❌ No owners found in database!');
      console.log('💡 You may need to create owner users first.\n');
    } else {
      console.log('👥 Owners list:\n');
      owners.forEach((owner, index) => {
        console.log(`${index + 1}. ${owner.firstName} ${owner.lastName}`);
        console.log(`   ID: ${owner.id}`);
        console.log(`   Email: ${owner.email}`);
        console.log(`   Phone: ${owner.phone || 'N/A'}`);
        console.log(`   Active: ${owner.is_active ? 'Yes' : 'No'}`);
        console.log(`   Properties: ${owner._count.properties_properties_owner_idTousers}`);
        console.log(`   Created: ${owner.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Also check all users
    console.log('📋 All users by role:\n');
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    usersByRole.forEach(group => {
      console.log(`   ${group.role}: ${group._count.id} users`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOwners();

