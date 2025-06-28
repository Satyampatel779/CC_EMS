import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import { Department } from './models/Department.model.js';

async function testEmployeeLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    // Get the first employee for testing
    const employee = await Employee.findOne({ role: 'Employee' }).populate('department', 'name');
    
    if (!employee) {
      console.log('❌ No employees found');
      return;
    }
    
    console.log('\n🔍 Employee Login Test Data:');
    console.log('================================');
    console.log(`Email: ${employee.email}`);
    console.log(`Name: ${employee.firstname} ${employee.lastname}`);
    console.log(`Employee ID: ${employee.employeeId}`);
    console.log(`Position: ${employee.position}`);
    console.log(`Department: ${employee.department?.name || 'Not assigned'}`);
    console.log(`Joining Date: ${employee.joiningDate ? employee.joiningDate.toDateString() : 'Not set'}`);
    console.log(`Work Location: ${employee.workLocation}`);
    console.log(`Status: ${employee.status}`);
    console.log(`Contact: ${employee.contactnumber}`);
    
    console.log('\n📱 Dashboard Summary Data:');
    console.log('==========================');
    console.log(`Profile Completion: ${calculateProfileCompletion(employee)}%`);
    console.log(`Employment Type: ${employee.employmentType}`);
    console.log(`Gender: ${employee.gender}`);
    console.log(`Date of Birth: ${employee.dateOfBirth ? employee.dateOfBirth.toDateString() : 'Not set'}`);
    console.log(`Address: ${employee.address}`);
    
    console.log('\n🚨 Emergency Contact:');
    console.log('=====================');
    const ec = employee.emergencyContact;
    console.log(`Name: ${ec?.name || 'Not set'}`);
    console.log(`Relationship: ${ec?.relationship || 'Not set'}`);
    console.log(`Phone: ${ec?.phone || 'Not set'}`);
    
    console.log('\n💼 Skills & Education:');
    console.log('=====================');
    console.log(`Skills: ${employee.skills?.length ? employee.skills.join(', ') : 'None listed'}`);
    console.log(`Education: ${employee.education?.length ? `${employee.education[0].degree} from ${employee.education[0].institution}` : 'None listed'}`);
    
    console.log('\n✅ This employee data should now display properly in the dashboard and profile pages!');
    console.log('\nTo test login, use:');
    console.log(`Email: ${employee.email}`);
    console.log('Password: (the original password set during creation)');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

function calculateProfileCompletion(employee) {
  const requiredFields = [
    'firstname', 'lastname', 'email', 'contactnumber', 
    'employeeId', 'position', 'joiningDate', 'workLocation',
    'dateOfBirth', 'gender', 'address', 'department'
  ];
  
  let filledFields = 0;
  requiredFields.forEach(field => {
    if (employee[field] && employee[field] !== null && employee[field] !== '') {
      filledFields++;
    }
  });
  
  return Math.round((filledFields / requiredFields.length) * 100);
}

testEmployeeLogin();
