// Simple API test function
export async function testApiConnection() {
  try {
    console.log('Testing API connection...')
    
    // Test health endpoint
    const healthResponse = await fetch('http://5.223.55.121:3001/health')
    console.log('Health check:', healthResponse.status, healthResponse.statusText)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('Health data:', healthData)
    }
    
    // Test login endpoint
    const loginResponse = await fetch('http://5.223.55.121:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@roomy.com',
        password: 'test123'
      })
    })
    
    console.log('Login test:', loginResponse.status, loginResponse.statusText)
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('Login success:', loginData)
      return { success: true, data: loginData }
    } else {
      const errorData = await loginResponse.json()
      console.log('Login error:', errorData)
      return { success: false, error: errorData }
    }
    
  } catch (error) {
    console.error('API test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testApi = testApiConnection
}
