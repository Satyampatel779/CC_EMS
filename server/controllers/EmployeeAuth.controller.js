import { Employee } from "../models/Employee.model.js"
import bcrypt from 'bcrypt'
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../mailtrap/emails.js"
import { GenerateJwtTokenAndSetCookiesEmployee } from "../utils/generatejwttokenandsetcookies.js"
import crypto from "crypto"
import { Organization } from "../models/Organization.model.js"


export const HandleEmployeeSignup = async (req, res) => {
    const { 
        firstname, lastname, email, password, contactnumber,
        // Personal Information
        dateOfBirth, gender, address,
        // Employment Information  
        employeeId, position, joiningDate, employmentType, manager, workLocation, status,
        // Emergency Contact
        emergencyContact,
        // Additional fields
        skills, education
    } = req.body
    
    try {

        if (!firstname || !lastname || !email || !password || !contactnumber) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        const organization = await Organization.findOne({ _id: req.ORGID })

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization or Company not found" })
        }

        try {
            const checkEmployee = await Employee.findOne({ email: email })

            if (checkEmployee) {
                return res.status(400).json({ success: false, message: `Employee already exists, please go to the login page or create new employee` })
            }

            // Check if employeeId is provided and unique
            if (employeeId) {
                const existingEmployeeId = await Employee.findOne({ employeeId: employeeId })
                if (existingEmployeeId) {
                    return res.status(400).json({ success: false, message: "Employee ID already exists, please use a different ID" })
                }
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const verificationcode = GenerateVerificationToken(6)

            // Prepare employee data with all fields
            const employeeData = {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                contactnumber: contactnumber,
                role: "Employee",
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 5 * 60 * 1000,
                organizationID: organization._id
            }

            // Add optional personal information fields
            if (dateOfBirth) employeeData.dateOfBirth = new Date(dateOfBirth)
            if (gender) employeeData.gender = gender
            if (address) employeeData.address = address

            // Add optional employment information fields
            if (employeeId) employeeData.employeeId = employeeId
            if (position) employeeData.position = position
            if (joiningDate) employeeData.joiningDate = new Date(joiningDate)
            if (employmentType) employeeData.employmentType = employmentType
            if (manager) employeeData.manager = manager
            if (workLocation) employeeData.workLocation = workLocation
            if (status) employeeData.status = status

            // Add emergency contact if provided
            if (emergencyContact) {
                employeeData.emergencyContact = emergencyContact
            }

            // Add skills and education arrays if provided
            if (skills && Array.isArray(skills)) {
                employeeData.skills = skills.filter(skill => skill.trim() !== '')
            }
            if (education && Array.isArray(education)) {
                employeeData.education = education.filter(edu => edu.degree && edu.institution)
            }

            const newEmployee = await Employee.create(employeeData)

            organization.employees.push(newEmployee._id)
            await organization.save()

            const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode)

            return res.status(201).json({ success: true, message: "Employee Registered Successfully", newEmployee: newEmployee.email, type: "EmployeeCreate", SendVerificationEmailStatus: VerificationEmailStatus })

        } catch (error) {
            console.error("Signup Error:", error);
            res.status(500).json({ success: false, message: "Oops! Something went wrong during signup." });
        }

    } catch (error) {
        console.error("Outer Signup Error:", error);
        res.status(500).json({ success: false, message: "An unexpected error occurred." })
    }
}

