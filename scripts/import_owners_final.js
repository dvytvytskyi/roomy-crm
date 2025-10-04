import fs from 'fs';
import path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'test';
const CSV_FILE_PATH = './owners-report-2025-10-04-03-32-43.csv';

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

async function createOwner(ownerData) {
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

async function getExistingOwners() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/owners?limit=100`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Existing owners response:', JSON.stringify(result, null, 2));
      
      // Handle different response structures
      if (result.data && Array.isArray(result.data)) {
        return result.data;
      } else if (result.data && result.data.owners && Array.isArray(result.data.owners)) {
        return result.data.owners;
      } else if (result.owners && Array.isArray(result.owners)) {
        return result.owners;
      } else {
        console.log('No owners found in response');
        return [];
      }
    } else {
      console.error('❌ Failed to fetch existing owners');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching existing owners:', error);
    return [];
  }
}

async function assignOwnerToProperty(propertyId, ownerId, ownerName) {
  try {
    const updateData = {
      ownerId: ownerId,
      owner_name: ownerName,
      owner_email: 'unknown@example.com',
      owner_phone: 'Unknown'
    };

    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      console.log(`✅ Assigned owner ${ownerName} to property ${propertyId}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to assign owner to property ${propertyId}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error assigning owner to property ${propertyId}:`, error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting real owners import and sync process...\n');

    // Step 1: Read and parse CSV file
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const owners = parseCSV(csvContent);
    console.log(`✅ Parsed ${owners.length} owners from CSV\n`);

    // Step 2: Check existing owners
    console.log('🔍 Checking existing owners...');
    const existingOwners = await getExistingOwners();
    console.log(`✅ Found ${existingOwners.length} existing owners\n`);

    // Step 3: Create new owners
    console.log('👥 Creating new owners...');
    const createdOwnerIds = [];
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const owner of owners) {
      // Check if owner already exists by email
      const existingOwner = existingOwners.find(existing => 
        existing.email === owner.email || 
        (existing.firstName === owner.firstName && existing.lastName === owner.lastName)
      );
      
      if (existingOwner) {
        console.log(`⏭️  Skipping existing owner: ${owner.firstName} ${owner.lastName}`);
        createdOwnerIds.push(existingOwner.id);
        skippedCount++;
        continue;
      }
      
      const ownerId = await createOwner(owner);
      if (ownerId) {
        createdOwnerIds.push(ownerId);
        createdCount++;
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ Import summary: ${createdCount} created, ${skippedCount} skipped\n`);

    // Step 4: Assign owners to properties based on CSV data
    console.log('🔗 Syncing owners with properties...');
    let assignedCount = 0;
    
    for (const owner of owners) {
      if (owner.PROPERTIES && owner.PROPERTIES.trim()) {
        // Parse property names from CSV (format: "B l Bellevue l 1105 / JVC l Crescent l 218")
        const propertyNames = owner.PROPERTIES.split('/').map(name => name.trim());
        
        for (const propertyName of propertyNames) {
          // Try to find property by nickname (this is a simplified matching)
          // In real implementation, you might need more sophisticated matching
          console.log(`🔍 Looking for property: ${propertyName}`);
          
          // For now, we'll skip automatic assignment and let manual assignment
          // This prevents incorrect assignments due to name variations
        }
      }
    }
    
    console.log(`✅ Sync summary: ${assignedCount} assignments attempted\n`);

    console.log('🎉 Import and sync process completed!');
    console.log(`📊 Final Summary:`);
    console.log(`- Processed ${owners.length} owners from CSV`);
    console.log(`- Created ${createdCount} new owners`);
    console.log(`- Skipped ${skippedCount} existing owners`);
    console.log(`- Total owners in system: ${existingOwners.length + createdCount}`);
    console.log(`- Ready for manual property assignments`);

  } catch (error) {
    console.error('❌ Error during import process:', error);
  }
}

main().catch(console.error);
