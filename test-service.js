// Test PriceLab service directly
async function testPriceLabService() {
  console.log('🧪 Testing PriceLab Service...');
  
  try {
    const response = await fetch('https://api.pricelabs.co/v1/listing_prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'tVygp3mB7UbvdGjlRnrVT2m3wU4rBryzvDfQ3Mce'
      },
      body: JSON.stringify({
        listings: [
          {
            id: '67a392b7b8fa25002a065c6c',
            pms: 'guesty',
            dateFrom: '2025-10-04',
            dateTo: '2025-10-04'
          }
        ]
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Raw API response:', data);
    console.log('📊 Data type:', typeof data);
    console.log('📊 Data length:', data.length);
    console.log('📊 First item:', data[0]);
    console.log('📊 First item data:', data[0]?.data);
    console.log('📊 First item data length:', data[0]?.data?.length);
    console.log('📊 First price data:', data[0]?.data?.[0]);
    console.log('📊 Price:', data[0]?.data?.[0]?.price);

    // Test our logic
    if (data && data.length > 0 && data[0].data && data[0].data.length > 0) {
      const priceData = data[0].data[0];
      if (priceData.price) {
        console.log('✅ SUCCESS: Price found:', priceData.price, 'AED');
        return {
          success: true,
          data: { currentPrice: priceData.price }
        };
      }
    }

    console.log('❌ FAILURE: No price found');
    return {
      success: false,
      data: { currentPrice: 0 },
      error: 'No price data found in response'
    };

  } catch (error) {
    console.error('💥 ERROR:', error);
    return {
      success: false,
      data: { currentPrice: 0 },
      error: error.message
    };
  }
}

// Run the test
testPriceLabService().then(result => {
  console.log('🎯 Final result:', result);
});
