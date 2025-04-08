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

export default router;