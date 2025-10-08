const { PrismaClient } = require('@prisma/client');

async function testPropertyAPI() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing Property API response...\n');

    // Get first property
    const property = await prisma.properties.findFirst({
      include: {
        users_properties_owner_idTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        users_properties_agent_idTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!property) {
      console.log('❌ No properties found in database!');
      return;
    }

    console.log('🏠 Property found:');
    console.log(`   ID: ${property.id}`);
    console.log(`   Name: ${property.name}`);
    console.log(`   Owner ID: ${property.owner_id}`);
    console.log(`   Agent ID: ${property.agent_id}\n`);

    console.log('👤 Owner data from database:');
    if (property.users_properties_owner_idTousers) {
      const owner = property.users_properties_owner_idTousers;
      console.log(`   ID: ${owner.id}`);
      console.log(`   Name: ${owner.firstName} ${owner.lastName}`);
      console.log(`   Email: ${owner.email}`);
      console.log(`   Phone: ${owner.phone}\n`);
    } else {
      console.log('   ❌ No owner data found!\n');
    }

    console.log('👨‍💼 Agent data from database:');
    if (property.users_properties_agent_idTousers) {
      const agent = property.users_properties_agent_idTousers;
      console.log(`   ID: ${agent.id}`);
      console.log(`   Name: ${agent.firstName} ${agent.lastName}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   Phone: ${agent.phone}\n`);
    } else {
      console.log('   ❌ No agent data found!\n');
    }

    // Test the mapping logic
    const mappedProperty = {
      id: property.id,
      name: property.name,
      ownerId: property.owner_id || undefined,
      agentId: property.agent_id || undefined,
      owner: property.users_properties_owner_idTousers ? {
        id: property.users_properties_owner_idTousers.id,
        firstName: property.users_properties_owner_idTousers.firstName,
        lastName: property.users_properties_owner_idTousers.lastName,
        email: property.users_properties_owner_idTousers.email,
        phone: property.users_properties_owner_idTousers.phone || undefined
      } : undefined,
      agent: property.users_properties_agent_idTousers ? {
        id: property.users_properties_agent_idTousers.id,
        firstName: property.users_properties_agent_idTousers.firstName,
        lastName: property.users_properties_agent_idTousers.lastName,
        email: property.users_properties_agent_idTousers.email,
        phone: property.users_properties_agent_idTousers.phone || undefined
      } : undefined
    };

    console.log('📋 Mapped property response (as API would return):');
    console.log(JSON.stringify(mappedProperty, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPropertyAPI();
