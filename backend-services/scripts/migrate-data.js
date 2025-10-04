const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('🔄 Migrating users...');
  
  try {
    const usersData = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf-8');
    const users = JSON.parse(usersData);
    
    for (const user of users) {
      // Hash password if it's not already hashed
      let hashedPassword = user.password;
      if (!user.password.startsWith('$2a$')) {
        hashedPassword = await bcrypt.hash(user.password, 12);
      }
      
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          password: hashedPassword,
          firstName: user.name || user.firstName || 'Unknown',
          lastName: user.lastName || 'User',
          role: user.role?.toUpperCase() || 'GUEST',
          isActive: user.isActive !== false,
        },
        create: {
          id: user.id,
          email: user.email,
          password: hashedPassword,
          firstName: user.name || user.firstName || 'Unknown',
          lastName: user.lastName || 'User',
          role: user.role?.toUpperCase() || 'GUEST',
          isActive: user.isActive !== false,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        },
      });
    }
    
    console.log(`✅ Migrated ${users.length} users`);
  } catch (error) {
    console.error('❌ Error migrating users:', error);
  }
}

async function migrateProperties() {
  console.log('🔄 Migrating properties...');
  
  try {
    const propertiesData = await fs.readFile(path.join(__dirname, '../data/properties.json'), 'utf-8');
    const properties = JSON.parse(propertiesData);
    
    for (const property of properties) {
      await prisma.property.upsert({
        where: { id: property.id },
        update: {
          name: property.name,
          nickname: property.nickname,
          title: property.title,
          type: property.type,
          typeOfUnit: property.type_of_unit || 'SINGLE',
          address: property.address,
          city: property.city,
          country: property.country || 'UAE',
          capacity: property.capacity || 2,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 1,
          area: property.area,
          pricePerNight: property.pricePerNight || 0,
          description: property.description,
          amenities: property.amenities || [],
          houseRules: property.rules || [],
          tags: property.tags || [],
          primaryImage: property.primaryImage,
          pricelabId: property.pricelabId,
          isActive: property.status === 'Active',
          createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
          updatedAt: property.lastModifiedAt ? new Date(property.lastModifiedAt) : new Date(),
        },
        create: {
          id: property.id,
          name: property.name,
          nickname: property.nickname,
          title: property.title,
          type: property.type,
          typeOfUnit: property.type_of_unit || 'SINGLE',
          address: property.address,
          city: property.city,
          country: property.country || 'UAE',
          capacity: property.capacity || 2,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 1,
          area: property.area,
          pricePerNight: property.pricePerNight || 0,
          description: property.description,
          amenities: property.amenities || [],
          houseRules: property.rules || [],
          tags: property.tags || [],
          primaryImage: property.primaryImage,
          pricelabId: property.pricelabId,
          isActive: property.status === 'Active',
          createdAt: property.createdAt ? new Date(property.createdAt) : new Date(),
          updatedAt: property.lastModifiedAt ? new Date(property.lastModifiedAt) : new Date(),
        },
      });
    }
    
    console.log(`✅ Migrated ${properties.length} properties`);
  } catch (error) {
    console.error('❌ Error migrating properties:', error);
  }
}

async function migrateOwners() {
  console.log('🔄 Migrating owners...');
  
  try {
    const ownersData = await fs.readFile(path.join(__dirname, '../data/owners.json'), 'utf-8');
    const owners = JSON.parse(ownersData);
    
    for (const owner of owners) {
      // Create owner as User with OWNER role
      await prisma.user.upsert({
        where: { email: owner.email || `owner_${owner.id}@roomy.com` },
        update: {
          firstName: owner.name || owner.firstName || 'Owner',
          lastName: owner.lastName || 'User',
          phone: owner.phone,
          role: 'OWNER',
          isActive: owner.status === 'active',
        },
        create: {
          id: owner.id,
          email: owner.email || `owner_${owner.id}@roomy.com`,
          password: await bcrypt.hash('temp_password_123', 12), // Temporary password
          firstName: owner.name || owner.firstName || 'Owner',
          lastName: owner.lastName || 'User',
          phone: owner.phone,
          role: 'OWNER',
          isActive: owner.status === 'active',
          createdAt: owner.createdAt ? new Date(owner.createdAt) : new Date(),
          updatedAt: owner.lastModifiedAt ? new Date(owner.lastModifiedAt) : new Date(),
        },
      });
    }
    
    console.log(`✅ Migrated ${owners.length} owners`);
  } catch (error) {
    console.error('❌ Error migrating owners:', error);
  }
}

