// Test script for Backend V2 integration
const fetch = require('node-fetch');

const API_V2_URL = 'http://localhost:3002/api/v2';

async function testV2API() {
  console.log('🧪 Testing Backend V2 API Integration...\n');

  try {
    // Test 1: Check if API is running
    console.log('1. Testing API health...');
    const healthResponse = await fetch(`${API_V2_URL}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ API is running:', healthData);
    } else {
      console.log('❌ API health check failed:', healthResponse.status);
      return;
    }

    // Test 2: Try to login with test credentials
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${API_V2_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@roomy.com',
        password: 'admin123'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
      
      const token = loginData.data?.token;
      if (token) {
        console.log('✅ JWT token received:', token.substring(0, 20) + '...');
        
        // Test 3: Test protected endpoint
        console.log('\n3. Testing protected endpoint...');
        const profileResponse = await fetch(`${API_V2_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile endpoint works:', profileData);
        } else {
          console.log('❌ Profile endpoint failed:', profileResponse.status);
        }

        // Test 4: Test users endpoint
        console.log('\n4. Testing users endpoint...');
        const usersResponse = await fetch(`${API_V2_URL}/users?role=OWNER&page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('✅ Users endpoint works:', {
            success: usersData.success,
            count: usersData.data?.data?.length || 0,
            pagination: usersData.data?.pagination
          });
        } else {
          console.log('❌ Users endpoint failed:', usersResponse.status);
        }
      }
    } else {
      console.log('❌ Login failed:', loginResponse.status);
      const errorData = await loginResponse.json();
      console.log('Error details:', errorData);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testV2API();
