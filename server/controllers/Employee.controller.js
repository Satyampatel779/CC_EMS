import { Department } from "../models/Department.model.js" 
import { Employee } from "../models/Employee.model.js"
import { Organization } from "../models/Organization.model.js"

export const HandleAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID })
            .populate("department", "name")
            .populate("manager", "firstname lastname")
            .select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest isverified employeeId position joiningDate employmentType status workLocation dateOfBirth gender address emergencyContact")
        return res.status(200).json({ success: true, data: employees, type: "AllEmployees" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleAllEmployeesIDS = async (req, res) => {
    try {
        const employees = await Employee.find({ organizationID: req.ORGID }).populate("department", "name").select("firstname lastname department")
        return res.status(200).json({ success: true, data: employees, type: "AllEmployeesIDS" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleEmployeeByHR = async (req, res) => {
    try {
        const { employeeId } = req.params
        const employee = await Employee.findOne({ _id: employeeId, organizationID: req.ORGID })
            .select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest dateOfBirth gender address emergencyContact")

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }
        
        return res.status(200).json({ success: true, data: employee, type: "GetEmployee" })
    }
    catch (error) {
        return res.status(404).json({ success: false, error: error, message: "employee not found" }) 
    }
}

export const HandleEmployeeByEmployee = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })
            .populate("department", "name")
            .populate("manager", "firstname lastname")
            .select("firstname lastname email contactnumber department attendance notice salary leaverequest generaterequest employeeId position joiningDate employmentType manager workLocation status dateOfBirth gender address emergencyContact skills education")

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        return res.json({ success: true, message: "Employee Data Fetched Successfully", employee: employee })

    } catch (error) {
        return res.json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleEmployeeUpdate = async (req, res) => {
    try {
        const { employeeId, updatedEmployee } = req.body

        const checkeemployee = await Employee.findById(employeeId)

        if (!checkeemployee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        const employee = await Employee.findByIdAndUpdate(employeeId, updatedEmployee, { new: true }).select("firstname lastname email contactnumber department")
        return res.status(200).json({ success: true, data: employee })

    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleEmployeeProfileUpdate = async (req, res) => {
    try {
        const updateData = req.body;
        
        // Remove fields that employees shouldn't be able to update themselves
        const allowedFields = [
            'firstname', 'lastname', 'contactnumber', 'dateOfBirth', 'gender', 
            'address', 'emergencyContact', 'skills', 'education'
        ];
        
        const filteredUpdateData = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdateData[field] = updateData[field];
            }
        });

        const employee = await Employee.findByIdAndUpdate(
            req.EMid, 
            filteredUpdateData, 
            { new: true, runValidators: true }
        )
        .populate("department", "name")
        .populate("manager", "firstname lastname")
        .select("firstname lastname email contactnumber department employeeId position joiningDate employmentType manager workLocation status dateOfBirth gender address emergencyContact skills education");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully", 
            employee: employee 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message, 
            message: "Internal server error" 
        });
    }
}

export const HandleEmployeeDelete = async (req, res) => {
    try {
        const { employeeId } = req.params
        const employee = await Employee.findOne({ _id: employeeId })

        if (!employee) {
            return res.status(404).json({ success: false, message: "employee not found" })
        }

        const department = await Department.findById(employee.department)

        if (department) {
            department.employees.splice(department.employees.indexOf(employeeId), 1)
            await department.save()
        }

        const organization = await Organization.findById(employee.organizationID)

        if (!organization) {
            return res.status(404).json({ success: false, message: "organization not found" })
        }

        organization.employees.splice(organization.employees.indexOf(employeeId), 1)

        await organization.save()
        await employee.deleteOne()

        return res.status(200).json({ success: true, message: "Employee deleted successfully", type : "EmployeeDelete" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal server error" })
    }
}

export const HandleEmployeeUpdateByHR = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const updateData = req.body;

        // Verify employee exists and belongs to same organization
        const existingEmployee = await Employee.findOne({ 
            _id: employeeId, 
            organizationID: req.ORGID 
        });

        if (!existingEmployee) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee not found" 
            });
        }

        // HR can update all fields except organizationID
        delete updateData.organizationID;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId, 
            updateData, 
            { new: true, runValidators: true }
        )
        .populate("department", "name")
        .populate("manager", "firstname lastname")
        .select("firstname lastname email contactnumber department employeeId position joiningDate employmentType manager workLocation status dateOfBirth gender address emergencyContact skills education");

        if (!updatedEmployee) {
            return res.status(404).json({ 
                success: false, 
                message: "Employee not found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Employee updated successfully by HR", 
            data: updatedEmployee,
            type: "EmployeeUpdate"
        });

    } catch (error) {
        console.error("HR Employee Update Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: error.message, 
            message: "Internal server error" 
        });
    }
}
