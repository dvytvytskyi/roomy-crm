const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'test';
const CSV_FILE_PATH = './owners-report-2025-10-04-03-32-43.csv';

// Property to keep owner (A I Westwood | 616)
const KEEP_OWNER_PROPERTY_ID = 'prop_1';

// Mock owner IDs to delete
const MOCK_OWNER_IDS = [
  'owner_1', 'owner_2', 'owner_3', 'owner_4', 'owner_5',
  'owner_6', 'owner_7', 'owner_8', 'owner_9', 'owner_10'
];

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const owners = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const owner = {};
    
    headers.forEach((header, index) => {
      owner[header] = values[index] || '';
    });
    
    // Parse name into firstName and lastName
    const nameParts = owner.NAME.split(' ').filter(part => part.length > 0);
    owner.firstName = nameParts[0] || 'Unknown';
    owner.lastName = nameParts.slice(1).join(' ') || 'Unknown';
    
    // Set default values for missing fields
    owner.email = owner.EMAIL || 'unknown@example.com';
    owner.phone = owner.PHONE || 'Unknown';
    owner.nationality = 'Unknown';
    owner.dateOfBirth = 'Unknown';
    owner.role = 'OWNER';
    owner.isActive = owner['PORTAL STATUS'] === 'Active';
    owner.comments = owner.NOTES || '';
    owner.totalUnits = 0;
    owner.properties = [];
    owner.documents = [];
    owner.bankDetails = [];
    owner.transactions = [];
    owner.activityLog = [];
    
    owners.push(owner);
  }
  
  return owners;
}

async function deleteMockOwners() {
  console.log('🗑️  Deleting mock owners...');
  
  for (const ownerId of MOCK_OWNER_IDS) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/owners/${ownerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });

      if (response.ok) {
        console.log(`✅ Deleted mock owner: ${ownerId}`);
      } else {
        console.log(`⚠️  Could not delete mock owner: ${ownerId} (might not exist)`);
      }
    } catch (error) {
      console.log(`⚠️  Error deleting mock owner ${ownerId}:`, error.message);
    }
  }
}

async function createRealOwner(ownerData) {
  try {
    const createData = {
      firstName: ownerData.firstName,
      lastName: ownerData.lastName,
      email: ownerData.email,
      phone: ownerData.phone,
      nationality: ownerData.nationality,
      dateOfBirth: ownerData.dateOfBirth,
      role: ownerData.role,
      isActive: ownerData.isActive,
      comments: ownerData.comments,
      totalUnits: ownerData.totalUnits,
      properties: ownerData.properties,
      documents: ownerData.documents,
      bankDetails: ownerData.bankDetails,
      transactions: ownerData.transactions,
      activityLog: ownerData.activityLog
    };

    const response = await fetch(`${API_BASE_URL}/users/owners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(createData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created owner: ${ownerData.firstName} ${ownerData.lastName} (ID: ${result.data.id})`);
      return result.data.id;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create owner ${ownerData.firstName} ${ownerData.lastName}:`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating owner ${ownerData.firstName} ${ownerData.lastName}:`, error);
    return null;
  }
}

async function removeOwnersFromProperties() {
  console.log('🗑️  Removing owners from all properties except A I Westwood | 616...');
  
  // Get all properties
  const response = await fetch(`${API_BASE_URL}/properties?limit=100`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });

  if (!response.ok) {
    console.error('❌ Failed to fetch properties');
    return;
  }

  const result = await response.json();
  const properties = result.data || result;

  let successCount = 0;
  let failCount = 0;

  for (const property of properties) {
    // Skip the property we want to keep with owner
    if (property.id === KEEP_OWNER_PROPERTY_ID) {
      console.log(`📌 Skipping property ${property.id} (A I Westwood | 616) - keeping its owner`);
      continue;
    }

    try {
      const updateResponse = await fetch(`${API_BASE_URL}/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
          owner: null,
          ownerId: null,
          selectedOwnerId: null,
          owner_name: null,
          owner_email: null,
          owner_phone: null
        })
      });

      if (updateResponse.ok) {
        console.log(`✅ Removed owner from property: ${property.nickname}`);
        successCount++;
      } else {
        console.error(`❌ Failed to remove owner from property: ${property.nickname}`);
        failCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating property ${property.id}:`, error);
      failCount++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`📊 Properties update summary: ${successCount} successful, ${failCount} failed`);
}

async function main() {
  try {
    console.log('🚀 Starting real owners import process...\n');

    // Step 1: Read and parse CSV file
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const owners = parseCSV(csvContent);
    console.log(`✅ Parsed ${owners.length} owners from CSV\n`);

    // Step 2: Delete mock owners
    await deleteMockOwners();
    console.log('');

    // Step 3: Create real owners
    console.log('👥 Creating real owners...');
    const createdOwnerIds = [];
    
    for (const owner of owners) {
      const ownerId = await createRealOwner(owner);
      if (ownerId) {
        createdOwnerIds.push(ownerId);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`✅ Created ${createdOwnerIds.length} real owners\n`);

    // Step 4: Remove owners from all properties except A I Westwood | 616
    await removeOwnersFromProperties();

    console.log('\n🎉 Import process completed!');
    console.log(`📊 Summary:`);
    console.log(`- Imported ${owners.length} owners from CSV`);
    console.log(`- Created ${createdOwnerIds.length} real owners`);
    console.log(`- Deleted ${MOCK_OWNER_IDS.length} mock owners`);
    console.log(`- Kept owner only for A I Westwood | 616 property`);

  } catch (error) {
    console.error('❌ Error during import process:', error);
  }
}

main().catch(console.error);
