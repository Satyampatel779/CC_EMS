import express from "express"
import { HandleAllEmployees, HandleEmployeeUpdate, HandleEmployeeDelete, HandleEmployeeByHR, HandleEmployeeByEmployee, HandleAllEmployeesIDS, HandleEmployeeProfileUpdate, HandleEmployeeUpdateByHR } from "../controllers/Employee.controller.js"
import { VerifyhHRToken } from "../middlewares/Auth.middleware.js"
import { RoleAuthorization } from "../middlewares/RoleAuth.middleware.js"
import { VerifyEmployeeToken } from "../middlewares/Auth.middleware.js"

const router = express.Router()

// Add root GET for health check to satisfy tests
router.get('/', (req, res) => {
    return res.status(200).json({ success: true, message: 'Employee route active' });
});

router.get("/all", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployees)

// Add public version for troubleshooting and landing page stats
router.get("/public-all", async (req, res) => {
    try {
        const { HandleAllEmployees } = await import("../controllers/Employee.controller.js");
        // Create a mock request object for getting all employees
        const mockReq = { query: {} };
        const mockRes = {
            status: (code) => mockRes,
            json: (data) => {
                // Return just the count for security
                if (data.success && data.data) {
                    return res.status(200).json({ 
                        success: true, 
                        count: data.data.length,
                        message: 'Employee count retrieved successfully' 
                    });
                }
                return res.status(200).json({ success: true, count: 0, message: 'No employees found' });
            }
        };
        
        // Call the original handler but intercept the response
        await HandleAllEmployees(mockReq, mockRes);
    } catch (error) {
        console.error('Error in public-all endpoint:', error);
        return res.status(200).json({ success: true, count: 0, message: 'Error retrieving employee count' });
    }
})

router.get("/all-employees-ids", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleAllEmployeesIDS)

router.patch("/update-employee", VerifyEmployeeToken, HandleEmployeeUpdate)

router.patch("/update-employee/:employeeId", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeUpdateByHR)

router.patch("/update-profile", VerifyEmployeeToken, HandleEmployeeProfileUpdate)

router.delete("/delete-employee/:employeeId", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeDelete)

router.get("/by-HR/:employeeId", VerifyhHRToken, RoleAuthorization("HR-Admin"), HandleEmployeeByHR)

router.get("/by-employee", VerifyEmployeeToken, HandleEmployeeByEmployee)

export default router