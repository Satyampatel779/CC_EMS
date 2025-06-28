import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';

async function checkExistingEmployees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employeemanagement');
    console.log('Connected to database');
    
    const employees = await Employee.find().select('email firstname lastname');
    console.log('Existing employees:', employees.length);
    employees.forEach(emp => {
      console.log(`- ${emp.email} (${emp.firstname} ${emp.lastname})`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkExistingEmployees();
