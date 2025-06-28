import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import { Organization } from './models/Organization.model.js';

async function fixTestEmployee() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employeemanagement');
    console.log('Connected to database');
    
    // First, check if we have an organization or create one
    let organization = await Organization.findOne({ name: 'Test Organization' });
    
    if (!organization) {
      console.log('Creating test organization...');
      organization = new Organization({
        name: 'Test Organization',
        description: 'Test organization for development',
        OrganizationURL: 'test-org',
        OrganizationMail: 'test@testorg.com',
        employees: [],
        HRs: []
      });
      await organization.save();
      console.log('✅ Test organization created');
    } else {
      console.log('✅ Test organization already exists');
    }
    
    // Find and update the test employee
    const employee = await Employee.findOne({ email: 'testemployee@example.com' });
    
    if (employee) {
      // Update employee with organizationID
      employee.organizationID = organization._id;
      await employee.save();
      
      // Add employee to organization if not already there
      if (!organization.employees.includes(employee._id)) {
        organization.employees.push(employee._id);
        await organization.save();
      }
      
      console.log('✅ Test employee updated with organizationID');
      console.log('Employee ID:', employee._id);
      console.log('Organization ID:', employee.organizationID);
      console.log('Employee Email:', employee.email);
    } else {
      console.log('❌ Test employee not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing test employee:', error);
    await mongoose.disconnect();
  }
}

fixTestEmployee();
