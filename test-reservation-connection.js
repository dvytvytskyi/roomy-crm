const axios = require('axios');

// Configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';

// Test connection between frontend and backend
async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection for Reservations...\n');

  try {
    // Test 1: Backend Health Check
    console.log('1️⃣ Testing Backend Health Check...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data);
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    console.log('💡 Make sure backend is running on port 3001');
    return;
  }

  try {
    // Test 2: CORS Configuration
    console.log('\n2️⃣ Testing CORS Configuration...');
    const corsResponse = await axios.options(`${BACKEND_URL}/api/reservations`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    console.log('✅ CORS preflight successful');
    console.log('   CORS Headers:', corsResponse.headers);
  } catch (error) {
    console.log('❌ CORS test failed:', error.message);
  }

  try {
    // Test 3: API Endpoints (without auth for now)
    console.log('\n3️⃣ Testing API Endpoints...');
    
    // Test reservations endpoint
    const reservationsResponse = await axios.get(`${BACKEND_URL}/api/reservations`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Reservations endpoint accessible');
    console.log('   Response:', reservationsResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Reservations endpoint accessible (requires auth)');
    } else {
      console.log('❌ Reservations endpoint test failed:', error.message);
    }
  }

  try {
    // Test 4: Frontend API Configuration
    console.log('\n4️⃣ Testing Frontend API Configuration...');
    
    // Check if frontend can reach backend
    const frontendTest = await axios.get(`${FRONTEND_URL}/api/health`, {
      timeout: 5000
    });
    console.log('✅ Frontend is running');
  } catch (error) {
    console.log('❌ Frontend test failed:', error.message);
    console.log('💡 Make sure frontend is running on port 3000');
  }

  console.log('\n🎯 Connection Test Summary:');
  console.log('   Backend URL:', BACKEND_URL);
  console.log('   Frontend URL:', FRONTEND_URL);
  console.log('   API Base URL:', `${BACKEND_URL}/api`);
  console.log('\n📝 Next Steps:');
  console.log('   1. Make sure both frontend and backend are running');
  console.log('   2. Check .env configuration in backend');
  console.log('   3. Test with authentication token');
  console.log('   4. Verify database connection');
}

// Run the test
testConnection().catch(console.error);
