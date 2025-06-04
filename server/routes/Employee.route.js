import express from "express"
import { HandleAllEmployees, HandleEmployeeUpdate, HandleEmployeeDelete, HandleEmployeeByHR, HandleEmployeeByEmployee, HandleAllEmployeesIDS } from "../controllers/Employee.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { VerifyEmployeeToken } from "../middlewares/Auth.middleware.js"

const router = express.Router()

// Add root GET for health check to satisfy tests
router.get('/', (req, res) => {
    return res.status(200).json({ success: true, message: 'Employee route active' });
});

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployees)

// Add public version for troubleshooting
router.get("/public-all", (req, res) => {
    return res.status(200).json({ success: true, message: 'This is a public endpoint for troubleshooting' });
})

router.get("/all-employees-ids", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployeesIDS)

router.patch("/update-employee", VerifyEmployeeToken, HandleEmployeeUpdate)

router.delete("/delete-employee/:employeeId", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeDelete)

router.get("/by-HR/:employeeId", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeByHR)

router.get("/by-employee", VerifyEmployeeToken, HandleEmployeeByEmployee)

export default router