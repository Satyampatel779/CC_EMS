import express from 'express';
import employeeAuthRoutes from './EmployeeAuth.route.js';
import hrAuthRoutes from './HRAuth.route.js';
import departmentRoutes from './Department.route.js';
import employeeRoutes from './Employee.route.js';
import hrDashboardRoutes from './Dashboard.route.js';
import salaryRoutes from './Salary.route.js';
import leaveRoutes from './Leave.route.js';
import attendanceRoutes from './Attendance.route.js';
import scheduleRoutes from './Schedule.route.js';
// Import other route files as needed

const router = express.Router();

// Register routes
router.use('/api/auth/employee', employeeAuthRoutes);
router.use('/api/auth/HR', hrAuthRoutes);
router.use('/api/v1/department', departmentRoutes);
router.use('/api/v1/employee', employeeRoutes);
router.use('/api/v1/dashboard', hrDashboardRoutes);
router.use('/api/v1/salary', salaryRoutes);
router.use('/api/leave', leaveRoutes);
router.use('/api/v1/attendance', attendanceRoutes);
router.use('/api/v1/schedule', scheduleRoutes);
// Register other routes as needed

export default router;
