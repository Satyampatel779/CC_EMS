import { HumanResources } from "../models/HR.model.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { GenerateJwtTokenAndSetCookiesHR, GenerateAuthResponseWithToken } from "../utils/generatejwttokenandsetcookies.js"
import { SendVerificationEmail, SendWelcomeEmail, SendForgotPasswordEmail, SendResetPasswordConfimation } from "../mailtrap/emails.js"
import { GenerateVerificationToken } from "../utils/generateverificationtoken.js"
import { Organization } from "../models/Organization.model.js"
import jwt from 'jsonwebtoken';

export const HandleHRSignup = async (req, res) => {
    try {
        const { firstname, lastname, email, password, contactnumber, name, description, OrganizationURL, OrganizationMail } = req.body

        if (!firstname || !lastname || !email || !password || !contactnumber || !name || !description || !OrganizationURL || !OrganizationMail) {
            return res.status(400).json({ success: false, message: "All Fields are required", type: "signup" });
        }

        try {
            const organization = await Organization.findOne({ name: name, OrganizationURL: OrganizationURL, OrganizationMail: OrganizationMail })
            const existingHR = await HumanResources.findOne({ email: email })

            if (existingHR) {
                return res.status(400).json({ success: false, message: "HR already exists, please go to the login page or create new HR", type: "signup" })
            }

            let targetOrganization = organization;
            let message = "";

            if (!organization) {
                targetOrganization = await Organization.create({
                    name,
                    description,
                    OrganizationURL,
                    OrganizationMail
                });
                message = "Organization Created Successfully & HR Registered Successfully";
            } else {
                message = "HR Registered Successfully";
            }

            const hashedpassword = await bcrypt.hash(password, 10)
            const verificationcode = GenerateVerificationToken(6)

            const newHR = await HumanResources.create({
                firstname,
                lastname,
                email,
                password: hashedpassword,
                contactnumber,
                role: "HR-Admin",
                organizationID: targetOrganization._id,
                verificationtoken: verificationcode,
                verificationtokenexpires: Date.now() + 5 * 60 * 1000
            })

            targetOrganization.HRs.push(newHR._id)
            await targetOrganization.save()

            const VerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
            return res.status(201).json({ success: true, message: message, VerificationEmailStatus: VerificationEmailStatus, type: "signup", HRid: newHR._id })

        } catch (dbError) {
            console.error("HR Signup DB Error:", dbError);
            return res.status(500).json({ success: false, message: "An error occurred during registration.", type: "signup" });
        }

    } catch (validationError) {
        console.error("HR Signup Validation Error:", validationError);
        return res.status(400).json({ success: false, message: validationError.message || "Invalid input", type: "signup" });
    }
}

export const HandleHRVerifyEmail = async (req, res) => {
    const { verificationcode } = req.body
    try {
        const HR = await HumanResources.findOne({ verificationtoken: verificationcode, verificationtokenexpires: { $gt: Date.now() } })

        if (!HR) {
            return res.status(401).json({ success: false, message: "Invalid or Expired Verification Code", type: "HRverifyemail" })
        }

        HR.isverified = true;
        HR.verificationtoken = undefined;
        HR.verificationtokenexpires = undefined;
        await HR.save()

        const SendWelcomeEmailStatus = await SendWelcomeEmail(HR.email, HR.firstname, HR.lastname, HR.role)
        return res.status(200).json({ success: true, message: "Email Verified successfully", SendWelcomeEmailStatus: SendWelcomeEmailStatus, type: "HRverifyemail" })
    } catch (error) {
        console.error("HR Verify Email Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error during email verification.", type: "HRverifyemail" })
    }
}

export const HandleHRLogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email })

        if (!HR) {
            return res.status(400).json({ success: false, message: "Invalid Credentials, Please Add Correct One", type: "HRLogin" })
        }

        const isMatch = await bcrypt.compare(password, HR.password)

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Credentials, Please Add Correct One", type: "HRLogin" })
        }

        // Generate token and set cookie
        const token = GenerateJwtTokenAndSetCookiesHR(res, HR._id, HR.role, HR.organizationID)
        
        // Update last login
        HR.lastlogin = new Date()
        await HR.save()
        
        // Return token in response for client-side storage
        return res.status(200).json({ 
            success: true, 
            message: "HR Login Successful", 
            type: "HRLogin",
            token: token, // Include token in response
            tokenType: "Bearer",
            expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            user: {
                id: HR._id,
                role: HR.role,
                email: HR.email,
                firstname: HR.firstname,
                lastname: HR.lastname,
                organizationID: HR.organizationID
            }
        })
    }
    catch (error) {
        console.error("HR Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error during login.", type: "HRLogin" })
    }
}

