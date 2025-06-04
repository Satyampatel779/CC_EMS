import express from 'express'
// Correct the controller import path and function names
import { HandleEmployeeSignup, HandleEmployeeVerifyEmail, HandleEmployeeLogout, HandleEmployeeLogin, HandleEmployeeForgotPassword, HandleEmployeeSetPassword, HandleResetEmployeeVerifyEmail, HandleEmployeeCheck, HandleEmployeeCheckVerifyEmail } from '../controllers/EmployeeAuth.controller.js' 
import { VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Use corrected function name
router.post("/signup", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeSignup)

// Use corrected function name
router.post("/verify-email", VerifyEmployeeToken, HandleEmployeeVerifyEmail)

// Use corrected function name
router.post("/resend-verify-email", VerifyEmployeeToken, HandleResetEmployeeVerifyEmail)

// Use corrected function name
router.post("/login", HandleEmployeeLogin)

// Use corrected function name (already correct)
router.get("/check-login", VerifyEmployeeToken, HandleEmployeeCheck)

// Use corrected function name
router.post("/logout", HandleEmployeeLogout)

// Remove VerifyEmployeeToken middleware - user won't be logged in
// Use corrected function name
router.post("/forgot-password", HandleEmployeeForgotPassword)

// Use corrected function name
router.post("/reset-password/:token", HandleEmployeeSetPassword)

// Use corrected function name (already correct)
router.get("/check-verify-email", VerifyEmployeeToken, HandleEmployeeCheckVerifyEmail) 


export default router