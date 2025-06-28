import express from 'express'
import { 
    HandleAllGenerateRequest, 
    HandleCreateGenerateRequest, 
    HandleCreateGenerateRequestByHR,
    HandleDeleteRequest, 
    HandleGenerateRequest, 
    HandleUpdateRequestByEmployee, 
    HandleUpdateRequestByHR,
    HandleEmployeeRequests,
    HandleCloseRequest,
    HandleUpdateRequestPriority
} from '../controllers/GenerateRequest.controller.js'

import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'

const router = express.Router()

// Employee routes
router.post("/create-request", VerifyEmployeeToken, HandleCreateGenerateRequest)
router.patch("/update-request-content", VerifyEmployeeToken, HandleUpdateRequestByEmployee)
router.get("/employee/:employeeID", VerifyEmployeeToken, HandleEmployeeRequests)

// HR routes  
router.post("/create-request-by-hr", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateGenerateRequestByHR)
router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllGenerateRequest)
router.get("/:requestID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleGenerateRequest)
router.patch("/update-request-status", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRequestByHR)
router.patch("/close-request", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCloseRequest)
router.patch("/update-priority", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateRequestPriority)
router.delete("/delete-request/:requestID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteRequest)

export default router



