// Test authentication flow
import axios from 'axios';

const BASE_URL = 'http://localhost:5001';

// Configure axios for testing
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Test HR signup
async function testHRSignup() {
  console.log('\n=== Testing HR Signup ===');
  
  const testData = {
    firstname: 'Test',
    lastname: 'HR',
    email: 'testhr@example.com',
    password: 'password123',
    contactnumber: '1234567890',
    name: 'Test Organization',
    description: 'Test organization description',
    OrganizationURL: 'https://testorg.com',
    OrganizationMail: 'contact@testorg.com'
  };

  try {
    const response = await api.post('/api/auth/HR/signup', testData);
    console.log('✅ HR Signup Success:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ HR Signup Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test HR login
async function testHRLogin() {
  console.log('\n=== Testing HR Login ===');
  
  const loginData = {
    email: 'testhr@example.com',
    password: 'password123'
  };

  try {
    const response = await api.post('/api/auth/HR/login', loginData);
    console.log('✅ HR Login Success:', response.data);
    console.log('Cookies received:', response.headers['set-cookie']);
    return response.data;
  } catch (error) {
    console.log('❌ HR Login Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test HR check login
async function testHRCheckLogin() {
  console.log('\n=== Testing HR Check Login ===');
  
  try {
    const response = await api.get('/api/auth/HR/check-login');
    console.log('✅ HR Check Login Success:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ HR Check Login Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test Employee signup (requires HR token)
async function testEmployeeSignup() {
  console.log('\n=== Testing Employee Signup ===');
  
  const testData = {
    firstname: 'Test',
    lastname: 'Employee',
    email: 'testemployee@example.com',
    password: 'password123',
    contactnumber: '1234567890'
  };

  try {
    const response = await api.post('/api/auth/employee/signup', testData);
    console.log('✅ Employee Signup Success:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Employee Signup Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test Employee login
async function testEmployeeLogin() {
  console.log('\n=== Testing Employee Login ===');
  
  const loginData = {
    email: 'testemployee@example.com',
    password: 'password123'
  };

  try {
    const response = await api.post('/api/auth/employee/login', loginData);
    console.log('✅ Employee Login Success:', response.data);
    console.log('Cookies received:', response.headers['set-cookie']);
    return response.data;
  } catch (error) {
    console.log('❌ Employee Login Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===');
  
  try {
    const response = await api.get('/api/debug/db-status');
    console.log('✅ Database Status:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Database Status Failed:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Authentication Flow Tests...');
  
  // Test database connection first
  await testDatabaseConnection();
  
  // Test HR flow
  const signupResult = await testHRSignup();
  if (signupResult) {
    await testHRLogin();
    await testHRCheckLogin();
    
    // Test Employee flow (needs HR authentication)
    await testEmployeeSignup();
    await testEmployeeLogin();
  }
  
  console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
