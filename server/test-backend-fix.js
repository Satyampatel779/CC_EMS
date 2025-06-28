import axios from 'axios';

async function testEmployeeDataEndpoint() {
  console.log('=== Testing Employee Data Endpoint ===\n');
  
  try {
    // First, login as the test employee
    console.log('1. Testing employee login...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/employee/login', {
      email: 'testemployee@example.com',
      password: 'password123'
    }, { withCredentials: true });
    
    if (loginResponse.data.success) {
      console.log('✅ Employee login successful');
      console.log('Token received:', !!loginResponse.data.token);
      
      // Test the employee data fetch endpoint
      console.log('\n2. Testing employee data fetch...');
      const token = loginResponse.data.token;
      const dataResponse = await axios.get('http://localhost:5001/api/v1/employee/by-employee', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      console.log('✅ Employee data fetch successful');
      console.log('\n=== RESPONSE STRUCTURE ANALYSIS ===');
      console.log('Response data keys:', Object.keys(dataResponse.data));
      
      if (dataResponse.data.employee) {
        console.log('✅ Employee object found in response.data.employee');
        console.log('Employee object keys:', Object.keys(dataResponse.data.employee));
        
        // Check for the key fields that should resolve the N/A issues
        const employee = dataResponse.data.employee;
        console.log('\n=== PROFILE DATA VERIFICATION ===');
        console.log('Firstname:', employee.firstname || 'N/A');
        console.log('Lastname:', employee.lastname || 'N/A');
        console.log('Email:', employee.email || 'N/A');
        console.log('Employee ID:', employee.employeeId || 'N/A');
        console.log('Position:', employee.position || 'N/A');
        console.log('Joining Date:', employee.joiningDate || 'N/A');
        console.log('Employment Type:', employee.employmentType || 'N/A');
        console.log('Manager:', employee.manager || 'N/A');
        console.log('Work Location:', employee.workLocation || 'N/A');
        console.log('Status:', employee.status || 'N/A');
        
        // Check if our backend fix resolved the structure issue
        console.log('\n=== BACKEND FIX VERIFICATION ===');
        if (dataResponse.data.employee && !dataResponse.data.data) {
          console.log('✅ Backend fix successful: Response uses employee property instead of data');
        } else if (dataResponse.data.data && !dataResponse.data.employee) {
          console.log('❌ Backend fix not applied: Still using data property');
        } else {
          console.log('⚠️ Unexpected response structure');
        }
        
      } else {
        console.log('❌ No employee object found in response');
        console.log('Full response:', JSON.stringify(dataResponse.data, null, 2));
      }
      
    } else {
      console.log('❌ Employee login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEmployeeDataEndpoint();
