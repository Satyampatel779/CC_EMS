// Test Request Management System
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

let hrAuth = null;
let employeeAuth = null;
let testEmployeeId = null;
let testRequestId = null;

// Test HR Login
async function loginAsHR() {
  console.log('\n=== Testing HR Login ===');
  
  const loginData = {
    email: 'testhr@example.com',
    password: 'password123'
  };

  try {
    const response = await api.post('/api/auth/HR/login', loginData);
    console.log('✅ HR Login Success:', response.data?.hr?.firstname);
    hrAuth = response.data;
    return true;
  } catch (error) {
    console.log('❌ HR Login Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test Employee Login
async function loginAsEmployee() {
  console.log('\n=== Testing Employee Login ===');
  
  const loginData = {
    email: 'testemployee@example.com',
    password: 'password123'
  };

  try {
    const response = await api.post('/api/auth/employee/login', loginData);
    console.log('✅ Employee Login Success:', response.data?.employee?.firstname);
    employeeAuth = response.data;
    testEmployeeId = response.data?.employee?._id;
    return true;
  } catch (error) {
    console.log('❌ Employee Login Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Create test employee if needed
async function createTestEmployee() {
  console.log('\n=== Creating Test Employee ===');
  
  const employeeData = {
    firstname: 'Test',
    lastname: 'Employee',
    email: 'testemployee@example.com',
    password: 'password123',
    contactnumber: '9876543210',
    employeeid: 'EMP001',
    position: 'Software Developer',
    department: 'IT'
  };

  try {
    const response = await api.post('/api/auth/employee/signup', employeeData);
    console.log('✅ Employee Created:', response.data?.employee?.firstname);
    testEmployeeId = response.data?.employee?._id;
    return true;
  } catch (error) {
    console.log('❌ Employee Creation Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 1: Employee creates a request
async function testEmployeeCreateRequest() {
  console.log('\n=== Testing Employee Create Request ===');
  
  if (!employeeAuth || !testEmployeeId) {
    console.log('❌ Employee not authenticated');
    return false;
  }

  const requestData = {
    requesttitle: 'Test IT Support Request',
    requestconent: 'Need help with laptop configuration and software installation.',
    employeeID: testEmployeeId,
    priority: 'High',
    requestType: 'IT Support'
  };

  try {
    const response = await api.post('/api/v1/generate-request/create-request', requestData);
    console.log('✅ Employee Request Created:', response.data?.newRequest?.requesttitle);
    testRequestId = response.data?.newRequest?._id;
    return true;
  } catch (error) {
    console.log('❌ Employee Request Creation Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: HR creates a request on behalf of employee
async function testHRCreateRequest() {
  console.log('\n=== Testing HR Create Request for Employee ===');
  
  if (!hrAuth || !testEmployeeId) {
    console.log('❌ HR not authenticated or no employee ID');
    return false;
  }

  const requestData = {
    requesttitle: 'HR Created Request - Facilities',
    requestconent: 'Office space allocation for new team member.',
    employeeID: testEmployeeId,
    priority: 'Medium',
    requestType: 'Facilities'
  };

  try {
    const response = await api.post('/api/v1/generate-request/create-request-by-hr', requestData);
    console.log('✅ HR Request Created:', response.data?.newRequest?.requesttitle);
    return true;
  } catch (error) {
    console.log('❌ HR Request Creation Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 3: HR fetches all requests
async function testHRGetAllRequests() {
  console.log('\n=== Testing HR Get All Requests ===');
  
  if (!hrAuth) {
    console.log('❌ HR not authenticated');
    return false;
  }

  try {
    const response = await api.get('/api/v1/generate-request/all');
    console.log('✅ HR Fetched Requests:', response.data?.requests?.length, 'requests found');
    return true;
  } catch (error) {
    console.log('❌ HR Get All Requests Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 4: Employee fetches their requests
async function testEmployeeGetRequests() {
  console.log('\n=== Testing Employee Get Own Requests ===');
  
  if (!employeeAuth || !testEmployeeId) {
    console.log('❌ Employee not authenticated');
    return false;
  }

  try {
    const response = await api.get(`/api/v1/generate-request/employee/${testEmployeeId}`);
    console.log('✅ Employee Fetched Requests:', response.data?.requests?.length, 'requests found');
    return true;
  } catch (error) {
    console.log('❌ Employee Get Requests Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: HR updates request status
async function testHRUpdateRequestStatus() {
  console.log('\n=== Testing HR Update Request Status ===');
  
  if (!hrAuth || !testRequestId) {
    console.log('❌ HR not authenticated or no test request');
    return false;
  }

  const updateData = {
    id: testRequestId,
    status: 'In Review',
    hrComments: 'Request received and under review by IT team.',
    approvedby: hrAuth.hr._id
  };

  try {
    const response = await api.patch('/api/v1/generate-request/update-request-status', updateData);
    console.log('✅ HR Updated Request Status:', response.data?.message);
    return true;
  } catch (error) {
    console.log('❌ HR Update Status Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: HR updates request priority
async function testHRUpdateRequestPriority() {
  console.log('\n=== Testing HR Update Request Priority ===');
  
  if (!hrAuth || !testRequestId) {
    console.log('❌ HR not authenticated or no test request');
    return false;
  }

  const updateData = {
    requestID: testRequestId,
    priority: 'Low'
  };

  try {
    const response = await api.patch('/api/v1/generate-request/update-priority', updateData);
    console.log('✅ HR Updated Request Priority:', response.data?.message);
    return true;
  } catch (error) {
    console.log('❌ HR Update Priority Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 7: HR closes request
async function testHRCloseRequest() {
  console.log('\n=== Testing HR Close Request ===');
  
  if (!hrAuth || !testRequestId) {
    console.log('❌ HR not authenticated or no test request');
    return false;
  }

  const closeData = {
    requestID: testRequestId,
    hrComments: 'Request completed successfully. Laptop configured and software installed.',
    closedBy: hrAuth.hr._id
  };

  try {
    const response = await api.patch('/api/v1/generate-request/close-request', closeData);
    console.log('✅ HR Closed Request:', response.data?.message);
    return true;
  } catch (error) {
    console.log('❌ HR Close Request Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test 8: Employee updates request content (should only work for pending requests)
async function testEmployeeUpdateRequest() {
  console.log('\n=== Testing Employee Update Request Content ===');
  
  if (!employeeAuth || !testRequestId) {
    console.log('❌ Employee not authenticated or no test request');
    return false;
  }

  const updateData = {
    requestID: testRequestId,
    requesttitle: 'Updated Test IT Support Request',
    requestconent: 'Updated: Need help with laptop configuration, software installation, and VPN setup.',
    priority: 'Medium',
    requestType: 'IT Support'
  };

  try {
    const response = await api.patch('/api/v1/generate-request/update-request-content', updateData);
    console.log('✅ Employee Updated Request:', response.data?.message);
    return true;
  } catch (error) {
    console.log('❌ Employee Update Failed:', error.response?.data?.message || error.message);
    console.log('Note: This might fail if request is not in pending status');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Request Management System Tests\n');
  
  // Authentication tests
  console.log('='.repeat(50));
  console.log('AUTHENTICATION TESTS');
  console.log('='.repeat(50));
  
  await loginAsHR();
  await loginAsEmployee();
  
  // If employee login failed, try creating one
  if (!employeeAuth) {
    await createTestEmployee();
    await loginAsEmployee();
  }
  
  // Request management tests
  console.log('\n' + '='.repeat(50));
  console.log('REQUEST MANAGEMENT TESTS');
  console.log('='.repeat(50));
  
  await testEmployeeCreateRequest();
  await testHRCreateRequest();
  await testHRGetAllRequests();
  await testEmployeeGetRequests();
  await testHRUpdateRequestStatus();
  await testHRUpdateRequestPriority();
  await testEmployeeUpdateRequest(); // Test before closing
  await testHRCloseRequest();
  
  console.log('\n' + '='.repeat(50));
  console.log('TESTS COMPLETED');
  console.log('='.repeat(50));
  console.log('✅ All tests have been executed. Check the output above for results.');
}

// Run tests
runAllTests().catch(console.error);
