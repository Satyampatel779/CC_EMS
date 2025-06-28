import axios from 'axios';

// Test the employee data endpoint structure
async function testEmployeeDataStructure() {
  console.log('=== Testing Employee Data Structure ===\n');
  
  try {
    // First, let's test HR login to get a token
    console.log('1. Testing HR Login...');
    const hrLoginResponse = await axios.post('http://localhost:5001/api/auth/HR/login', {
      email: 'testhr@example.com',
      password: 'password123'
    }, { withCredentials: true });
    
    if (hrLoginResponse.data.success) {
      console.log('✅ HR Login successful');
      
      // Create a test employee
      console.log('2. Creating test employee...');
      const employeeData = {
        firstname: 'Test',
        lastname: 'Employee',
        email: 'testemployee@example.com',
        password: 'password123',
        contactnumber: '1234567890',
        position: 'Software Developer',
        employeeId: 'EMP001',
        joiningDate: '2024-01-15',
        employmentType: 'Full-time',
        manager: 'John Manager',
        workLocation: 'Office',
        status: 'Active'
      };
      
      const createResponse = await axios.post('http://localhost:5001/api/auth/employee/signup', employeeData, {
        withCredentials: true
      });
      
      if (createResponse.data.success) {
        console.log('✅ Employee created successfully');
        
        // Now test employee login
        console.log('3. Testing employee login...');
        const empLoginResponse = await axios.post('http://localhost:5001/api/auth/employee/login', {
          email: 'testemployee@example.com',
          password: 'password123'
        }, { withCredentials: true });
        
        if (empLoginResponse.data.success) {
          console.log('✅ Employee login successful');
          
          // Test the employee data fetch endpoint
          console.log('4. Testing employee data fetch...');
          const token = empLoginResponse.data.token;
          const response = await axios.get('http://localhost:5001/api/v1/employee/by-employee', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          });
          
          console.log('✅ Employee data fetch successful');
          console.log('Response structure:', Object.keys(response.data));
          console.log('Employee object structure:', response.data.employee ? Object.keys(response.data.employee) : 'No employee object');
          console.log('Full response:', JSON.stringify(response.data, null, 2));
          
          // Verify expected fields are present
          const employee = response.data.employee;
          if (employee) {
            const expectedFields = ['firstname', 'lastname', 'email', 'employeeId', 'position', 'joiningDate'];
            const missingFields = expectedFields.filter(field => !(field in employee));
            if (missingFields.length === 0) {
              console.log('✅ All expected fields are present');
            } else {
              console.log('❌ Missing fields:', missingFields);
            }
          }
          
        } else {
          console.log('❌ Employee login failed:', empLoginResponse.data);
        }
      } else {
        console.log('❌ Employee creation failed:', createResponse.data);
      }
    } else {
      console.log('❌ HR login failed:', hrLoginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testEmployeeDataStructure();
