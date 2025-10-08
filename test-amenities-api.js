// Simple test script to check amenities API
const http = require('http');

function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAmenitiesAPI() {
  console.log('🧪 Testing amenities API...');
  
  // Test without token
  console.log('\n1. Testing without token:');
  try {
    const result = await makeRequest('/api/v2/amenities');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test with invalid token
  console.log('\n2. Testing with invalid token:');
  try {
    const result = await makeRequest('/api/v2/amenities', {
      'Authorization': 'Bearer invalid-token'
    });
    console.log('Status:', result.status);
    console.log('Response:', result.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAmenitiesAPI().catch(console.error);
