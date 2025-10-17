// Test script for JWT Bearer Token Authentication
// Run this with: node test-auth.js (requires node-fetch or use fetch in Node 18+)

const BASE_URL = 'http://localhost:4004';

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  confirmPassword: 'password123'
};

let accessToken = '';
let refreshToken = '';

// Helper function for making requests
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return { ok: false, error: error.message };
  }
}

// Test 1: Register a new user
async function testRegister() {
  console.log('\n📝 Test 1: Register User');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });

  if (result.ok) {
    console.log('✅ Registration successful');
    console.log('   User:', result.data.user?.email);
    console.log('   Access Token:', result.data.accessToken?.substring(0, 30) + '...');
    console.log('   Refresh Token:', result.data.refreshToken?.substring(0, 30) + '...');
    
    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;
    return true;
  } else {
    console.log('❌ Registration failed:', result.data.message);
    return false;
  }
}

// Test 2: Access protected route with Bearer token
async function testProtectedRoute() {
  console.log('\n🔒 Test 2: Access Protected Route');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/user', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (result.ok) {
    console.log('✅ Protected route access successful');
    console.log('   User data retrieved:', result.data.email);
    return true;
  } else {
    console.log('❌ Protected route access failed:', result.data.message);
    return false;
  }
}

// Test 3: Access protected route without token
async function testProtectedRouteNoToken() {
  console.log('\n🚫 Test 3: Access Protected Route (No Token)');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/user', {
    method: 'GET',
  });

  if (!result.ok && result.status === 401) {
    console.log('✅ Correctly rejected unauthorized request');
    console.log('   Error:', result.data.message);
    return true;
  } else {
    console.log('❌ Should have rejected unauthorized request');
    return false;
  }
}

// Test 4: Refresh access token
async function testRefreshToken() {
  console.log('\n🔄 Test 4: Refresh Access Token');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  if (result.ok) {
    console.log('✅ Token refresh successful');
    console.log('   New Access Token:', result.data.accessToken?.substring(0, 30) + '...');
    console.log('   New Refresh Token:', result.data.refreshToken?.substring(0, 30) + '...');
    
    // Update tokens
    accessToken = result.data.accessToken;
    if (result.data.refreshToken) {
      refreshToken = result.data.refreshToken;
    }
    return true;
  } else {
    console.log('❌ Token refresh failed:', result.data.message);
    return false;
  }
}

// Test 5: Login with existing user
async function testLogin() {
  console.log('\n🔑 Test 5: Login with Credentials');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  if (result.ok) {
    console.log('✅ Login successful');
    console.log('   Access Token:', result.data.accessToken?.substring(0, 30) + '...');
    console.log('   Refresh Token:', result.data.refreshToken?.substring(0, 30) + '...');
    
    accessToken = result.data.accessToken;
    refreshToken = result.data.refreshToken;
    return true;
  } else {
    console.log('❌ Login failed:', result.data.message);
    return false;
  }
}

// Test 6: Logout
async function testLogout() {
  console.log('\n👋 Test 6: Logout');
  console.log('='.repeat(50));
  
  const result = await makeRequest('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (result.ok) {
    console.log('✅ Logout successful');
    console.log('   Message:', result.data.message);
    return true;
  } else {
    console.log('❌ Logout failed:', result.data.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 JWT Bearer Token Authentication Tests');
  console.log('='.repeat(50));
  console.log(`Testing against: ${BASE_URL}`);
  
  const results = {
    register: false,
    protectedRoute: false,
    protectedRouteNoToken: false,
    refreshToken: false,
    login: false,
    logout: false,
  };

  try {
    // Test sequence
    results.register = await testRegister();
    if (results.register) {
      results.protectedRoute = await testProtectedRoute();
      results.protectedRouteNoToken = await testProtectedRouteNoToken();
      results.refreshToken = await testRefreshToken();
      results.login = await testLogin();
      results.logout = await testLogout();
    }

    // Summary
    console.log('\n📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Register:                 ${results.register ? '✅' : '❌'}`);
    console.log(`Protected Route (Auth):   ${results.protectedRoute ? '✅' : '❌'}`);
    console.log(`Protected Route (No Auth):${results.protectedRouteNoToken ? '✅' : '❌'}`);
    console.log(`Refresh Token:            ${results.refreshToken ? '✅' : '❌'}`);
    console.log(`Login:                    ${results.login ? '✅' : '❌'}`);
    console.log(`Logout:                   ${results.logout ? '✅' : '❌'}`);
    
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.values(results).length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! JWT migration successful! 🎉\n');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: npm run dev');
    console.log('   Error:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
})();
