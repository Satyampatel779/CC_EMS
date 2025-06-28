// Test script for employee edit functionality
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5001';

// Test credentials (using existing test HR account)
const HR_CREDENTIALS = {
    email: 'testhr@example.com',
    password: 'password123'
};

let hrToken = null;
let testEmployeeId = null;

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (method, url, data = null) => {
    const config = {
        method,
        url: `${BASE_URL}${url}`,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Add authorization header if we have a token
    if (hrToken) {
        config.headers.Authorization = `Bearer ${hrToken}`;
    }
    
    if (data) {
        config.data = data;
    }
    
    return axios(config);
};

// Test 1: HR Login
const testHRLogin = async () => {
    console.log('\n=== Testing HR Login ===');
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/HR/login`, HR_CREDENTIALS, {
            withCredentials: true
        });
        
        if (response.data.success) {
            console.log('✅ HR Login successful');
            hrToken = response.data.token;
            return true;
        } else {
            console.log('❌ HR Login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ HR Login error:', error.response?.data?.message || error.message);
        return false;
    }
};

// Test 2: Get all employees to find one to edit
const getTestEmployee = async () => {
    console.log('\n=== Getting Test Employee ===');
    try {
        const response = await makeAuthenticatedRequest('GET', '/api/v1/employee/all');
        
        if (response.data.success && response.data.data.length > 0) {
            testEmployeeId = response.data.data[0]._id;
            console.log('✅ Found test employee:', testEmployeeId);
            console.log('Employee name:', response.data.data[0].firstname, response.data.data[0].lastname);
            return true;
        } else {
            console.log('❌ No employees found');
            return false;
        }
    } catch (error) {
        console.log('❌ Error getting employees:', error.response?.data?.message || error.message);
        return false;
    }
};

// Test 3: Test employee edit endpoint
const testEmployeeEdit = async () => {
    console.log('\n=== Testing Employee Edit ===');
    try {
        const updateData = {
            firstname: 'Updated',
            lastname: 'Employee',
            email: 'updated.employee@test.com',
            contactnumber: '1234567890',
            position: 'Updated Position',
            workLocation: 'Updated Location'
        };

        const response = await makeAuthenticatedRequest(
            'PATCH', 
            `/api/v1/employee/update-employee/${testEmployeeId}`, 
            updateData
        );
        
        if (response.data.success) {
            console.log('✅ Employee update successful');
            console.log('Updated employee:', response.data.data);
            return true;
        } else {
            console.log('❌ Employee update failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Employee update error:', error.response?.data?.message || error.message);
        console.log('Error details:', error.response?.data);
        return false;
    }
};

// Test 4: Verify the update by fetching the employee
const verifyUpdate = async () => {
    console.log('\n=== Verifying Update ===');
    try {
        const response = await makeAuthenticatedRequest('GET', `/api/v1/employee/by-HR/${testEmployeeId}`);
        
        if (response.data.success) {
            console.log('✅ Employee data retrieved successfully');
            console.log('Updated employee data:', response.data.data);
            return true;
        } else {
            console.log('❌ Failed to retrieve updated employee:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Error retrieving employee:', error.response?.data?.message || error.message);
        return false;
    }
};

// Run all tests
const runTests = async () => {
    console.log('🚀 Starting Employee Edit Functionality Tests...');
    
    const loginSuccess = await testHRLogin();
    if (!loginSuccess) {
        console.log('\n❌ Cannot proceed without HR login');
        return;
    }
    
    const employeeFound = await getTestEmployee();
    if (!employeeFound) {
        console.log('\n❌ Cannot proceed without test employee');
        return;
    }
    
    const editSuccess = await testEmployeeEdit();
    if (!editSuccess) {
        console.log('\n❌ Employee edit test failed');
        return;
    }
    
    await verifyUpdate();
    
    console.log('\n🎉 All tests completed!');
};

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    process.exit(1);
});

runTests().catch(console.error);
