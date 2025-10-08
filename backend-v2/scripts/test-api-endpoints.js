import fetch from 'node-fetch';

async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:3002/api/v2';
  
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test property endpoint
    console.log('1. Testing Property API...');
    const propertyResponse = await fetch(`${baseUrl}/properties/property-1759873196001-vuku5i44u`, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    
    if (propertyResponse.ok) {
      const propertyData = await propertyResponse.json();
      console.log('✅ Property API Response:');
      console.log(`   Property Name: ${propertyData.data?.name}`);
      console.log(`   Owner ID: ${propertyData.data?.owner?.id}`);
      console.log(`   Owner Name: ${propertyData.data?.owner?.firstName} ${propertyData.data?.owner?.lastName}`);
      console.log(`   Owner Email: ${propertyData.data?.owner?.email}\n`);
    } else {
      console.log(`❌ Property API failed: ${propertyResponse.status}\n`);
    }

    // Test users endpoint for owners
    console.log('2. Testing Owners API...');
    const ownersResponse = await fetch(`${baseUrl}/users?role=OWNER`, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    
    if (ownersResponse.ok) {
      const ownersData = await ownersResponse.json();
      console.log('✅ Owners API Response:');
      console.log(`   Found ${ownersData.data?.data?.length || 0} owners`);
      if (ownersData.data?.data?.length > 0) {
        const firstOwner = ownersData.data.data[0];
        console.log(`   First Owner: ${firstOwner.firstName} ${firstOwner.lastName}`);
        console.log(`   Email: ${firstOwner.email}`);
      }
      console.log('');
    } else {
      console.log(`❌ Owners API failed: ${ownersResponse.status}\n`);
    }

    // Test specific user endpoint
    console.log('3. Testing User by ID API...');
    const userResponse = await fetch(`${baseUrl}/users/57b45886-2c12-4e3f-9144-43ca845a81e6`, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User API Response:');
      console.log(`   User Name: ${userData.data?.firstName} ${userData.data?.lastName}`);
      console.log(`   Email: ${userData.data?.email}`);
      console.log(`   Phone: ${userData.data?.phone}`);
      console.log(`   Role: ${userData.data?.role}\n`);
    } else {
      console.log(`❌ User API failed: ${userResponse.status}\n`);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPIEndpoints();
