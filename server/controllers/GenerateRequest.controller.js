import { Department } from "../models/Department.model.js"
import { Employee } from "../models/Employee.model.js"
import { GenerateRequest } from "../models/GenerateRequest.model.js"
import { HumanResources } from "../models/HR.model.js"

export const HandleCreateGenerateRequest = async (req, res) => {
    try {
        const { requesttitle, requestconent, employeeID, priority, requestType } = req.body

        if (!requesttitle || !requestconent || !employeeID) {
            return res.status(400).json({ success: false, message: "Title, content and employee ID are required" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const department = await Department.findOne({ _id: employee.department, organizationID: req.ORGID })

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" })
        }

        const generaterequest = await GenerateRequest.findOne({
            requesttitle: requesttitle,
            requestconent: requestconent,
            employee: employeeID,
            department: employee.department
        })

        if (generaterequest) {
            return res.status(409).json({ success: false, message: "Request already exists" })
        }

        const newGenerateRequest = await GenerateRequest.create({
            requesttitle: requesttitle,
            requestconent: requestconent,
            employee: employeeID,
            department: employee.department,
            priority: priority || 'Medium',
            requestType: requestType || 'General',
            createdBy: 'Employee',
            organizationID: req.ORGID
        })

        employee.generaterequest.push(newGenerateRequest._id)
        await employee.save()

        // Populate the response
        const populatedRequest = await GenerateRequest.findById(newGenerateRequest._id)
            .populate("employee department", "firstname lastname name")

        return res.status(200).json({ success: true, message: "Request Generated Successfully", data: populatedRequest })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleCreateGenerateRequestByHR = async (req, res) => {
    try {
        const { requesttitle, requestconent, employeeID, priority, requestType, hrID } = req.body

        if (!requesttitle || !requestconent || !employeeID) {
            return res.status(400).json({ success: false, message: "Title, content and employee ID are required" })
        }

        const employee = await Employee.findOne({ _id: employeeID, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const hr = await HR.findOne({ _id: hrID, organizationID: req.ORGID })
        if (!hr) {
            return res.status(404).json({ success: false, message: "HR not found" })
        }

        const department = await Department.findOne({ _id: employee.department, organizationID: req.ORGID })
        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" })
        }

        const newGenerateRequest = await GenerateRequest.create({
            requesttitle: requesttitle,
            requestconent: requestconent,
            employee: employeeID,
            department: employee.department,
            priority: priority || 'Medium',
            requestType: requestType || 'General',
            createdBy: 'HR',
            approvedby: hrID,
            organizationID: req.ORGID
        })

        employee.generaterequest.push(newGenerateRequest._id)
        await employee.save()

        // Populate the response
        const populatedRequest = await GenerateRequest.findById(newGenerateRequest._id)
            .populate("employee department approvedby", "firstname lastname name")

        return res.status(200).json({ success: true, message: "Request Created Successfully by HR", data: populatedRequest })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleAllGenerateRequest = async (req, res) => {
    try {
        const requests = await GenerateRequest.find({ organizationID: req.ORGID })
            .populate("employee department approvedby closedBy", "firstname lastname name")
            .sort({ createdAt: -1 })
        return res.status(200).json({ success: true, message: "All requests retrieved successfully", data: requests })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleGenerateRequest = async (req, res) => {
    try {
        const { requestID } = req.params
        const request = await GenerateRequest.findOne({ _id: requestID, organizationID: req.ORGID })
            .populate("employee department approvedby closedBy", "firstname lastname name")
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }
        return res.status(200).json({ success: true, message: "Request retrieved successfully", data: request })
    }
    catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateRequestByEmployee = async (req, res) => {
    try {
        const { requestID, requesttitle, requestconent, priority, requestType } = req.body
        
        const updateData = { requesttitle, requestconent }
        
        if (priority !== undefined) {
            updateData.priority = priority
        }
        
        if (requestType !== undefined) {
            updateData.requestType = requestType
        }

        const request = await GenerateRequest.findByIdAndUpdate(requestID, updateData, { new: true })
            .populate("employee department", "firstname lastname name")

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request updated successfully", data: request })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateRequestByHR = async (req, res) => {
    try {
        const { requestID, approvedby, status, hrComments, priority } = req.body

        const updateData = { approvedby, status }
        
        if (hrComments !== undefined) {
            updateData.hrComments = hrComments
        }
        
        if (priority !== undefined) {
            updateData.priority = priority
        }

        // If status is being set to 'Closed', add close information
        if (status === 'Closed') {
            updateData.closedBy = approvedby
            updateData.closedDate = new Date()
        }

        const request = await GenerateRequest.findByIdAndUpdate(requestID, updateData, { new: true })
            .populate("employee department approvedby closedBy", "firstname lastname name")

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request updated successfully", data: request })
    } catch (error) {
        return res.status(500).json({ error: error, success: false, message: "Internal Server Error" })
    }
}


export const HandleDeleteRequest = async (req, res) => {
    try {
        const { requestID } = req.params
        const request = await GenerateRequest.findOne({ _id: requestID, organizationID: req.ORGID }

        )

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        const employee = await Employee.findById(request.employee)

        const index = employee.generaterequest.indexOf(requestID)
        employee.generaterequest.splice(index, 1)
        await employee.save()

        await request.deleteOne()

        return res.status(200).json({ success: true, message: "Request deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleEmployeeRequests = async (req, res) => {
    try {
        const { employeeID } = req.params
        const requests = await GenerateRequest.find({ 
            employee: employeeID, 
            organizationID: req.ORGID 
        })
        .populate("employee department approvedby closedBy", "firstname lastname name")
        .sort({ createdAt: -1 })
        
        return res.status(200).json({ success: true, message: "Employee requests retrieved successfully", data: requests })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleCloseRequest = async (req, res) => {
    try {
        const { requestID, closedBy, hrComments } = req.body

        const updateData = {
            status: 'Closed',
            closedBy: closedBy,
            closedDate: new Date()
        }

        if (hrComments) {
            updateData.hrComments = hrComments
        }

        const request = await GenerateRequest.findByIdAndUpdate(requestID, updateData, { new: true })
            .populate("employee department approvedby closedBy", "firstname lastname name")

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request closed successfully", data: request })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateRequestPriority = async (req, res) => {
    try {
        const { requestID, priority, updatedBy } = req.body

        const request = await GenerateRequest.findByIdAndUpdate(
            requestID, 
            { priority }, 
            { new: true }
        ).populate("employee department approvedby closedBy", "firstname lastname name")

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" })
        }

        return res.status(200).json({ success: true, message: "Request priority updated successfully", data: request })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}