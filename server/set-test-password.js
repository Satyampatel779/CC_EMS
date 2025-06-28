import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import bcrypt from 'bcrypt';

async function setTestPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    // Get the first employee
    const employee = await Employee.findOne({ email: 'Jyoti@gmail.com' });
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    // Set a simple test password
    const testPassword = 'test123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    
    await Employee.findByIdAndUpdate(employee._id, { password: hashedPassword });
    
    console.log('\n✅ Test password set successfully!');
    console.log('==================================');
    console.log(`Employee: ${employee.firstname} ${employee.lastname}`);
    console.log(`Email: ${employee.email}`);
    console.log(`Password: ${testPassword}`);
    console.log(`Employee ID: ${employee.employeeId}`);
    
    console.log('\n🎯 Test Instructions:');
    console.log('====================');
    console.log('1. Open http://localhost:5176 in your browser');
    console.log('2. Click on "Employee Login" or navigate to employee login page');
    console.log(`3. Enter Email: ${employee.email}`);
    console.log(`4. Enter Password: ${testPassword}`);
    console.log('5. Check that dashboard shows proper information instead of N/A values');
    console.log('6. Navigate to profile page and verify all employment details are displayed');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

setTestPassword();
