import express from 'express';
import Schedule from '../models/Schedule.model.js';
import { VerifyhHRToken as authenticateHR, VerifyEmployeeToken as authenticateEmployee } from '../middlewares/Auth.middleware.js';

const router = express.Router();

// Get all schedules (HR only)
router.get('/all', authenticateHR, async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('employeeId', 'fname lname email')
      .sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
});

// Create a new schedule (HR only)
router.post('/create-schedule', authenticateHR, async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime, shift, location, notes } = req.body;

    // Check if schedule already exists for this employee on this date
    const existingSchedule = await Schedule.findOne({ employeeId, date });
    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Schedule already exists for this employee on this date'
      });
    }

    const newSchedule = new Schedule({
      employeeId,
      date,
      startTime,
      endTime,
      shift,
      location,
      notes,
      createdBy: req.user.id
    });

    await newSchedule.save();
    await newSchedule.populate('employeeId', 'fname lname email');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: newSchedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
});

// Update a schedule (HR only)
router.put('/update-schedule/:id', authenticateHR, async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, date, startTime, endTime, shift, location, notes } = req.body;

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { employeeId, date, startTime, endTime, shift, location, notes },
      { new: true }
    ).populate('employeeId', 'fname lname email');

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
});

// Delete a schedule (HR only)
router.delete('/delete-schedule/:id', authenticateHR, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
});

// Get schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id)
      .populate('employeeId', 'fname lname email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
});

// Get schedules by employee ID
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const schedules = await Schedule.find({ employeeId })
      .populate('employeeId', 'fname lname email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee schedules',
      error: error.message
    });
  }
});

// Get schedules by date range
router.post('/date-range', async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.body;

    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const schedules = await Schedule.find(query)
      .populate('employeeId', 'fname lname email')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules by date range',
      error: error.message
    });
  }
});

export default router;
