import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/Attendance.model.js';
import { Employee } from './models/Employee.model.js';

dotenv.config();

async function testAttendanceSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the first employee for testing
    const testEmployee = await Employee.findOne();
    if (!testEmployee) {
      console.log('No employees found. Please create an employee first.');
      return;
    }

    console.log(`Testing with employee: ${testEmployee.firstname} ${testEmployee.lastname}`);

    // Create a test attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testAttendance = new Attendance({
      employeeId: testEmployee._id,
      date: today,
      status: 'Present',
      checkInTime: '09:00',
      checkOutTime: '17:00',
      workHours: 8,
      comments: 'Test attendance record',
      organizationID: testEmployee.organizationID
    });

    const savedAttendance = await testAttendance.save();
    console.log('✅ Attendance record created successfully:', savedAttendance._id);

    // Test fetching attendance with employee population
    const attendanceWithEmployee = await Attendance.findById(savedAttendance._id)
      .populate('employeeId', 'firstname lastname email');
    
    console.log('✅ Attendance fetched with employee data:', {
      id: attendanceWithEmployee._id,
      employee: attendanceWithEmployee.employeeId,
      status: attendanceWithEmployee.status,
      checkInTime: attendanceWithEmployee.checkInTime,
      checkOutTime: attendanceWithEmployee.checkOutTime,
      workHours: attendanceWithEmployee.workHours
    });

    // Clean up test data
    await Attendance.findByIdAndDelete(savedAttendance._id);
    console.log('✅ Test attendance record cleaned up');

    console.log('\n✅ Attendance system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testAttendanceSystem();
