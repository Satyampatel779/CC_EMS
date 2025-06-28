import { Employee } from "../models/Employee.model.js"
import { Salary } from "../models/Salary.model.js"

export const HandleCreateSalary = async (req, res) => {
    try {
        const { 
            employeeID, 
            basicpay, 
            bonusePT, 
            deductionPT, 
            duedate, 
            currency, 
            status,
            workHours,
            overtimeHours,
            hourlyRate,
            paymentType
        } = req.body

        if (!employeeID || !basicpay || !duedate || !currency) {
            return res.status(400).json({ success: false, message: "Required fields: employeeID, basicpay, duedate, currency" })
        }

        const employee = await Employee.findById(employeeID)

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }

        const bonuses = basicpay * (bonusePT || 0) / 100
        const deductions = basicpay * (deductionPT || 0) / 100
        const netpay = (basicpay + bonuses) - deductions

        // Check if salary already exists for this period
        const existingCheck = await Salary.findOne({
            employee: employeeID,
            duedate: new Date(duedate),
            organizationID: req.ORGID
        })

        if (existingCheck) {
            return res.status(400).json({ 
                success: false, 
                message: "Salary record already exists for this employee and payment period" 
            })
        }

        const salary = await Salary.create({
            employee: employeeID,
            basicpay: basicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: currency,
            duedate: new Date(duedate),
            status: status || "Pending",
            workHours: workHours || 0,
            overtimeHours: overtimeHours || 0,
            hourlyRate: hourlyRate || 17.20,
            paymentType: paymentType || "Manual",
            organizationID: req.ORGID
        })

        // Add salary to employee's record
        if (!employee.salary) {
            employee.salary = [];
        }
        employee.salary.push(salary._id)
        await employee.save()

        const populatedSalary = await Salary.findById(salary._id).populate("employee", "firstname lastname department")

        return res.status(200).json({ 
            success: true, 
            message: "Salary created successfully", 
            data: populatedSalary 
        })

    } catch (error) {
        console.error("Error creating salary:", error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllSalary = async (req, res) => {
    try {
        const salary = await Salary.find({ organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "All salary records retrieved successfully", data: salary })

    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleSalary = async (req, res) => {
    try {
        const { salaryID } = req.params
        const salary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID }).populate("employee", "firstname lastname department")
        return res.status(200).json({ success: true, message: "salary found", data: salary })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "Internal Server Error" })
    }
}

export const HandleUpdateSalary = async (req, res) => {
    const { 
        salaryID, 
        basicpay, 
        bonusePT, 
        deductionPT, 
        duedate, 
        currency, 
        status,
        workHours,
        overtimeHours,
        hourlyRate,
        paymentType
    } = req.body
    
    try {
        if (!salaryID) {
            return res.status(400).json({ success: false, message: "Salary ID is required" })
        }

        const bonuses = basicpay * (bonusePT || 0) / 100
        const deductions = basicpay * (deductionPT || 0) / 100
        const netpay = (basicpay + bonuses) - deductions

        const updateData = {
            basicpay: basicpay,
            bonuses: bonuses,
            deductions: deductions,
            netpay: netpay,
            currency: currency,
            status: status
        }

        // Add optional fields if provided
        if (duedate) updateData.duedate = new Date(duedate)
        if (workHours !== undefined) updateData.workHours = workHours
        if (overtimeHours !== undefined) updateData.overtimeHours = overtimeHours
        if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate
        if (paymentType) updateData.paymentType = paymentType

        const salary = await Salary.findByIdAndUpdate(
            salaryID, 
            updateData,
            { new: true }
        ).populate("employee", "firstname lastname department")

        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" })
        }

        return res.status(200).json({ 
            success: true, 
            message: "Salary updated successfully", 
            data: salary 
        })

    } catch (error) {
        console.error("Error updating salary:", error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleDeleteSalary = async (req, res) => {
    try {
        const { salaryID } = req.params
        const salary = await Salary.findOne({ _id: salaryID, organizationID: req.ORGID })

        if (!salary) {
            return res.status(404).json({ success: false, message: "Salary record not found" })
        }

        const employee = await Employee.findById(salary.employee)
        employee.salary.splice(employee.salary.indexOf(salaryID), 1)

        await employee.save()
        await salary.deleteOne()

        return res.status(200).json({ success: true, message: "Salary deleted successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: error, message: "Error deleting" })
    }
}

export const HandleEmployeeSalary = async (req, res) => {
    try {
        // Get salary data for the logged-in employee
        const employeeId = req.EMid;
        
        const salaries = await Salary.find({ 
            employee: employeeId, 
            organizationID: req.ORGID 
        }).populate("employee", "firstname lastname department").sort({ duedate: -1 });
        
        return res.status(200).json({ 
            success: true, 
            message: "Employee salary records retrieved successfully", 
            salaries: salaries 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error, 
            message: "Internal Server Error" 
        });
    }
}