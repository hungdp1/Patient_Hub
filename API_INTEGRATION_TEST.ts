/**
 * API Integration Test Suite
 * Run this file to verify all frontend-backend API connections
 */

export interface APITestResult {
  endpoint: string;
  status: 'PASS' | 'FAIL';
  message: string;
  responseTime?: number;
}

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test results storage
const testResults: APITestResult[] = [];

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  requiresAuth = true
): Promise<APITestResult> {
  const startTime = performance.now();
  
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseTime = performance.now() - startTime;
    const isSuccess = response.ok;

    if (isSuccess) {
      return {
        endpoint,
        status: 'PASS',
        message: `${method} ${endpoint} - Status ${response.status}`,
        responseTime,
      };
    } else {
      const errorText = await response.text();
      return {
        endpoint,
        status: 'FAIL',
        message: `${method} ${endpoint} - Status ${response.status}: ${errorText}`,
        responseTime,
      };
    }
  } catch (error: any) {
    return {
      endpoint,
      status: 'FAIL',
      message: `${method} ${endpoint} - Error: ${error.message}`,
    };
  }
}

async function runTests() {
  console.log('🧪 Starting API Integration Tests...\n');

  // 1. Health Check
  console.log('1️⃣ Testing Health Endpoints...');
  let result = await testEndpoint('GET', '/health', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 2. Database Check
  result = await testEndpoint('GET', '/db-check', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 3. Authentication
  console.log('\n2️⃣ Testing Authentication Endpoints...');
  
  // Test Login
  result = await testEndpoint('POST', '/auth/login', {
    phoneNumber: '0123456789',
    password: 'password123'
  }, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // Extract token from response if login successful
  if (result.status === 'PASS') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '0123456789',
          password: 'password123'
        })
      });
      const data = await response.json();
      if (data.token) {
        authToken = data.token;
        console.log('📝 Auth token obtained for subsequent tests');
      }
    } catch (e) {
      console.log('⚠️ Could not extract auth token');
    }
  }

  // 4. User Endpoints
  console.log('\n3️⃣ Testing User Endpoints...');
  result = await testEndpoint('GET', '/user/profile');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/user/dashboard');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 5. Public Library Endpoints
  console.log('\n4️⃣ Testing Library Endpoints (Public)...');
  result = await testEndpoint('GET', '/data/library/diseases', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/library/drugs', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/library/procedures', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/library/lab-tests', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 6. Services & Articles
  console.log('\n5️⃣ Testing Services & Articles (Public)...');
  result = await testEndpoint('GET', '/data/services', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/articles', undefined, false);
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 7. Data Endpoints (Protected)
  console.log('\n6️⃣ Testing Data Endpoints (Protected)...');
  
  result = await testEndpoint('GET', '/data/appointments');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/lab-results');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/medical-records');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/prescriptions');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/payments');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/credit-cards');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/notifications');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 8. Admin Endpoints
  console.log('\n7️⃣ Testing Admin Endpoints...');
  result = await testEndpoint('GET', '/data/admin/users');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/admin/shifts');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('GET', '/data/admin/history');
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 9. AI Endpoints
  console.log('\n8️⃣ Testing AI Endpoints...');
  result = await testEndpoint('POST', '/ai/chat', { message: 'Hello' });
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  result = await testEndpoint('POST', '/ai/diagnosis/predict', {
    symptoms: ['fever', 'cough']
  });
  testResults.push(result);
  console.log(result.status === 'PASS' ? '✅' : '❌', result.message);

  // 10. Summary
  console.log('\n' + '='.repeat(60));
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  const avgResponseTime = testResults
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length;

  console.log(`📊 Test Results Summary:`);
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📍 Total: ${testResults.length}`);
  console.log(`   ⏱️  Average Response Time: ${avgResponseTime?.toFixed(2)}ms`);
  console.log('='.repeat(60));

  if (failCount === 0) {
    console.log('\n🎉 All tests passed! API integration is complete.\n');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.\n');
    console.log('Failed endpoints:');
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.endpoint}: ${r.message}`);
      });
  }

  return {
    passed: passCount,
    failed: failCount,
    total: testResults.length,
    results: testResults
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().then(results => {
    console.log('\nTest execution completed.');
    process.exit(results.failed > 0 ? 1 : 0);
  });
}

export { runTests, testResults };
