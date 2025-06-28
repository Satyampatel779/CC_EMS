import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 10000,
  withCredentials: true
});

// Test Employee login and data fetching
async function testEmployeeFunctionality() {
  console.log('=== Testing Employee Functionality ===\n');
  
  try {
    // Step 1: Test Employee Login
    console.log('1. Testing Employee Login...');
    const loginResponse = await api.post('/api/auth/employee/login', {
      email: 'testemployee@example.com',
      password: 'password123'
    });
    
    console.log('✅ Employee Login Success');
    console.log('Response:', loginResponse.data);
    
    // Extract token if it exists in cookies or response
    const token = loginResponse.data.token;
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token set for subsequent requests');
    }
    
    // Step 2: Test Employee Data Fetch (the fixed endpoint)
    console.log('\n2. Testing Employee Data Fetch...');
    const employeeResponse = await api.get('/api/v1/employee/employee');
    
    console.log('✅ Employee Data Fetch Success');
    console.log('Response structure:', Object.keys(employeeResponse.data));
    console.log('Employee data:', employeeResponse.data);
    
    // Step 3: Test Clock In
    console.log('\n3. Testing Clock In...');
    const clockInResponse = await api.post('/api/v1/attendance/clock-in');
    
    console.log('✅ Clock In Success');
    console.log('Clock In Response:', clockInResponse.data);
    
    // Step 4: Test Clock Out (wait a few seconds)
    console.log('\n4. Testing Clock Out...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const clockOutResponse = await api.post('/api/v1/attendance/clock-out');
    
    console.log('✅ Clock Out Success');
    console.log('Clock Out Response:', clockOutResponse.data);
    
    // Step 5: Test Attendance History
    console.log('\n5. Testing Attendance History...');
    const attendanceResponse = await api.get('/api/v1/attendance/my-attendance');
    
    console.log('✅ Attendance History Success');
    console.log('Attendance Data:', attendanceResponse.data);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testEmployeeFunctionality();
