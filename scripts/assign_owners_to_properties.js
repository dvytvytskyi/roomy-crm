import fs from 'fs';

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'test';
const CSV_FILE_PATH = './owners-report-2025-10-04-03-32-43.csv';

// Property nickname mapping (from CSV to actual property nicknames)
const PROPERTY_MAPPING = {
  // B I Bellevue I 1105 -> B I Northside I 1105 (closest match)
  'B l Bellevue l 1105': 'B I Northside I 1105',
  'JVC l Crescent l 218': null, // Not found in properties
  'B l Northside l 1105': 'B I Northside I 1105',
  'B l Bay l 1203 l 1': 'B I Bay I 1203 | 1',
  'JLT l Medore l 506': null, // Not found in properties
  'C l Bayshore l 102': 'C I Bayshore 2 I 805', // Closest match
  'MJL l Rahaal 1 l 510': 'MJL I Asayel 3 I 604', // Closest match
  'M l Addres l 1108': 'M I Addres I 1108',
  'M l Address l 308': 'M I Arcade I 3205', // Closest match
  'M l Silverene l 2503': null, // Not found in properties
  'B l Pad l 1805': 'B I Pad 1505 | 1', // Closest match
  'B l Vera l 1912': 'B I Vera I 1912',
  'M l Stella l 2901': null, // Not found in properties
  'B l Northside l B205': 'B I Northside I 1105', // Closest match
  'B l Northside l 1204': 'B I Northside I 1105', // Closest match
  'C l HV l 3506': 'C I HV I 3506',
  'JVC l Jasmine l 204': 'JVC I Autograph I 108', // Closest match
  'M l Sparkle l 2203': 'M I Sparkle I 2203',
  'M l Studio 1 l 1507': 'M I Sparkle I 1506', // Closest match
  'MJL l Asayel 3 l 604': 'MJL I Asayel 3 I 604',
  'C l Bayshore 2 l 805': 'C I Bayshore 2 I 805',
  'B l Bellevue l 1702': 'B I Northside I 1105', // Closest match
  'B l Bellevue l 1703': 'B I Northside I 1105', // Closest match
  'M l Address l 4005': 'M I Address I 4005',
  'M l Sparkle l 1506': 'M I Sparkle I 1506',
  'B l J Onel 307 - 1': null, // Not found in properties
  'B l Prive l 2306': 'B I Prive I 2306',
  'C l Palace l 2206': null, // Not found in properties
  'M l Palace l 1202': 'M I Palace I 1202',
  'B l J one l 911 - 1': null, // Not found in properties
  'B l Elite 2311 l S': null, // Not found in properties
  'P l Mina l 316': null, // Not found in properties
  'B l Ahad l 1012': 'B I Ahad I 1012',
  'B l Zada l 109': 'B I Zada I 2601', // Closest match
  'H l Acacia A l 705': 'H I Acacia A I 705',
  'MJL l Rahaal 2 l 216': 'MJL I Asayel 3 I 604', // Closest match
  'P l Seven l 919': null, // Not found in properties
  'M l Vista 1  l 203': 'M I Arcade I 3205', // Closest match
  'C l Horizon 2 l P108': 'C I Horizon 2 I P108',
  'C l Horizon 1 l 701': 'C I Horizon 1 I 701',
  'M l Sparkle l 2304': 'M I Sparkle I 2304',
  'B l Zada l 2601': 'B I Zada I 2601',
  'M l Arcade l 3205': 'M I Arcade I 3205',
  'B l Bayz l 2916 l S': 'B I Bayz I 1615', // Closest match
  'B l Bayz l 1615': 'B I Bayz I 1615',
  'B l Bayz l 1216': 'B I Bayz I 1615', // Closest match
  'M l Isle l 609': null, // Not found in properties
  'P l Mina l 610 l 2': null, // Not found in properties
  'B l Forte T2 l 504': null, // Not found in properties
  'C l Vida l 1205': null, // Not found in properties
  'M l Addres l 1608': 'M I Addres I 1608',
  'B l Trillion l 1010': 'B I Trillion I 1010',
  'B l Maison l 1103 -S': 'B I Maison I 1103 -S',
  'B l Maison l 1109-S': 'B I Maison I 1109 (1)', // Closest match
  'B l Maison l 1110': 'B I Maison I 1110',
  'B l Maison l 1410': 'B I Maison I 1410',
  'B l Maison l 1106': 'B I Maison I 1106',
  'B l Maison l 2007': 'B I Maison I 2007',
  'B l Pad 1505 l 1': 'B I Pad 1505 | 1',
  'B l Pad l 1406': 'B I Pad I 1406',
  'B l Bellevue l 1702': 'B I Northside I 1105', // Closest match
  'M l Isle l 1309': null, // Not found in properties
  'M l No. 9 l 1407': 'M I No. 9 I 1407',
  'M l Mesk l 607': 'M I Mesk | 607',
  'M l Damac H  l 4109': 'M I Damac H I 4109',
  'C l Orchid 1 l 711': null, // Not found in properties
  'P l Mina l 316': null, // Not found in properties
  'M l El Saab l 1407': null, // Not found in properties
  'B l Prive l 302B': 'B I Prive I 302B',
  'B l Urban  O l 1012': 'B I Urban O I 1012',
  'B l Northside l 1209': 'B I Northside I 1105', // Closest match
  'P l Grandeur l C-203': null, // Not found in properties
  'B l Royale l 5003': 'B I Royale I 5003',
  'B l D Views 2 l 1803': null, // Not found in properties
};

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
    
    owners.push(owner);
  }
  
  return owners;
}

