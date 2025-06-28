import mongoose from 'mongoose'
import { Schema } from "mongoose";

const GenerateRequestSchema = new Schema({
    requesttitle: {
        type: String,
        required: true
    },
    requestconent: {
        type: String,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Employee"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Department"
    },
    approvedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources"
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Denied', 'In Review', 'Closed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    hrComments: {
        type: String,
        default: ''
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HumanResources"
    },
    closedDate: {
        type: Date
    },
    requestType: {
        type: String,
        enum: ['IT Support', 'HR Support', 'Facilities', 'Finance', 'General'],
        default: 'General'
    },
    createdBy: {
        type: String,
        enum: ['Employee', 'HR'],
        default: 'Employee'
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
}, { timestamps: true });

export const GenerateRequest = mongoose.model("GenerateRequest", GenerateRequestSchema)