import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import bcrypt from 'bcrypt';

async function checkEmployeePasswords() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    const employees = await Employee.find({ role: 'Employee' }).limit(3);
    
    console.log('\n🔑 Employee Login Credentials:');
    console.log('==============================');
    
    for (const emp of employees) {
      console.log(`\n👤 ${emp.firstname} ${emp.lastname}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Employee ID: ${emp.employeeId}`);
      console.log(`   Password Hash: ${emp.password.substring(0, 20)}...`);
      
      // Test some common passwords
      const commonPasswords = ['password', '123456', 'employee', 'test123', emp.firstname.toLowerCase()];
      
      for (const testPassword of commonPasswords) {
        const isMatch = await bcrypt.compare(testPassword, emp.password);
        if (isMatch) {
          console.log(`   ✅ Password: ${testPassword}`);
          break;
        }
      }
    }
    
    console.log('\n📋 Summary for Testing:');
    console.log('=======================');
    console.log('You can now log in to the employee dashboard using any of the above credentials.');
    console.log('The dashboard and profile pages should now show complete information instead of N/A values.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

checkEmployeePasswords();
