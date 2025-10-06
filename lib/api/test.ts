// Simple API test function
export async function testApiConnection() {
  try {
    // Use V2 API
    const apiUrl = process.env.NEXT_PUBLIC_API_V2_URL || 'http://localhost:3002/api/v2'
    console.log('Testing V2 API connection to:', apiUrl)
    
    // Test login endpoint with real credentials
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@roomy.com',
        password: 'admin123'
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