export const HandleHRLogout = async (req, res) => {
    try {
        res.clearCookie("HRtoken")
        return res.status(200).json({ success: true, message: "HR Logged Out Successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error", error: error })
    }
}

export const HandleHRCheck = async (req, res) => {
    // Public check: validate token from header or cookie
    try {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const cookieToken = req.cookies.HRtoken;
        const token = headerToken || cookieToken;

        if (!token) {
            return res.status(200).json({ success: false, message: "No token provided", type: "checkHR" });
        }
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(200).json({ success: false, message: "Invalid token", type: "checkHR" });
        }
        // Check HR exists
        const HR = await HumanResources.findOne({ _id: decoded.HRid, organizationID: decoded.ORGID });
        if (!HR) {
            return res.status(200).json({ success: false, message: "HR not found", type: "checkHR" });
        }
        return res.status(200).json({ success: true, message: "HR Already Logged In", type: "checkHR" });
    } catch (error) {
        console.error("HandleHRCheck Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", type: "checkHR" });
    }
};

export const HandleHRForgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist Please Enter Correct One", type: "HRforgotpassword" })
        }

        const resetToken = crypto.randomBytes(25).toString('hex')
        const resetTokenExpires = Date.now() + 1000 * 60 * 60

        HR.resetpasswordtoken = resetToken;
        HR.resetpasswordexpires = resetTokenExpires;
        await HR.save()

        const URL = `${process.env.CLIENT_URL}/auth/HR/resetpassword/${resetToken}`
        const SendResetPasswordEmailStatus = await SendForgotPasswordEmail(email, URL)
        return res.status(200).json({ success: true, message: "Reset Password Email Sent Successfully", SendResetPasswordEmailStatus: SendResetPasswordEmailStatus, type: "HRforgotpassword" })
    }
    catch (error) {
        console.error("HR Forgot Password Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error during forgot password request.", type: "HRforgotpassword" })
    }
}

export const HandleHRResetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body

    try {
        if (req.cookies.HRtoken) {
            res.clearCookie("HRtoken")
        }

        const HR = await HumanResources.findOne({ resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() } })

        if (!HR) {
            return res.status(401).json({ success: false, message: "Invalid or Expired Reset Password Token", resetpassword: false })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        HR.password = hashedPassword
        HR.resetpasswordtoken = undefined;
        HR.resetpasswordexpires = undefined;
        await HR.save()

        const SendPasswordResetEmailStatus = await SendResetPasswordConfimation(HR.email)
        return res.status(200).json({ success: true, message: "Password Reset Successfully", SendPasswordResetEmailStatus: SendPasswordResetEmailStatus, resetpassword: true })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error, resetpassword: false })
    }
}

export const HandleHRResetverifyEmail = async (req, res) => {
    const { email } = req.body
    try {
        const HR = await HumanResources.findOne({ email: email })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR Email Does Not Exist, Please Enter Correct Email", type: "HRResendVerifyEmail" })
        }

        if (HR.isverified) {
            return res.status(400).json({ success: false, message: "HR Email is already Verified", type: "HRResendVerifyEmail" })
        }

        if (HR.verificationtoken && HR.verificationtokenexpires > Date.now()) {
            return res.status(400).json({ success: false, message: "A valid verification code already exists. Please check your email.", type: "HRResendVerifyEmail" });
        }

        const verificationcode = GenerateVerificationToken(6)
        HR.verificationtoken = verificationcode
        HR.verificationtokenexpires = Date.now() + 5 * 60 * 1000

        await HR.save()

        const SendVerificationEmailStatus = await SendVerificationEmail(email, verificationcode)
        return res.status(200).json({ success: true, message: "Verification Email Sent Successfully", SendVerificationEmailStatus: SendVerificationEmailStatus, type: "HRResendVerifyEmail" })

    }
    catch (error) {
        console.error("HR Resend Verify Email Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error while resending verification email.", type: "HRResendVerifyEmail" })
    }
}

export const HandleHRcheckVerifyEmail = async (req, res) => {
    try {
        const HR = await HumanResources.findOne({ _id: req.HRid, organizationID: req.ORGID })

        if (!HR) {
            return res.status(404).json({ success: false, message: "HR not found.", type: "HRcodeavailable" });
        }

        if (HR.isverified) {
            return res.status(200).json({ success: true, message: "HR Already Verified", type: "HRcodeavailable", alreadyverified: true })
        }

        if ((HR.verificationtoken) && (HR.verificationtokenexpires > Date.now())) {
            return res.status(200).json({ success: true, message: "Verification Code is Still Valid", type: "HRcodeavailable", alreadyverified: false })
        }

        return res.status(200).json({ success: false, message: "Invalid or Expired Verification Code", type: "HRcodeavailable", alreadyverified: false })
    }
    catch (error) {
        console.error("HR Check Verify Email Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error while checking verification status.", type: "HRcodeavailable" })
    }
}