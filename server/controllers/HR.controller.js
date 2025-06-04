import { Department } from "../models/Department.model.js"
import { HumanResources } from "../models/HR.model.js"
import { Organization } from "../models/Organization.model.js"
import bcrypt from "bcrypt"

export const HandleAllHR = async (req, res) => {
    try {
        const HR = await HumanResources.find({ organizationID: req.ORGID }).populate("department")
        return res.status(200).json({ success: true, message: "All Human Resources Found Successfully", data: HR })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleHR = async (req, res) => {
    try {
        const { HRID } = req.params
        const HR = await HumanResources.findOne({ _id: HRID, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }

        return res.status(200).json({ success: true, message: "Human Resources Found Successfully", data: HR })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleUpdateHR = async (req, res) => {
    try {
        const { HRID, Updatedata } = req.body

        if (!HRID || !Updatedata) {
            return res.status(400).json({ success: false, message: "Missing HRID or Updatedata" })
        }

        const updatedHR = await HumanResources.findByIdAndUpdate(HRID, Updatedata, { new: true })

        if (!updatedHR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }

        return res.status(200).json({ success: true, message: "Human Resources Updated Successfully", data: updatedHR })

    } catch (error) {
        return res.status(500).json({ success: false, message: "internal Server Error", error: error })
    }
}

export const HandleDeleteHR = async (req, res) => {
    try {
        const { HRID } = req.params

        const HR = await HumanResources.findOne({ _id: HRID, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Record Not Found" })
        }


        if (HR.department) {

            const department = await Department.findById(HR.department)

            if (department && department.HumanResources.includes(HRID)) {
                const index = department.HumanResources.indexOf(HRID)
                department.HumanResources.splice(index, 1)
            }

            await department.save()
        }

        const organization = await Organization.findById(req.ORGID)
        organization.HRs.splice(organization.HRs.indexOf(HRID), 1)

        await organization.save()
        await HR.deleteOne()
        
        return res.status(200).json({ success: true, message: "Human Resources Deleted Successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

// HR Profiles Management Controllers

export const HandleAllHRProfiles = async (req, res) => {
    try {
        const hrProfiles = await HumanResources.find({ organizationID: req.ORGID })
            .populate("department", "name")
            .select("-password -verificationtoken -resetpasswordtoken")
            .sort({ createdAt: -1 })
        
        return res.status(200).json({ 
            success: true, 
            message: "All HR Profiles Retrieved Successfully", 
            data: hrProfiles 
        })
    } catch (error) {
        console.error("Error fetching HR profiles:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleCreateHRProfile = async (req, res) => {
    try {
        const { firstname, lastname, email, password, contactnumber, role, department } = req.body

        if (!firstname || !lastname || !email || !password || !contactnumber) {
            return res.status(400).json({ 
                success: false, 
                message: "All required fields must be provided" 
            })
        }

        // Check if HR with email already exists
        const existingHR = await HumanResources.findOne({ email })
        if (existingHR) {
            return res.status(409).json({ 
                success: false, 
                message: "HR with this email already exists" 
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create new HR profile
        const newHR = new HumanResources({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            contactnumber,
            role: role || "HR-Admin",
            department: department || null,
            organizationID: req.ORGID,
            isverified: true // Auto-verify HR profiles created by admin
        })

        await newHR.save()

        // Update organization's HRs array
        const organization = await Organization.findById(req.ORGID)
        if (organization) {
            organization.HRs.push(newHR._id)
            await organization.save()
        }

        // Update department's HumanResources array if department is specified
        if (department) {
            const dept = await Department.findById(department)
            if (dept) {
                dept.HumanResources.push(newHR._id)
                await dept.save()
            }
        }

        const responseData = await HumanResources.findById(newHR._id)
            .populate("department", "name")
            .select("-password -verificationtoken -resetpasswordtoken")

        return res.status(201).json({ 
            success: true, 
            message: "HR Profile Created Successfully", 
            data: responseData 
        })
    } catch (error) {
        console.error("Error creating HR profile:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleHRProfileById = async (req, res) => {
    try {
        const { id } = req.params

        const hrProfile = await HumanResources.findOne({ 
            _id: id, 
            organizationID: req.ORGID 
        })
        .populate("department", "name")
        .select("-password -verificationtoken -resetpasswordtoken")

        if (!hrProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "HR Profile Not Found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            message: "HR Profile Retrieved Successfully", 
            data: hrProfile 
        })
    } catch (error) {
        console.error("Error fetching HR profile:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleUpdateHRProfile = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        // Remove sensitive fields from update data
        delete updateData.password
        delete updateData.organizationID
        delete updateData.verificationtoken
        delete updateData.resetpasswordtoken

        const updatedHR = await HumanResources.findOneAndUpdate(
            { _id: id, organizationID: req.ORGID },
            updateData,
            { new: true, runValidators: true }
        )
        .populate("department", "name")
        .select("-password -verificationtoken -resetpasswordtoken")

        if (!updatedHR) {
            return res.status(404).json({ 
                success: false, 
                message: "HR Profile Not Found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            message: "HR Profile Updated Successfully", 
            data: updatedHR 
        })
    } catch (error) {
        console.error("Error updating HR profile:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleDeleteHRProfile = async (req, res) => {
    try {
        const { id } = req.params

        const hrProfile = await HumanResources.findOne({ 
            _id: id, 
            organizationID: req.ORGID 
        })

        if (!hrProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "HR Profile Not Found" 
            })
        }

        // Remove from department if assigned
        if (hrProfile.department) {
            const department = await Department.findById(hrProfile.department)
            if (department && department.HumanResources.includes(id)) {
                const index = department.HumanResources.indexOf(id)
                department.HumanResources.splice(index, 1)
                await department.save()
            }
        }

        // Remove from organization
        const organization = await Organization.findById(req.ORGID)
        if (organization && organization.HRs.includes(id)) {
            const index = organization.HRs.indexOf(id)
            organization.HRs.splice(index, 1)
            await organization.save()
        }

        await hrProfile.deleteOne()

        return res.status(200).json({ 
            success: true, 
            message: "HR Profile Deleted Successfully" 
        })
    } catch (error) {
        console.error("Error deleting HR profile:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleUpdateHRPermissions = async (req, res) => {
    try {
        const { id } = req.params
        const { role } = req.body

        if (!role || !["HR-Admin", "Employee"].includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid role must be provided (HR-Admin or Employee)" 
            })
        }

        const updatedHR = await HumanResources.findOneAndUpdate(
            { _id: id, organizationID: req.ORGID },
            { role },
            { new: true, runValidators: true }
        )
        .populate("department", "name")
        .select("-password -verificationtoken -resetpasswordtoken")

        if (!updatedHR) {
            return res.status(404).json({ 
                success: false, 
                message: "HR Profile Not Found" 
            })
        }

        return res.status(200).json({ 
            success: true, 
            message: "HR Permissions Updated Successfully", 
            data: updatedHR 
        })
    } catch (error) {
        console.error("Error updating HR permissions:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}

export const HandleChangeHRPassword = async (req, res) => {
    try {
        const { id } = req.params
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Current password and new password are required" 
            })
        }

        const hrProfile = await HumanResources.findOne({ 
            _id: id, 
            organizationID: req.ORGID 
        })

        if (!hrProfile) {
            return res.status(404).json({ 
                success: false, 
                message: "HR Profile Not Found" 
            })
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, hrProfile.password)
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Current password is incorrect" 
            })
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12)

        // Update password
        hrProfile.password = hashedNewPassword
        await hrProfile.save()

        return res.status(200).json({ 
            success: true, 
            message: "Password Changed Successfully" 
        })
    } catch (error) {
        console.error("Error changing HR password:", error)
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        })
    }
}