async function migrateGuests() {
  console.log('🔄 Migrating guests...');
  
  try {
    const guestsData = await fs.readFile(path.join(__dirname, '../data/guests.json'), 'utf-8');
    const guests = JSON.parse(guestsData);
    
    for (const guest of guests) {
      await prisma.user.upsert({
        where: { email: guest.email || `guest_${guest.id}@roomy.com` },
        update: {
          firstName: guest.firstName || guest.name || 'Guest',
          lastName: guest.lastName || 'User',
          phone: guest.phone,
          role: 'GUEST',
          isActive: true,
        },
        create: {
          id: guest.id,
          email: guest.email || `guest_${guest.id}@roomy.com`,
          password: await bcrypt.hash('temp_password_123', 12), // Temporary password
          firstName: guest.firstName || guest.name || 'Guest',
          lastName: guest.lastName || 'User',
          phone: guest.phone,
          role: 'GUEST',
          isActive: true,
          createdAt: guest.createdAt ? new Date(guest.createdAt) : new Date(),
          updatedAt: guest.lastModifiedAt ? new Date(guest.lastModifiedAt) : new Date(),
        },
      });
    }
    
    console.log(`✅ Migrated ${guests.length} guests`);
  } catch (error) {
    console.error('❌ Error migrating guests:', error);
  }
}

async function migrateAgents() {
  console.log('🔄 Migrating agents...');
  
  try {
    const agentsData = await fs.readFile(path.join(__dirname, '../data/agents.json'), 'utf-8');
    const agents = JSON.parse(agentsData);
    
    for (const agent of agents) {
      await prisma.user.upsert({
        where: { email: agent.email || `agent_${agent.id}@roomy.com` },
        update: {
          firstName: agent.firstName || agent.name || 'Agent',
          lastName: agent.lastName || 'User',
          phone: agent.phone,
          role: 'AGENT',
          isActive: agent.status === 'active',
        },
        create: {
          id: String(agent.id),
          email: agent.email || `agent_${agent.id}@roomy.com`,
          password: await bcrypt.hash('temp_password_123', 12), // Temporary password
          firstName: agent.firstName || agent.name || 'Agent',
          lastName: agent.lastName || 'User',
          phone: agent.phone,
          role: 'AGENT',
          isActive: agent.status === 'active',
          createdAt: agent.createdAt ? new Date(agent.createdAt) : new Date(),
          updatedAt: agent.lastModifiedAt ? new Date(agent.lastModifiedAt) : new Date(),
        },
      });
    }
    
    console.log(`✅ Migrated ${agents.length} agents`);
  } catch (error) {
    console.error('❌ Error migrating agents:', error);
  }
}

async function migrateSystemSettings() {
  console.log('🔄 Migrating system settings...');
  
  try {
    const settingsData = await fs.readFile(path.join(__dirname, '../data/settings.json'), 'utf-8');
    const settings = JSON.parse(settingsData);
    
    // Migrate settings as system settings
    await prisma.systemSetting.upsert({
      where: { key: 'app_settings' },
      update: {
        value: settings,
        description: 'Application settings migrated from JSON',
        category: 'app',
      },
      create: {
        key: 'app_settings',
        value: settings,
        description: 'Application settings migrated from JSON',
        category: 'app',
      },
    });
    
    console.log('✅ Migrated system settings');
  } catch (error) {
    console.error('❌ Error migrating system settings:', error);
  }
}

async function main() {
  console.log('🚀 Starting data migration from JSON to PostgreSQL...');
  
  try {
    await migrateUsers();
    await migrateProperties();
    await migrateOwners();
    await migrateGuests();
    await migrateAgents();
    await migrateSystemSettings();
    
    console.log('🎉 Data migration completed successfully!');
    
    // Show summary
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    const settingsCount = await prisma.systemSetting.count();
    
    console.log('\n📊 Migration Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Properties: ${propertyCount}`);
    console.log(`- System Settings: ${settingsCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  migrateUsers,
  migrateProperties,
  migrateOwners,
  migrateGuests,
  migrateAgents,
  migrateSystemSettings,
};
