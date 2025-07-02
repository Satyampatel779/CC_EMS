import axios from 'axios';

const baseURL = 'http://localhost:3000';

// Test schedule API endpoints
async function testScheduleAPI() {
  console.log('Testing Schedule API endpoints...\n');

  try {
    // Test creating a schedule
    console.log('1. Testing create schedule...');
    const createResponse = await axios.post(`${baseURL}/api/v1/schedule/create-schedule`, {
      employeeId: '674e28e3fd0a9af8c3f7b123', // Replace with actual employee ID
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '17:00',
      shift: 'morning',
      location: 'Office',
      notes: 'Test schedule'
    }, {
      headers: {
        'Authorization': 'Bearer your-hr-token-here' // Replace with actual HR token
      }
    });
    console.log('Create schedule response:', createResponse.data);

    // Test getting all schedules
    console.log('\n2. Testing get all schedules...');
    const getAllResponse = await axios.get(`${baseURL}/api/v1/schedule/all`, {
      headers: {
        'Authorization': 'Bearer your-hr-token-here' // Replace with actual HR token
      }
    });
    console.log('Get all schedules response:', getAllResponse.data);

    // Test getting schedules by employee
    console.log('\n3. Testing get schedules by employee...');
    const getByEmployeeResponse = await axios.get(`${baseURL}/api/v1/schedule/employee/674e28e3fd0a9af8c3f7b123`);
    console.log('Get schedules by employee response:', getByEmployeeResponse.data);

    console.log('\n✅ All schedule API tests passed!');

  } catch (error) {
    console.error('❌ Schedule API test failed:', error.response?.data || error.message);
  }
}

// Test corporate calendar API endpoints
async function testCalendarAPI() {
  console.log('\nTesting Corporate Calendar API endpoints...\n');

  try {
    // Test getting all events
    console.log('1. Testing get all events...');
    const getAllResponse = await axios.get(`${baseURL}/api/v1/corporate-calendar/all`);
    console.log('Get all events response:', getAllResponse.data);

    console.log('\n✅ Calendar API test passed!');

  } catch (error) {
    console.error('❌ Calendar API test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Calendar Enhancement API Tests\n');
  console.log('='.repeat(50));
  
  await testCalendarAPI();
  await testScheduleAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ All tests completed!');
}

runTests();
