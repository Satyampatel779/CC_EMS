import express from 'express'
import { HandleHRSignup, HandleHRVerifyEmail, HandleHRResetverifyEmail, HandleHRLogin, HandleHRCheck, HandleHRLogout, HandleHRForgotPassword, HandleHRResetPassword, HandleHRcheckVerifyEmail } from '../controllers/HRAuth.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

router.post("/signup", HandleHRSignup)

// Remove login requirement for email verification
router.post("/verify-email", HandleHRVerifyEmail)

// Remove login requirement for resending verification email
router.post("/resend-verify-email", HandleHRResetverifyEmail)

router.post("/login", HandleHRLogin)

// Public check-login endpoint: returns success false if no valid token
router.get("/check-login", HandleHRCheck)

router.get("/check-verify-email", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleHRcheckVerifyEmail)

router.post("/logout", HandleHRLogout)

// Remove login requirement for forgot password
router.post("/forgot-password", HandleHRForgotPassword)

router.post("/reset-password/:token", HandleHRResetPassword)


export default router