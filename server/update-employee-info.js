import mongoose from 'mongoose';
import { Employee } from './models/Employee.model.js';
import { Department } from './models/Department.model.js';

async function updateEmployeesWithEmploymentInfo() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee_management_system');
    console.log('✅ Connected to MongoDB');
    
    // First, let's check if departments exist
    const departments = await Department.find({});
    console.log(`📁 Found ${departments.length} departments`);
    
    if (departments.length > 0) {
      departments.forEach(dept => {
        console.log(`  - ${dept.name} (ID: ${dept._id})`);
      });
    }
    
    // Get all employees
    const employees = await Employee.find({});
    console.log(`\n👥 Found ${employees.length} employees to update`);
    
    // Sample employment data
    const positions = [
      'Software Developer',
      'Senior Developer', 
      'Project Manager',
      'UI/UX Designer',
      'Quality Assurance Engineer'
    ];
    
    const workLocations = [
      'Office - Floor 1',
      'Office - Floor 2', 
      'Remote',
      'Hybrid',
      'Office - Main Building'
    ];
    
    const genders = ['Male', 'Female', 'Other'];
    
    // Update each employee
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const employeeId = `EMP${(i + 1).toString().padStart(3, '0')}`;
      
      const updateData = {
        employeeId: employeeId,
        position: positions[i % positions.length],
        joiningDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        workLocation: workLocations[i % workLocations.length],
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: genders[i % genders.length],
        address: `${Math.floor(Math.random() * 999) + 1} Main Street, City ${i + 1}, State ${Math.floor(Math.random() * 50) + 1}`,
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: i % 2 === 0 ? 'Spouse' : 'Parent',
          phone: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        },
        skills: [
          i % 5 === 0 ? 'JavaScript' : i % 5 === 1 ? 'Python' : i % 5 === 2 ? 'React' : i % 5 === 3 ? 'Node.js' : 'MongoDB',
          i % 3 === 0 ? 'Project Management' : i % 3 === 1 ? 'Communication' : 'Problem Solving'
        ],
        education: [{
          degree: i % 3 === 0 ? 'Bachelor of Computer Science' : i % 3 === 1 ? 'Master of Technology' : 'Bachelor of Engineering',
          institution: `University ${i + 1}`,
          year: new Date(2015 + Math.floor(Math.random() * 8), 5, 15)
        }]
      };
      
      // Assign department if available
      if (departments.length > 0) {
        updateData.department = departments[i % departments.length]._id;
      }
      
      const updatedEmployee = await Employee.findByIdAndUpdate(
        employee._id,
        updateData,
        { new: true }
      );
      
      console.log(`✅ Updated ${updatedEmployee.firstname} ${updatedEmployee.lastname} (${employeeId})`);
    }
    
    console.log('\n🎉 All employees updated with employment information!');
    
    // Verify the updates
    console.log('\n🔍 Verification:');
    const updatedEmployees = await Employee.find({}).populate('department', 'name');
    updatedEmployees.forEach(emp => {
      console.log(`  ${emp.firstname} ${emp.lastname} - ${emp.employeeId} - ${emp.position} - ${emp.department?.name || 'No Dept'}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

updateEmployeesWithEmploymentInfo();
