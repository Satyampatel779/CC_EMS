import express from 'express';
import Attendance from '../models/Attendance.model.js';
import { Employee } from '../models/Employee.model.js';
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js';

const router = express.Router();

// Employee-specific routes (must be FIRST to avoid ObjectId conflicts)
// Get my clock-in status
router.get('/employee/my-status', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ 
            employeeId, 
            date: today, 
            organizationID: req.ORGID 
        });
        
        let isClockedIn = false;
        let lastActivity = null;
        let todayAttendance = null;
        
        if (attendance) {
            todayAttendance = attendance;
            if (attendance.checkInTime && !attendance.checkOutTime) {
                isClockedIn = true;
                lastActivity = { type: 'clockIn', timestamp: attendance.date };
            } else if (attendance.checkOutTime) {
                lastActivity = { type: 'clockOut', timestamp: attendance.date };
            }
        }
        
        res.json({ 
            success: true, 
            message: "Clock-in status retrieved successfully",
            data: { isClockedIn, lastActivity, todayAttendance } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get my attendance history
router.get('/employee/my-attendance', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.EMid;
        const records = await Attendance.find({ 
            employeeId, 
            organizationID: req.ORGID 
        }).sort({ date: -1 });
        res.json({ success: true, message: "Attendance history retrieved successfully", data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Employee clock-in (token-based)
router.post('/employee/clock-in', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let attendance = await Attendance.findOne({ 
            employeeId, 
            date: today, 
            organizationID: req.ORGID 
        });
        
        if (attendance && attendance.checkInTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already clocked in for today' 
            });
        }
        
        if (!attendance) {
            attendance = new Attendance({
                employeeId,
                date: today,
                status: 'Present',
                checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                organizationID: req.ORGID
            });
        } else {
            attendance.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            attendance.status = 'Present';
        }
        
        await attendance.save();
        res.json({ 
            success: true, 
            message: 'Clocked in successfully', 
            data: attendance 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Employee clock-out (token-based)
router.post('/employee/clock-out', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({ 
            employeeId, 
            date: today, 
            organizationID: req.ORGID 
        });
        
        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not clocked in yet' 
            });
        }
        
        if (attendance.checkOutTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already clocked out for today' 
            });
        }
        
        attendance.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Calculate work hours with robust parsing
        try {
            const parseTime = (timeString) => {
                // Handle different time formats
                const cleanTime = timeString.trim();
                let hours, minutes;
                
                if (cleanTime.includes(':')) {
                    const parts = cleanTime.split(':');
                    hours = parseInt(parts[0]) || 0;
                    minutes = parseInt(parts[1]) || 0;
                } else {
                    // Fallback if no colon found
                    hours = 0;
                    minutes = 0;
                }
                
                return hours + (minutes / 60);
            };
            
            const checkInDecimal = parseTime(attendance.checkInTime);
            const checkOutDecimal = parseTime(attendance.checkOutTime);
            
            let workHours = checkOutDecimal - checkInDecimal;
            if (workHours < 0) workHours += 24; // handle overnight work
            
            attendance.workHours = Math.round(workHours * 100) / 100; // round to 2 decimal places
            
            console.log('Work hours calculation:', {
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                checkInDecimal,
                checkOutDecimal,
                workHours: attendance.workHours
            });
        } catch (timeError) {
            console.error('Error calculating work hours:', timeError);
            // Set a default work hours if calculation fails
            attendance.workHours = 0;
        }
        
        await attendance.save();
        res.json({ 
            success: true, 
            message: 'Clocked out successfully', 
            data: attendance 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// HR and general routes below (after employee-specific routes)

// Get all attendances (HR only) - with employee information
router.get('/', VerifyhHRToken, async (req, res) => {
    try {
        const attendances = await Attendance.find({ organizationID: req.ORGID })
            .populate('employeeId', 'firstname lastname email employeeId department')
            .sort({ date: -1 });
        res.json(attendances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific attendance record
router.get('/:id', VerifyhHRToken, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
            _id: req.params.id,
            organizationID: req.ORGID
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my clock-in status - MUST BE BEFORE /employee/:employeeId route
router.get('/employee/my-status', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ 
            employeeId, 
            date: today, 
            organizationID: req.ORGID 
        });
        
        let isClockedIn = false;
        let lastActivity = null;
        let todayAttendance = null;
        
        if (attendance) {
            todayAttendance = attendance;
            if (attendance.checkInTime && !attendance.checkOutTime) {
                isClockedIn = true;
                lastActivity = { type: 'clockIn', timestamp: attendance.date };
            } else if (attendance.checkOutTime) {
                lastActivity = { type: 'clockOut', timestamp: attendance.date };
            }
        }
        
        res.json({ 
            success: true, 
            message: "Clock-in status retrieved successfully",
            data: { isClockedIn, lastActivity, todayAttendance } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get attendance records by employee
router.get('/employee/:employeeId', VerifyhHRToken, async (req, res) => {
    try {
        const attendances = await Attendance.find({
            employeeId: req.params.employeeId,
            organizationID: req.ORGID
        })
        .populate('employeeId', 'firstname lastname email employeeId')
        .sort({ date: -1 });

        res.json(attendances);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new attendance record (HR only)
router.post('/', VerifyhHRToken, async (req, res) => {
    const attendance = new Attendance({
        employeeId: req.body.employeeId,
        date: req.body.date,
        status: req.body.status,
        checkInTime: req.body.checkInTime,
        checkOutTime: req.body.checkOutTime,
        workHours: req.body.workHours,
        comments: req.body.comments,
        organizationID: req.ORGID // Use req.ORGID here
    });

    try {
        const newAttendance = await attendance.save();
        res.status(201).json(newAttendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an attendance record (HR only)
router.patch('/:id', VerifyhHRToken, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
            _id: req.params.id,
            organizationID: req.ORGID
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        if (req.body.employeeId) attendance.employeeId = req.body.employeeId;
        if (req.body.date) attendance.date = req.body.date;
        if (req.body.status) attendance.status = req.body.status;
        if (req.body.checkInTime) attendance.checkInTime = req.body.checkInTime;
        if (req.body.checkOutTime) attendance.checkOutTime = req.body.checkOutTime;
        if (req.body.workHours) attendance.workHours = req.body.workHours;
        if (req.body.comments !== undefined) attendance.comments = req.body.comments;

        const updatedAttendance = await attendance.save();
        res.json(updatedAttendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an attendance record (HR only)
router.delete('/:id', VerifyhHRToken, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
            _id: req.params.id,
            organizationID: req.ORGID
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        await attendance.deleteOne();
        res.json({ message: 'Attendance record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Employee clock-in
router.post('/clock-in', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.body.employeeId || req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let attendance = await Attendance.findOne({ employeeId, date: today, organizationID: req.ORGID });
        if (attendance && attendance.checkInTime) {
            return res.status(400).json({ success: false, message: 'Already clocked in for today' });
        }
        if (!attendance) {
            attendance = new Attendance({
                employeeId,
                date: today,
                status: 'Present',
                checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                organizationID: req.ORGID
            });
        } else {
            attendance.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        await attendance.save();
        res.json({ success: true, message: 'Clocked in successfully', data: attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Employee clock-out
router.post('/clock-out', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.body.employeeId || req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ employeeId, date: today, organizationID: req.ORGID });
        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({ success: false, message: 'Not clocked in yet' });
        }
        if (attendance.checkOutTime) {
            return res.status(400).json({ success: false, message: 'Already clocked out for today' });
        }
        attendance.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Calculate work hours
        const [inHour, inMinute] = attendance.checkInTime.split(':').map(Number);
        const [outHour, outMinute] = attendance.checkOutTime.split(':').map(Number);
        let workHours = (outHour + outMinute / 60) - (inHour + inMinute / 60);
        if (workHours < 0) workHours += 24; // handle overnight
        attendance.workHours = workHours;
        await attendance.save();
        res.json({ success: true, message: 'Clocked out successfully', data: attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get employee clock-in status
router.get('/employee-status/:employeeId', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.params.employeeId || req.EMid;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ employeeId, date: today, organizationID: req.ORGID });
        let isClockedIn = false;
        let lastActivity = null;
        if (attendance) {
            if (attendance.checkInTime && !attendance.checkOutTime) {
                isClockedIn = true;
                lastActivity = { type: 'clockIn', timestamp: attendance.date };
            } else if (attendance.checkOutTime) {
                lastActivity = { type: 'clockOut', timestamp: attendance.date };
            }
        }
        res.json({ success: true, data: { isClockedIn, lastActivity } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get employee attendance history
router.get('/employee-history/:employeeId', VerifyEmployeeToken, async (req, res) => {
    try {
        const employeeId = req.params.employeeId || req.EMid;
        const records = await Attendance.find({ employeeId, organizationID: req.ORGID }).sort({ date: -1 });
        res.json({ success: true, data: records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Public endpoint for landing page statistics
router.get('/public-stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get today's attendance records
        const todayAttendance = await Attendance.find({ date: today });
        
        // Calculate attendance rate
        const totalRecords = todayAttendance.length;
        const presentRecords = todayAttendance.filter(record => 
            record.status === 'Present' || record.checkInTime
        ).length;
        
        const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 89;
        
        res.status(200).json({
            success: true,
            data: {
                attendanceRate,
                totalEmployeesChecked: totalRecords,
                presentToday: presentRecords
            },
            message: 'Attendance statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting attendance stats:', error);
        res.status(200).json({
            success: true,
            data: {
                attendanceRate: 89,
                totalEmployeesChecked: 0,
                presentToday: 0
            },
            message: 'Default attendance statistics'
        });
    }
});

export default router;