import express from 'express'
import { HandleCreateSalary, HandleAllSalary, HandleSalary, HandleUpdateSalary, HandleDeleteSalary, HandleEmployeeSalary } from '../controllers/Salary.controller.js'
import { VerifyhHRToken, VerifyEmployeeToken } from '../middlewares/Auth.middleware.js'
import { RoleAuthorization } from '../middlewares/RoleAuth.middleware.js'
const router = express.Router()

router.post("/create", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleCreateSalary)

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllSalary)

router.get("/employee/my-salary", VerifyEmployeeToken, HandleEmployeeSalary)

router.get("/:salaryID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleSalary)

router.patch("/update", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleUpdateSalary)

router.delete("/delete/:salaryID", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleDeleteSalary)

export default router