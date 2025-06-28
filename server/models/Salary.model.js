import mongoose from 'mongoose'
import { Schema } from "mongoose";

const SalarySchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    basicpay: {
        type: Number,
        required: true
    },
    bonuses: {
        type: Number,
        required: true
    },
    deductions: {
        type: Number,
        required: true
    },
    netpay: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    duedate: {
        type: Date,
        required: true,
        validate: {
            validator: (v) => v >= new Date(),
            message: "Due date must be in the future",
        }
    },
    paymentdate: {
        type: Date,
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Delayed", "Paid", "Scheduled", "Auto-Generated"],
        default: "Pending",
    },
    workHours: {
        type: Number,
        default: 0
    },
    overtimeHours: {
        type: Number,
        default: 0
    },
    hourlyRate: {
        type: Number,
        default: 17.20
    },
    paymentType: {
        type: String,
        enum: ["Manual", "Auto-calculated", "Auto-Payroll"],
        default: "Manual"
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

export const Salary = mongoose.model('Salary', SalarySchema)