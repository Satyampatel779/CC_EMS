import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'custom'],
    default: 'custom'
  },
  location: {
    type: String,
    default: 'Office'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HR',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ employeeId: 1, date: 1 });
scheduleSchema.index({ date: 1 });

export default mongoose.model('Schedule', scheduleSchema);
