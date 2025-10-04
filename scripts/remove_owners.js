const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const AUTH_TOKEN = 'test';

// Property to keep owner (A I Westwood | 616)
const KEEP_OWNER_PROPERTY_ID = 'prop_1';

// All other property IDs that should have owners removed
const PROPERTIES_TO_UPDATE = [
  'prop_2', 'prop_3', 'prop_4', 'prop_6', 'prop_7', 'prop_8', 'prop_9', 'prop_10',
  'prop_11', 'prop_12', 'prop_13', 'prop_14', 'prop_15', 'prop_16', 'prop_17', 'prop_18',
  'prop_19', 'prop_20', 'prop_21', 'prop_22', 'prop_23', 'prop_24', 'prop_25', 'prop_26',
  'prop_27', 'prop_28', 'prop_29', 'prop_30', 'prop_32', 'prop_33', 'prop_34', 'prop_35',
  'prop_36', 'prop_37', 'prop_38', 'prop_39', 'prop_40', 'prop_41', 'prop_42', 'prop_43',
  'prop_44', 'prop_45', 'prop_46', 'prop_47', 'prop_48', 'prop_49', 'prop_50', 'prop_51',
  'prop_52'
];

async function updateProperty(propertyId) {
  try {
    console.log(`Updating property ${propertyId}...`);
    
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
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

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Successfully updated property ${propertyId}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to update property ${propertyId}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating property ${propertyId}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting to remove owners from properties...');
  console.log(`📌 Keeping owner only for property: ${KEEP_OWNER_PROPERTY_ID}`);
  console.log(`🗑️  Removing owners from ${PROPERTIES_TO_UPDATE.length} other properties\n`);

  let successCount = 0;
  let failCount = 0;

  for (const propertyId of PROPERTIES_TO_UPDATE) {
    const success = await updateProperty(propertyId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully updated: ${successCount} properties`);
  console.log(`❌ Failed to update: ${failCount} properties`);
  console.log(`📌 Property ${KEEP_OWNER_PROPERTY_ID} kept its owner`);
}

main().catch(console.error);