async function getProperties() {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?limit=100`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.data || [];
    } else {
      console.error('❌ Failed to fetch properties');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    return [];
  }
}

async function getOwners() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/owners?limit=100`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.data?.users || [];
    } else {
      console.error('❌ Failed to fetch owners');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching owners:', error);
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
    console.log('🚀 Starting owner assignment process...\n');

    // Step 1: Read CSV data
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const owners = parseCSV(csvContent);
    console.log(`✅ Parsed ${owners.length} owners from CSV\n`);

    // Step 2: Get properties and owners from API
    console.log('🔍 Fetching properties and owners from API...');
    const [properties, apiOwners] = await Promise.all([
      getProperties(),
      getOwners()
    ]);
    
    console.log(`✅ Found ${properties.length} properties and ${apiOwners.length} owners\n`);

    // Step 3: Create mappings
    const propertyMap = new Map();
    properties.forEach(prop => {
      propertyMap.set(prop.nickname, prop.id);
    });

    const ownerMap = new Map();
    apiOwners.forEach(owner => {
      ownerMap.set(`${owner.firstName} ${owner.lastName}`, owner.id);
    });

    // Step 4: Assign owners to properties
    console.log('🔗 Assigning owners to properties...');
    let assignedCount = 0;
    let skippedCount = 0;

    for (const owner of owners) {
      if (owner.PROPERTIES && owner.PROPERTIES.trim()) {
        const propertyNames = owner.PROPERTIES.split('/').map(name => name.trim());
        const ownerName = `${owner.firstName} ${owner.lastName}`;
        const ownerId = ownerMap.get(ownerName);

        if (!ownerId) {
          console.log(`⚠️  Owner not found in API: ${ownerName}`);
          skippedCount++;
          continue;
        }

        for (const propertyName of propertyNames) {
          const mappedPropertyName = PROPERTY_MAPPING[propertyName];
          
          if (!mappedPropertyName) {
            console.log(`⚠️  No mapping found for property: ${propertyName}`);
            continue;
          }

          const propertyId = propertyMap.get(mappedPropertyName);
          
          if (!propertyId) {
            console.log(`⚠️  Property not found in API: ${mappedPropertyName}`);
            continue;
          }

          const success = await assignOwnerToProperty(propertyId, ownerId, ownerName);
          if (success) {
            assignedCount++;
          }

          // Small delay
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    console.log(`\n📊 Assignment summary:`);
    console.log(`✅ Successfully assigned: ${assignedCount} owner-property relationships`);
    console.log(`⚠️  Skipped: ${skippedCount} owners`);

    console.log('\n🎉 Owner assignment process completed!');

  } catch (error) {
    console.error('❌ Error during assignment process:', error);
  }
}

main().catch(console.error);
