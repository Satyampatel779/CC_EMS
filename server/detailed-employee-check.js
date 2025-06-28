import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import { Department } from './models/Department.model.js';

async function detailedEmployeeCheck() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    const employee = await Employee.findOne({}).populate('department', 'name');
    if (!employee) {
      console.log('❌ No employees found');
      return;
    }
    
    console.log('\n🔍 Detailed Employee Analysis:');
    console.log('================================');
    
    const fields = [
      'firstname', 'lastname', 'email', 'contactnumber', 'role',
      'employeeId', 'position', 'joiningDate', 'employmentType', 
      'workLocation', 'status', 'dateOfBirth', 'gender', 'address',
      'manager', 'skills', 'education'
    ];
    
    fields.forEach(field => {
      const value = employee[field];
      const status = value && value !== null && value !== '' ? '✅' : '❌';
      console.log(`${status} ${field}: ${value || 'NOT SET'}`);
    });
    
    console.log('\n🏢 Department Info:');
    console.log(`Department Object: ${employee.department ? 'EXISTS' : 'NULL'}`);
    console.log(`Department Name: ${employee.department?.name || 'NOT SET'}`);
    
    console.log('\n📞 Emergency Contact:');
    const ec = employee.emergencyContact;
    console.log(`Name: ${ec?.name || 'NOT SET'}`);
    console.log(`Relationship: ${ec?.relationship || 'NOT SET'}`);
    console.log(`Phone: ${ec?.phone || 'NOT SET'}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

detailedEmployeeCheck();
