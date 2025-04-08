import mongoose from 'mongoose'
import { Schema } from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
    required: true,
    default: 'Present'
  },
  checkInTime: {
    type: String,
    default: null
  },
  checkOutTime: {
    type: String,
    default: null
  },
  workHours: {
    type: Number,
    default: 0
  },
  comments: {
    type: String,
    default: ''
  },
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  }
}, { timestamps: true });

// Change from CommonJS to ES Module syntax
const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;