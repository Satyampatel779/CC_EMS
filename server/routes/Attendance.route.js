import express from 'express';
import Attendance from '../models/Attendance.model.js';
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js';

const router = express.Router();

// Get all attendances (HR only)
router.get('/', VerifyhHRToken, async (req, res) => {
    try {
        const attendances = await Attendance.find({ organizationID: req.ORGID }).sort({ date: -1 });
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

// Get attendance records by employee
router.get('/employee/:employeeId', VerifyhHRToken, async (req, res) => {
    try {
        const attendances = await Attendance.find({
            employeeId: req.params.employeeId,
            organizationID: req.ORGID
        }).sort({ date: -1 });

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

export default router;