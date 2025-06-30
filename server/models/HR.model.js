import mongoose from 'mongoose'
import { Schema } from "mongoose";

const HumanResourcesSchema = new Schema({
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
            message: 'Invalid email address format',
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
        enum: ["HR-Admin", "HR_Director", "HR_Manager", "HR_Specialist", "HR_Assistant", "Employee"],
        required: true,
        default: "HR-Admin"
    },
    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active"
    },
    permissions: {
        canCreateEmployee: { type: Boolean, default: false },
        canEditEmployee: { type: Boolean, default: false },
        canDeleteEmployee: { type: Boolean, default: false },
        canViewSalary: { type: Boolean, default: false },
        canManageSalary: { type: Boolean, default: false },
        canManageLeaves: { type: Boolean, default: false },
        canManageRecruitment: { type: Boolean, default: false },
        canManageRequests: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
        canManageCalendar: { type: Boolean, default: false }
    },
    lastlogin: {
        type: Date,
        default: new Date()
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
        ref: "Department",
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, {
    timestamps: true
});

export const HumanResources = mongoose.model("HumanResources", HumanResourcesSchema)