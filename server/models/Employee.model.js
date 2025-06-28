import mongoose from 'mongoose'
import { Schema } from "mongoose";

const EmployeeSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address format, please enter a valid email address',
        }
    },
    password: {
        type: String,
        required: true,
    },
    contactnumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["HR-Admin", "Employee"],
        required: true,
    },
    // Personal Information Fields
    dateOfBirth: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: null
    },
    address: {
        type: String,
        default: null
    },
    // Employment Information Fields
    employeeId: {
        type: String,
        unique: true,
        sparse: true // Allows null values while maintaining uniqueness
    },
    position: {
        type: String,
        default: null
    },
    joiningDate: {
        type: Date,
        default: null
    },
    employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Intern"],
        default: "Full-time"
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    },
    workLocation: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "On Leave", "Terminated"],
        default: "Active"
    },
    // Additional fields for better profile management
    emergencyContact: {
        name: {
            type: String,
            default: null
        },
        relationship: {
            type: String,
            default: null
        },
        phone: {
            type: String,
            default: null
        }
    },
    skills: [{
        type: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: Date
    }],
    lastlogin: {
        type: Date,
        default: Date.now
    },
    isverified: {
        type: Boolean,
        default: false
    },
    verificationtoken: {
        type: String
    },
    verificationtokenexpires: {
        type: Date
    },
    resetpasswordtoken: {
        type: String
    },
    resetpasswordexpires: {
        type: Date
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    attendance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance"
    },
    notice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notice"
        }
    ],
    salary: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salary"
        }
    ],
    leaverequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Leave"
        }
    ],
    generaterequest: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GenerateRequest"
        }
    ],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    },
    profilePicture: {
        type: String, // URL or path to the uploaded image
        default: null
    }
},
    { timestamps: true }
);

export const Employee = mongoose.model('Employee', EmployeeSchema)