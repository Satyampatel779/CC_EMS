import { Employee } from "../models/Employee.model.js"
import { HumanResources } from "../models/HR.model.js"
import { Leave } from "../models/Leave.model.js"


// NOTE: This controller is deprecated and scheduled for removal
// All leave functionality has been discontinued

export const HandleCreateLeave = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}

export const HandleAllLeaves = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}

export const HandleLeave = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}

export const HandleUpdateLeaveByEmployee = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}

export const HandleUpdateLeavebyHR = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}

export const HandleDeleteLeave = async (req, res) => {
    return res.status(410).json({ success: false, message: "Leave functionality has been removed" })
}