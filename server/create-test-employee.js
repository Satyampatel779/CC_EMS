import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import bcrypt from 'bcrypt';

async function createTestEmployee() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employeemanagement');
    console.log('Connected to database');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    // Create test employee
    const testEmployee = new Employee({
      firstname: 'Test',
      lastname: 'Employee',
      email: 'testemployee@example.com',
      password: hashedPassword,
      contactnumber: '1234567890',
      role: 'Employee',
      employeeId: 'EMP001',
      position: 'Software Developer',
      joiningDate: new Date('2024-01-15'),
      employmentType: 'Full-time',
      workLocation: 'Office',
      status: 'Active',
      organizationID: new mongoose.Types.ObjectId() // Add a dummy organization ID
    });
    
    await testEmployee.save();
    console.log('✅ Test employee created successfully');
    console.log('Employee ID:', testEmployee._id);
    console.log('Email:', testEmployee.email);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test employee:', error);
    await mongoose.disconnect();
  }
}

createTestEmployee();
