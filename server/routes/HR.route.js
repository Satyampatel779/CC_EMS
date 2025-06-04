import express from 'express'
import { 
    HandleAllHR, 
    HandleDeleteHR, 
    HandleHR, 
    HandleUpdateHR,
    HandleAllHRProfiles,
    HandleCreateHRProfile,
    HandleUpdateHRProfile,
    HandleDeleteHRProfile,
    HandleHRProfileById,
    HandleUpdateHRPermissions,
    HandleChangeHRPassword
} from '../controllers/HR.controller.js'
import { VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()


router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllHR)

// HR Profiles Management Routes - Must come before /:HRID to avoid conflicts
router.get("/all-profiles", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllHRProfiles)

router.post("/create-profile", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateHRProfile)

router.get("/profile/:id", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleHRProfileById)

router.patch("/update-profile/:id", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateHRProfile)

router.delete("/delete-profile/:id", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteHRProfile)

router.patch("/update-permissions/:id", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateHRPermissions)

router.patch("/change-password/:id", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleChangeHRPassword)

// Generic HR routes - Must come after specific routes to avoid conflicts  
router.get("/:HRID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleHR)

router.patch("/update-HR", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateHR)

router.delete("/delete-HR/:HRID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteHR)

export default router