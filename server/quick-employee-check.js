import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import { Department } from './models/Department.model.js';

async function quickEmployeeCheck() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB (employee_management_system)');
    
    const employees = await Employee.find({}).populate('department', 'name').limit(5);
    console.log(`\n📊 Found ${employees.length} employees in database`);
    
    if (employees.length === 0) {
      console.log('❌ No employees found in database!');
      
      // Check different database names just in case
      await mongoose.disconnect();
      
      console.log('\n🔍 Checking other possible database names...');
      
      const alternativeDBs = [
        'mongodb://localhost:27017/employeemanagementsystem',
        'mongodb://localhost:27017/employeemanagement',
        'mongodb://localhost:27017/test'
      ];
      
      for (const dbUri of alternativeDBs) {
        try {
          await mongoose.connect(dbUri);
          const empCount = await Employee.countDocuments();
          console.log(`  ${dbUri.split('/').pop()}: ${empCount} employees`);
          await mongoose.disconnect();
        } catch (error) {
          console.log(`  ${dbUri.split('/').pop()}: Connection failed`);
        }
      }
      
      return;
    }
    
    employees.forEach((emp, index) => {
      console.log(`\n👤 Employee ${index + 1}:`);
      console.log('  Name:', emp.firstname, emp.lastname);
      console.log('  Email:', emp.email);
      console.log('  Employee ID:', emp.employeeId || 'NOT SET');
      console.log('  Department:', emp.department?.name || 'NOT SET');
      console.log('  Position:', emp.position || 'NOT SET');
      console.log('  Status:', emp.status || 'NOT SET');
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

quickEmployeeCheck();
