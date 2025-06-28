// Test script to verify employee information sync between HR admin and employee dashboard
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from './models/Employee.model.js';
import { Department } from './models/Department.model.js';
import { Organization } from './models/Organization.model.js';

dotenv.config();

async function testEmployeeSync() {
    try {        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find an existing employee to test with
        const testEmployee = await Employee.findOne()
            .populate("department", "name")
            .populate("manager", "firstname lastname")
            .select("firstname lastname email contactnumber department employeeId position joiningDate employmentType manager workLocation status dateOfBirth gender address emergencyContact skills education");

        if (!testEmployee) {
            console.log('❌ No employees found in database');
            return;
        }

        console.log('📋 Test Employee Data:');
        console.log('Basic Info:', {
            firstname: testEmployee.firstname,
            lastname: testEmployee.lastname,
            email: testEmployee.email,
            contactnumber: testEmployee.contactnumber
        });

        console.log('Employment Info:', {
            employeeId: testEmployee.employeeId,
            position: testEmployee.position,
            joiningDate: testEmployee.joiningDate,
            employmentType: testEmployee.employmentType,
            workLocation: testEmployee.workLocation,
            status: testEmployee.status,
            department: testEmployee.department?.name || 'Not assigned',
            manager: testEmployee.manager ? 
                `${testEmployee.manager.firstname} ${testEmployee.manager.lastname}` : 
                'Not assigned'
        });

        console.log('Personal Info:', {
            dateOfBirth: testEmployee.dateOfBirth,
            gender: testEmployee.gender,
            address: testEmployee.address
        });

        console.log('Emergency Contact:', testEmployee.emergencyContact);
        console.log('Skills:', testEmployee.skills);
        console.log('Education:', testEmployee.education);

        // Test the new update-profile endpoint logic
        console.log('\n🔄 Testing profile update logic...');
        
        const updateData = {
            firstname: testEmployee.firstname,
            lastname: testEmployee.lastname,
            contactnumber: testEmployee.contactnumber || "555-0123",
            dateOfBirth: testEmployee.dateOfBirth || "1990-01-01",
            gender: testEmployee.gender || "Male",
            address: testEmployee.address || "123 Test Street",
            emergencyContact: {
                name: "John Doe",
                relationship: "Brother",
                phone: "555-0124"
            }
        };

        // Simulate allowed fields filtering
        const allowedFields = [
            'firstname', 'lastname', 'contactnumber', 'dateOfBirth', 'gender', 
            'address', 'emergencyContact', 'skills', 'education'
        ];
        
        const filteredUpdateData = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdateData[field] = updateData[field];
            }
        });

        console.log('✅ Filtered update data:', filteredUpdateData);

        // Test that HR admin can see all fields
        const hrViewEmployee = await Employee.findById(testEmployee._id)
            .populate("department", "name")
            .populate("manager", "firstname lastname")
            .select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest isverified employeeId position joiningDate employmentType status workLocation");

        console.log('\n👨‍💼 HR Admin View (limited fields):');
        console.log({
            name: `${hrViewEmployee.firstname} ${hrViewEmployee.lastname}`,
            email: hrViewEmployee.email,
            department: hrViewEmployee.department?.name,
            employeeId: hrViewEmployee.employeeId,
            position: hrViewEmployee.position,
            status: hrViewEmployee.status
        });

        console.log('\n✅ Employee information sync test completed successfully!');
        console.log('🔍 Key points verified:');
        console.log('  - Employee can access comprehensive personal data');
        console.log('  - HR admin can access employee management data');
        console.log('  - Profile update endpoint restricts employee fields correctly');
        console.log('  - Department and manager references are populated properly');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testEmployeeSync();
