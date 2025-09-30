const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'your-jwt-token-here'; // Replace with actual token

// Test data
const testReservation = {
  propertyId: 'test-property-id',
  guestId: 'test-guest-id',
  checkIn: '2024-02-01T00:00:00.000Z',
  checkOut: '2024-02-05T00:00:00.000Z',
  guestCount: 2,
  status: 'PENDING',
  paymentStatus: 'UNPAID',
  guestStatus: 'UPCOMING',
  source: 'DIRECT',
  specialRequests: 'Test reservation for API testing'
};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testGetReservations = async () => {
  console.log('🧪 Testing GET /api/reservations...');
  const result = await apiRequest('GET', '/reservations');
  if (result) {
    console.log('✅ GET /api/reservations successful');
    console.log(`   Found ${result.data?.length || 0} reservations`);
  }
};

const testGetReservationStats = async () => {
  console.log('🧪 Testing GET /api/reservations/stats...');
  const result = await apiRequest('GET', '/reservations/stats');
  if (result) {
    console.log('✅ GET /api/reservations/stats successful');
    console.log(`   Total reservations: ${result.data?.totalReservations || 0}`);
  }
};

const testGetReservationSources = async () => {
  console.log('🧪 Testing GET /api/reservations/sources...');
  const result = await apiRequest('GET', '/reservations/sources');
  if (result) {
    console.log('✅ GET /api/reservations/sources successful');
    console.log(`   Found ${result.data?.length || 0} sources`);
  }
};

const testGetAvailableProperties = async () => {
  console.log('🧪 Testing GET /api/reservations/available-properties...');
  const result = await apiRequest('GET', '/reservations/available-properties');
  if (result) {
    console.log('✅ GET /api/reservations/available-properties successful');
    console.log(`   Found ${result.data?.length || 0} available properties`);
  }
};

const testGetReservationCalendar = async () => {
  console.log('🧪 Testing GET /api/reservations/calendar...');
  const result = await apiRequest('GET', '/reservations/calendar');
  if (result) {
    console.log('✅ GET /api/reservations/calendar successful');
    console.log(`   Found ${result.data?.length || 0} calendar events`);
  }
};

const testCreateReservation = async () => {
  console.log('🧪 Testing POST /api/reservations...');
  const result = await apiRequest('POST', '/reservations', testReservation);
  if (result) {
    console.log('✅ POST /api/reservations successful');
    console.log(`   Created reservation: ${result.data?.id}`);
    return result.data?.id;
  }
  return null;
};

const testGetReservationById = async (reservationId) => {
  if (!reservationId) return;
  
  console.log(`🧪 Testing GET /api/reservations/${reservationId}...`);
  const result = await apiRequest('GET', `/reservations/${reservationId}`);
  if (result) {
    console.log('✅ GET /api/reservations/:id successful');
    console.log(`   Reservation status: ${result.data?.status}`);
  }
};

const testUpdateReservation = async (reservationId) => {
  if (!reservationId) return;
  
  console.log(`🧪 Testing PUT /api/reservations/${reservationId}...`);
  const updateData = {
    specialRequests: 'Updated test reservation',
    guestCount: 3
  };
  const result = await apiRequest('PUT', `/reservations/${reservationId}`, updateData);
  if (result) {
    console.log('✅ PUT /api/reservations/:id successful');
    console.log(`   Updated guest count: ${result.data?.guestCount}`);
  }
};

const testUpdateReservationStatus = async (reservationId) => {
  if (!reservationId) return;
  
  console.log(`🧪 Testing PUT /api/reservations/${reservationId}/status...`);
  const statusData = {
    status: 'CONFIRMED',
    paymentStatus: 'PARTIALLY_PAID'
  };
  const result = await apiRequest('PUT', `/reservations/${reservationId}/status`, statusData);
  if (result) {
    console.log('✅ PUT /api/reservations/:id/status successful');
    console.log(`   New status: ${result.data?.status}`);
  }
};

const testDeleteReservation = async (reservationId) => {
  if (!reservationId) return;
  
  console.log(`🧪 Testing DELETE /api/reservations/${reservationId}...`);
  const result = await apiRequest('DELETE', `/reservations/${reservationId}`);
  if (result) {
    console.log('✅ DELETE /api/reservations/:id successful');
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Reservation API Tests...\n');
  
  // Test read operations
  await testGetReservations();
  await testGetReservationStats();
  await testGetReservationSources();
  await testGetAvailableProperties();
  await testGetReservationCalendar();
  
  console.log('\n📝 Testing CRUD operations...\n');
  
  // Test create operation
  const reservationId = await testCreateReservation();
  
  if (reservationId) {
    // Test read by ID
    await testGetReservationById(reservationId);
    
    // Test update operations
    await testUpdateReservation(reservationId);
    await testUpdateReservationStatus(reservationId);
    
    // Test delete operation
    await testDeleteReservation(reservationId);
  }
  
  console.log('\n✨ All tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testGetReservations,
  testCreateReservation,
  testUpdateReservation,
  testDeleteReservation
};
