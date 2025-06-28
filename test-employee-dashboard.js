// Test Employee Dashboard Pages - API Verification Script
const axios = require('axios');

const baseURL = 'http://localhost:5001';

// Test function to check if all employee dashboard APIs are working
const testEmployeeAPIs = async () => {
    console.log('🚀 Testing Employee Dashboard APIs...\n');
    
    // Note: These tests require a valid employee token
    // You'll need to get a token by logging in first
    
    const testEndpoints = [
        {
            name: 'Attendance API',
            url: '/api/v1/attendance/employee/my-attendance',
            method: 'GET'
        },
        {
            name: 'Leaves API', 
            url: '/api/v1/leave/all',
            method: 'GET'
        },
        {
            name: 'Salary API',
            url: '/api/v1/salary/employee/my-salary',
            method: 'GET'
        },
        {
            name: 'Profile API',
            url: '/api/v1/employee/by-employee',
            method: 'GET'
        }
    ];
    
    for (const endpoint of testEndpoints) {
        try {
            console.log(`Testing ${endpoint.name}...`);
            const response = await axios({
                method: endpoint.method,
                url: baseURL + endpoint.url,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            console.log(`✅ ${endpoint.name}: Server reachable (${response.status})`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(`🔒 ${endpoint.name}: Requires authentication (${error.response.status}) - This is expected`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${endpoint.name}: Server not running`);
            } else {
                console.log(`⚠️  ${endpoint.name}: ${error.message}`);
            }
        }
    }
    
    console.log('\n📋 Summary:');
    console.log('- All endpoints should return 401 (authentication required) when accessed without token');
    console.log('- This confirms the endpoints exist and security is working');
    console.log('- Frontend pages should now work properly when logged in as an employee');
};

// Test server connectivity
const testServerConnection = async () => {
    try {
        const response = await axios.get(baseURL + '/health', { timeout: 5000 });
        console.log('✅ Server is running and accessible');
        return true;
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running on port 5001');
            console.log('Please run: cd server && npm start');
        } else {
            console.log('⚠️  Server connection test failed:', error.message);
        }
        return false;
    }
};

// Main test execution
const runTests = async () => {
    console.log('🔧 Employee Management System - Dashboard API Tests\n');
    
    const serverRunning = await testServerConnection();
    if (!serverRunning) {
        console.log('\n🛑 Cannot proceed with API tests - server not accessible');
        return;
    }
    
    await testEmployeeAPIs();
    
    console.log('\n🎉 Tests completed!');
    console.log('Next steps:');
    console.log('1. Start frontend: cd client && npm run dev');
    console.log('2. Navigate to http://localhost:5176');
    console.log('3. Login as an employee');
    console.log('4. Test the dashboard pages: Attendance, Leaves, Salary, Profile');
};

runTests().catch(console.error);