export const HandleEmployeeVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body

    try {
        const ValidateEmployee = await Employee.findOne({ verificationtoken: verificationcode, verificationtokenexpires: { $gt: Date.now() }, organizationID: req.ORGID })

        if (!ValidateEmployee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Verifiation Code" })
        }

        ValidateEmployee.isverified = true;
        ValidateEmployee.verificationtoken = undefined;
        ValidateEmployee.verificationtokenexpires = undefined;
        await ValidateEmployee.save()

        const SendWelcomeEmailStatus = await SendWelcomeEmail(ValidateEmployee.email, ValidateEmployee.firstname, ValidateEmployee.lastname)

        return res.status(200).json({ success: true, message: "Employee Email verified successfully", validatedEmployee: ValidateEmployee, SendWelcomeEmailStatus: SendWelcomeEmailStatus })

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleResetEmployeeVerifyEmail = async (req, res) => {
    const { email } = req.body

    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee.email) {
            return res.status(404).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Valid Email Address" })
        }

        if (employee.isverified) {
            return res.status(404).json({ success: false, message: "Employee Email Already verified" })
        }

        const verificationcode = GenerateVerificationToken(6)
        employee.verificationtoken = verificationcode
        employee.verificationtokenexpires = Date.now() + 5 * 60 * 1000
        await employee.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({ success: true, message: "Verification email sent successfully", SendVerificationEmailStatus: SendVerificationEmailStatus })

    } catch (error) {
        res.status(500).json({ success: false, message: "internal error", error: error })
    }
}


export const HandleEmployeeLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const employee = await Employee.findOne({ email: email })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        const isMatch = await bcrypt.compare(password, employee.password)

        if (!isMatch) {
            return res.status(404).json({ success: false, message: "Invalid Credentials, Please Enter Correct One" })
        }

        // Generate token and set cookie
        const token = GenerateJwtTokenAndSetCookiesEmployee(res, employee._id, employee.role, employee.organizationID)
        employee.lastlogin = new Date()

        await employee.save()
        
        // Return token in response for client-side storage
        return res.status(200).json({ 
            success: true, 
            message: "Employee Login Successful",
            token: token,
            tokenType: "Bearer",
            expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            user: {
                id: employee._id,
                role: employee.role,
                email: employee.email,
                firstname: employee.firstname,
                lastname: employee.lastname,
                organizationID: employee.organizationID
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}

export const HandleEmployeeCheck = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" })
        }
        return res.status(200).json({ success: true, message: "Employee Already Logged In" })
    } catch (error) {
        return res.status(500).json({ success: false, error: error, message: "internal error" })
    }
}

export const HandleEmployeeLogout = async (req, res) => {
    try {
        res.clearCookie("EMtoken")
        return res.status(200).json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}

export const HandleEmployeeForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        // Remove organizationID requirement since the user isn't logged in
        const employee = await Employee.findOne({ email: email })

        if (!employee) {
            return res.status(401).json({ success: false, message: "Employee Email Does Not Exist, Please Enter Correct One" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60 // 1 hour

        employee.resetpasswordtoken = resetToken;
        employee.resetpasswordexpires = resetTokenExpires;
        await employee.save()

        const URL = `${process.env.CLIENT_URL}/auth/employee/resetpassword/${resetToken}`
        const SendForgotPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendForgotPasswordEmailStatus: SendForgotPasswordEmailStatus })

    } catch (error) {
        console.error("Employee Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "internal server error", error: error.message })
    }
}

export const HandleEmployeeSetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    try {
        if (req.cookies.token) {
            res.clearCookie("EMtoken")
        }
        const employee = await Employee.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        employee.password = hashedPassword
        employee.resetpasswordtoken = undefined
        employee.resetpasswordexpires = undefined
        await employee.save()

        const SendResetPasswordConfimationStatus = await SendResetPasswordConfimation(employee.email)
        return res.status(200).json({ success: true, message: "Password Reset Successful", SendResetPasswordConfimationStatus: SendResetPasswordConfimationStatus, resetpassword: true })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error", error: error })
    }
}

export const HandleEmployeeCheckVerifyEmail = async (req, res) => {
    try {
        const employee = await Employee.findOne({ _id: req.EMid, organizationID: req.ORGID })

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found", type: "Employeecodeavailable" })
        }

        if (employee.isverified) {
            return res.status(200).json({ success: false, message: "Employee Already Verified", type: "Employeecodeavailable" })
        }

        if ((employee.verificationtoken) && (employee.verificationtokenexpires > Date.now())) {
            return res.status(200).json({ success: true, message: "Verification Code is Still Valid", type: "Employeecodeavailable" })
        }

        return res.status(200).json({ success: false, message: "Invalid or Expired Verification Code", type: "Employeecodeavailable" })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error })
    }
}