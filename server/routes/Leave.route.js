import express from 'express';
import { 
  HandleAllLeaves, 
  HandleCreateLeave, 
  HandleDeleteLeave, 
  HandleLeave, 
  HandleUpdateLeaveByEmployee, 
  HandleUpdateLeavebyHR,
  HandleEmployeeLeaves
} from '../controllers/Leave.controller.js';
import { VerifyEmployeeToken, VerifyhHRToken } from '../middlewares/Auth.middleware.js';
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js';

const router = express.Router();

router.post("/create-leave", VerifyEmployeeToken, HandleCreateLeave);
router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllLeaves);

// New route for employees to get their own leave requests
router.get("/employee/my-leaves", VerifyEmployeeToken, HandleEmployeeLeaves);

router.get("/:leaveID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleLeave);
router.patch("/employee-update-leave/:leaveID", VerifyEmployeeToken, HandleUpdateLeaveByEmployee);
router.patch("/HR-update-leave/:leaveID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateLeavebyHR);
router.delete("/delete-leave/:leaveID", VerifyEmployeeToken, HandleDeleteLeave);

export default router;