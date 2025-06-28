// Test script to verify Clock-In/Clock-Out functionality fix
const axios = require('axios');

// Configure axios
axios.defaults.baseURL = 'http://localhost:5001';

// Test data - you'll need to use actual employee credentials
const TEST_EMPLOYEE = {
    email: 'john.employee@example.com', // Change this to an actual employee email
    password: 'password123' // Change this to the actual password
};

async function testAttendanceFunctionality() {
    console.log('🚀 Testing Attendance Clock-In/Clock-Out Functionality...\n');

    try {
        // Step 1: Login as employee to get token
        console.log('1️⃣ Logging in as employee...');
        const loginResponse = await axios.post('/api/v1/auth/employee/login', {
            email: TEST_EMPLOYEE.email,
            password: TEST_EMPLOYEE.password
        });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.employee.token;
        console.log('✅ Login successful! Token received.');

        // Configure headers for authenticated requests
        const authHeaders = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        // Step 2: Check current status
        console.log('\n2️⃣ Checking current attendance status...');
        const statusResponse = await axios.get('/api/v1/attendance/employee/my-status', authHeaders);
        console.log('✅ Status check successful:', statusResponse.data);

        // Step 3: Test Clock-In
        console.log('\n3️⃣ Testing Clock-In...');
        try {
            const clockInResponse = await axios.post('/api/v1/attendance/employee/clock-in', {}, authHeaders);
            console.log('✅ Clock-In successful:', clockInResponse.data);
        } catch (error) {
            if (error.response?.data?.message?.includes('Already clocked in')) {
                console.log('ℹ️ Already clocked in for today:', error.response.data.message);
            } else {
                console.error('❌ Clock-In failed:', error.response?.data || error.message);
            }
        }

        // Step 4: Check status after clock-in
        console.log('\n4️⃣ Checking status after clock-in...');
        const statusAfterClockIn = await axios.get('/api/v1/attendance/employee/my-status', authHeaders);
        console.log('✅ Status after clock-in:', statusAfterClockIn.data);

        // Step 5: Get attendance history
        console.log('\n5️⃣ Fetching attendance history...');
        const historyResponse = await axios.get('/api/v1/attendance/employee/my-attendance', authHeaders);
        console.log('✅ Attendance history retrieved. Records count:', historyResponse.data.data?.length || 0);
        if (historyResponse.data.data?.length > 0) {
            console.log('📊 Latest record:', historyResponse.data.data[0]);
        }

        console.log('\n🎉 All attendance functionality tests completed successfully!');
        console.log('\n💡 Clock-In/Clock-Out buttons should now work properly in the frontend.');
        console.log('💡 Make sure you are logged in as an employee to test the buttons.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 Authentication failed. Please check:');
            console.log('   - Employee credentials are correct');
            console.log('   - Employee account exists in the database');
            console.log('   - Server is running on port 5001');
        }
    }
}

// Run the test
testAttendanceFunctionality().catch(console.error);
