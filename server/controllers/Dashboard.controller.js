import { Employee } from "../models/Employee.model.js"
import { Department } from "../models/Department.model.js"
import { Leave } from "../models/Leave.model.js"
import { Salary } from "../models/Salary.model.js"
import { Notice } from "../models/Notice.model.js"
import { GenerateRequest } from "../models/GenerateRequest.model.js"
import { Balance } from "../models/Balance.model.js"

export const HandleHRDashboard = async (req, res) => {
    try {
        // Get basic counts
        const employees = await Employee.find({ organizationID: req.ORGID })
        const departments = await Department.find({ organizationID: req.ORGID })
        const leaves = await Leave.find({ organizationID: req.ORGID })
        const requests = await GenerateRequest.find({ organizationID: req.ORGID })
        const balance = await Balance.find({ organizationID: req.ORGID })
        const notices = await Notice.find({ organizationID: req.ORGID })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("createdby", "firstname lastname")

        // Get recent activity data
        const recentLeaves = await Leave.find({ organizationID: req.ORGID })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate("employee", "firstname lastname")

        const recentRequests = await GenerateRequest.find({ organizationID: req.ORGID })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate("employee", "firstname lastname")

        const recentEmployees = await Employee.find({ organizationID: req.ORGID })
            .sort({ createdAt: -1 })
            .limit(3)

        return res.status(200).json({ 
            success: true, 
            data: { 
                employees, 
                departments, 
                leaves, 
                requests, 
                balance, 
                notices,
                recentLeaves,
                recentRequests,
                recentEmployees
            } 
        })
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}