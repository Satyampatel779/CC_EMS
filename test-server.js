#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

// Test server to verify the real data functionality
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock employee data
const employees = [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'HR' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Marketing' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'Finance' },
    { id: 5, name: 'Tom Brown', email: 'tom@company.com', department: 'Engineering' },
    { id: 6, name: 'Lisa Davis', email: 'lisa@company.com', department: 'Design' },
    { id: 7, name: 'David Miller', email: 'david@company.com', department: 'Sales' },
    { id: 8, name: 'Amy Garcia', email: 'amy@company.com', department: 'Marketing' },
    { id: 9, name: 'Chris Taylor', email: 'chris@company.com', department: 'Engineering' },
    { id: 10, name: 'Emma Anderson', email: 'emma@company.com', department: 'HR' }
];

// Mock attendance data
const attendanceToday = [
    { employeeId: 1, status: 'Present', checkIn: '09:00', checkOut: null },
    { employeeId: 2, status: 'Present', checkIn: '08:45', checkOut: null },
    { employeeId: 3, status: 'Present', checkIn: '09:15', checkOut: null },
    { employeeId: 4, status: 'Absent', checkIn: null, checkOut: null },
    { employeeId: 5, status: 'Present', checkIn: '08:30', checkOut: null },
    { employeeId: 6, status: 'Present', checkIn: '09:00', checkOut: null },
    { employeeId: 7, status: 'Present', checkIn: '09:10', checkOut: null },
    { employeeId: 8, status: 'Present', checkIn: '08:50', checkOut: null },
    { employeeId: 9, status: 'Present', checkIn: '09:05', checkOut: null },
    { employeeId: 10, status: 'Present', checkIn: '08:55', checkOut: null }
];

// Employee endpoints
app.get('/api/v1/employee/public-all', (req, res) => {
    console.log('📊 Public employee count requested');
    res.json({
        success: true,
        count: employees.length,
        message: 'Employee count retrieved successfully'
    });
});

// Attendance endpoints
app.get('/api/v1/attendance/public-stats', (req, res) => {
    console.log('📅 Public attendance stats requested');
    
    const presentCount = attendanceToday.filter(a => a.status === 'Present').length;
    const totalCount = attendanceToday.length;
    const attendanceRate = Math.round((presentCount / totalCount) * 100);
    
    res.json({
        success: true,
        data: {
            attendanceRate,
            totalEmployeesChecked: totalCount,
            presentToday: presentCount
        },
        message: 'Attendance statistics retrieved successfully'
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Test server is running' });
});

app.listen(port, () => {
    console.log(`🚀 Test server running on http://localhost:${port}`);
    console.log(`📊 Employee count: ${employees.length}`);
    console.log(`📅 Attendance rate: ${Math.round((attendanceToday.filter(a => a.status === 'Present').length / attendanceToday.length) * 100)}%`);
    console.log(`🔗 Test endpoints:`);
    console.log(`   - GET http://localhost:${port}/api/v1/employee/public-all`);
    console.log(`   - GET http://localhost:${port}/api/v1/attendance/public-stats`);
});
