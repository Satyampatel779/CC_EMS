import { Employee } from "../models/Employee.model.js";
import { HumanResources } from "../models/HR.model.js";
import { Leave } from "../models/Leave.model.js";

// Create a leave request (Employee)
export const HandleCreateLeave = async (req, res) => {
    try {
        const { title, reason, startdate, enddate, type } = req.body;
        const employeeID = req.EMid; // Set by VerifyEmployeeToken
        if (!title || !reason || !startdate || !enddate || !type) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validate dates
        if (new Date(enddate) < new Date(startdate)) {
            return res.status(400).json({ success: false, message: "End date cannot be before start date" });
        }

        const employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        const leave = await Leave.create({
            employee: employeeID,
            title,
            reason,
            startdate,
            enddate,
            type,
            status: "Pending",
            organizationID: req.ORGID
        });
        employee.leaverequest.push(leave._id);
        await employee.save();
        return res.status(201).json({ success: true, message: "Leave request created successfully", data: leave });
    } catch (error) {
        console.error("Create Leave Error:", error); // Log error
        return res.status(500).json({ success: false, message: "Internal server error during leave creation." });
    }
};

// Get all leave requests (HR/Admin)
export const HandleAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ organizationID: req.ORGID })
            .populate("employee", "firstname lastname department");
        return res.status(200).json({ success: true, message: "All leave requests retrieved successfully", data: leaves });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single leave request (HR/Admin)
export const HandleLeave = async (req, res) => {
    try {
        const { leaveID } = req.params;
        const leave = await Leave.findOne({ _id: leaveID, organizationID: req.ORGID })
            .populate("employee", "firstname lastname department").populate("approvedby", "firstname lastname");
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found" });
        }
        return res.status(200).json({ success: true, message: "Leave request found", data: leave });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update a leave request (Employee, only if pending)
export const HandleUpdateLeaveByEmployee = async (req, res) => {
    try {
        const { leaveID } = req.params; // Get leaveID from params
        const updatedData = req.body; // Get updated data from body
        const employeeID = req.EMid;

        if (!leaveID) {
             return res.status(400).json({ success: false, message: "Leave ID is required in URL parameters" });
        }

        const leave = await Leave.findOne({ _id: leaveID, employee: employeeID, organizationID: req.ORGID });
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found or you do not have permission to update it" });
        }
        if (leave.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending leave requests can be updated" });
        }

        // Validate dates if provided
        const newStartDate = updatedData.startdate || leave.startdate;
        const newEndDate = updatedData.enddate || leave.enddate;
        if (new Date(newEndDate) < new Date(newStartDate)) {
            return res.status(400).json({ success: false, message: "End date cannot be before start date" });
        }

        // Prevent status update by employee
        if (updatedData.status) {
            delete updatedData.status;
        }
        // Prevent approvedby update by employee
        if (updatedData.approvedby) {
            delete updatedData.approvedby;
        }
        // Prevent decisiondate update by employee
        if (updatedData.decisiondate) {
            delete updatedData.decisiondate;
        }

        Object.assign(leave, updatedData);
        await leave.save();
        return res.status(200).json({ success: true, message: "Leave request updated successfully", data: leave });
    } catch (error) {
        console.error("Update Leave (Employee) Error:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Leave ID format" });
        }
        return res.status(500).json({ success: false, message: "Internal server error during leave update." });
    }
};

// Approve/Reject a leave request (HR/Admin)
export const HandleUpdateLeavebyHR = async (req, res) => {
    try {
        const { leaveID } = req.params; // Get leaveID from params
        const { status } = req.body; // Get status from body
        const hrID = req.HRid; // Use authenticated HR ID from middleware

        if (!leaveID) {
             return res.status(400).json({ success: false, message: "Leave ID is required in URL parameters" });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: "Status (Approved/Rejected) is required" });
        }
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be Approved or Rejected" });
        }

        // Verify HR user exists (optional, but good practice)
        const hrUser = await HumanResources.findById(hrID);
        if (!hrUser) {
             return res.status(404).json({ success: false, message: "Approving HR user not found" });
        }

        const leave = await Leave.findOne({ _id: leaveID, organizationID: req.ORGID });
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found" });
        }
        if (leave.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending leave requests can be approved or rejected" });
        }
        leave.status = status;
        leave.approvedby = hrID; // Use authenticated HR ID
        leave.decisiondate = new Date();
        await leave.save();
        return res.status(200).json({ success: true, message: `Leave request ${status.toLowerCase()} successfully`, data: leave });
    } catch (error) {
        console.error("Update Leave (HR) Error:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Leave ID or HR ID format" });
        }
        return res.status(500).json({ success: false, message: "Internal server error during leave status update." });
    }
};

// Delete a leave request (Employee, only if pending)
export const HandleDeleteLeave = async (req, res) => {
    try {
        const { leaveID } = req.params;
        const employeeID = req.EMid;

        if (!leaveID) {
             return res.status(400).json({ success: false, message: "Leave ID is required in URL parameters" });
        }

        const leave = await Leave.findOne({ _id: leaveID, employee: employeeID, organizationID: req.ORGID });
        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave request not found or you do not have permission to delete it" });
        }
        if (leave.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending leave requests can be deleted" });
        }
        await leave.deleteOne();
        // Remove from employee's leaverequest array
        await Employee.findByIdAndUpdate(employeeID, { $pull: { leaverequest: leaveID } });
        return res.status(200).json({ success: true, message: "Leave request deleted successfully" });
    } catch (error) {
        console.error("Delete Leave Error:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Leave ID format" });
        }
        return res.status(500).json({ success: false, message: "Internal server error during leave deletion." });
    }
};