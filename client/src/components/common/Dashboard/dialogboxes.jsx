import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ErrorPopup } from "../error-popup.jsx"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { CommonStateHandler } from "../../../utils/commonhandler.js"
import { useDispatch, useSelector } from "react-redux"
import { FormSubmitToast } from "./Toasts.jsx"
import { Loading } from "../loading.jsx"
import { HandlePostHREmployees, HandleGetHREmployees, HandleDeleteHREmployees, HandlePatchHREmployees } from "../../../redux/Thunks/HREmployeesThunk.js"
import { HandlePostHRDepartments, HandlePatchHRDepartments, HandleDeleteHRDepartments } from "../../../redux/Thunks/HRDepartmentPageThunk.js"
import { useToast } from "../../../hooks/use-toast.js"
import { fetchEmployeesIDs } from "../../../redux/Thunks/EmployeesIDsThunk.js"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"


export const AddEmployeesDialogBox = () => {
    const dispatch = useDispatch()
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const [formdata, setformdata] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        textpassword: "",
        password: "",
        employeeId: "",
        position: "",
        joiningDate: "",
        employmentType: "Full-time",
        workLocation: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
    })

    const handleSubmitAdd = async (e) => {
      e.preventDefault()
      const result = await dispatch(HandlePostHREmployees({ apiroute: "ADDEMPLOYEE", data: formdata }))
      if (result.type.includes('fulfilled')) {
        toast({ title: 'Success', description: 'Employee added successfully' })
        setIsOpen(false)
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
        dispatch(fetchEmployeesIDs())
      } else {
        toast({ title: 'Error', description: 'Failed to add employee', variant: 'destructive' })
      }
    }
    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }

    return (
        <div className="AddEmployees-content">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger onClick={() => setIsOpen(true)} className="bg-blue-800 border-2 border-blue-800 md:px-4 md:py-2 md:text-lg min-[250px]:px-2 min-[250px]:py-1 min-[250px]:text-sm text-white font-bold rounded-lg hover:bg-white hover:text-blue-800">Add Employees</DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                 <form onSubmit={handleSubmitAdd}>
                    <div className="add-employees-container flex flex-col gap-5">
                        <div className="heading">
                            <h1 className="font-bold text-2xl">Add Employee Info</h1>
                        </div>
                        
                        {/* Basic Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h3>
                            <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                                <div className="form-group flex flex-col gap-3">
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="firstname" className="md:text-md lg:text-lg font-bold">First Name</label>
                                        <input type="text"
                                            id="firstname"
                                            className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="firstname"
                                            value={formdata.firstname}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="lastname" className="md:text-md lg:text-lg font-bold">Last Name</label>
                                        <input type="text"
                                            id="lastname"
                                            className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="lastname"
                                            value={formdata.lastname}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="email" className="md:text-md lg:text-lg font-bold">Email</label>
                                        <input type="email"
                                            id="email" required={true} className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="email"
                                            value={formdata.email}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="contactnumber" className="md:text-md lg:text-lg font-bold">Contact Number</label>
                                        <input type="text"
                                            id="contactnumber" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="contactnumber"
                                            value={formdata.contactnumber}
                                            onChange={handleformchange} />
                                    </div>
                                </div>
                                <div className="form-group flex flex-col gap-3">
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="dateOfBirth" className="md:text-md lg:text-lg font-bold">Date of Birth</label>
                                        <input type="date"
                                            id="dateOfBirth" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="dateOfBirth"
                                            value={formdata.dateOfBirth}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="gender" className="md:text-md lg:text-lg font-bold">Gender</label>
                                        <select
                                            id="gender" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="gender"
                                            value={formdata.gender}
                                            onChange={handleformchange}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="address" className="md:text-md lg:text-lg font-bold">Address</label>
                                        <input type="text"
                                            id="address" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="address"
                                            value={formdata.address}
                                            onChange={handleformchange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700">Employment Information</h3>
                            <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                                <div className="form-group flex flex-col gap-3">
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="employeeId" className="md:text-md lg:text-lg font-bold">Employee ID</label>
                                        <input type="text"
                                            id="employeeId" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="employeeId"
                                            value={formdata.employeeId}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="position" className="md:text-md lg:text-lg font-bold">Position</label>
                                        <input type="text"
                                            id="position" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="position"
                                            value={formdata.position}
                                            onChange={handleformchange} />
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="joiningDate" className="md:text-md lg:text-lg font-bold">Joining Date</label>
                                        <input type="date"
                                            id="joiningDate" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="joiningDate"
                                            value={formdata.joiningDate}
                                            onChange={handleformchange} />
                                    </div>
                                </div>
                                <div className="form-group flex flex-col gap-3">
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="employmentType" className="md:text-md lg:text-lg font-bold">Employment Type</label>
                                        <select
                                            id="employmentType" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="employmentType"
                                            value={formdata.employmentType}
                                            onChange={handleformchange}>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Intern">Intern</option>
                                        </select>
                                    </div>
                                    <div className="label-input-field flex flex-col gap-1">
                                        <label htmlFor="workLocation" className="md:text-md lg:text-lg font-bold">Work Location</label>
                                        <input type="text"
                                            id="workLocation" className="border-2 border-gray-700 rounded px-2 py-1"
                                            name="workLocation"
                                            value={formdata.workLocation}
                                            onChange={handleformchange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700">Emergency Contact</h3>
                            <div className="form-container grid md:grid-cols-3 min-[250px]:grid-cols-1 gap-4">
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="emergencyContactName" className="md:text-md lg:text-lg font-bold">Contact Name</label>
                                    <input type="text"
                                        id="emergencyContactName" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="emergencyContactName"
                                        value={formdata.emergencyContactName}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="emergencyContactRelationship" className="md:text-md lg:text-lg font-bold">Relationship</label>
                                    <input type="text"
                                        id="emergencyContactRelationship" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="emergencyContactRelationship"
                                        value={formdata.emergencyContactRelationship}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="emergencyContactPhone" className="md:text-md lg:text-lg font-bold">Contact Phone</label>
                                    <input type="text"
                                        id="emergencyContactPhone" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="emergencyContactPhone"
                                        value={formdata.emergencyContactPhone}
                                        onChange={handleformchange} />
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700">Account Information</h3>
                            <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="text-password" className="md:text-md lg:text-lg font-bold">Password</label>
                                    <input type="text"
                                        id="text-password" className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="textpassword"
                                        value={formdata.textpassword}
                                        onChange={handleformchange} />
                                </div>
                                <div className="label-input-field flex flex-col gap-1">
                                    <label htmlFor="password" className="md:text-md lg:text-lg font-bold">Confirm Password</label>
                                    <input type="password"
                                        id="password" required={true} className="border-2 border-gray-700 rounded px-2 py-1"
                                        name="password"
                                        value={formdata.password}
                                        onChange={handleformchange} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                          <Button type="submit">Add Employee</Button>
                        </div>
                    </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export const EmployeeDetailsDialogBox = ({ EmployeeID }) => {
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const FetchEmployeeData = (EmID) => {
        const employee = HREmployeesState.data.find((item) => item._id === EmID)
        return employee
    }
    const employeeData = FetchEmployeeData(EmployeeID)
    return (
        <div className="Employees-Details-container">
            <Dialog>
                <div>
                    <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">View</DialogTrigger>
                </div>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                    <div className="employee-data-container flex flex-col gap-4">
                        <div className="employee-profile-logo flex items-center gap-3">
                            <div className="logo border-2 border-blue-800 rounded-[50%] flex justify-center items-center">
                                <p className="font-bold text-2xl text-blue-700 p-2">{`${employeeData.firstname.slice(0, 1).toUpperCase()} ${employeeData.lastname.slice(0, 1).toUpperCase()}`}</p>
                            </div>
                            <div className="employee-fullname">
                                <p className="font-bold text-2xl">{`${employeeData.firstname} ${employeeData.lastname}`}</p>
                                <p className="text-gray-600">{employeeData.position || "Position not specified"}</p>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">Personal Information</h3>
                            <div className="employees-all-details grid lg:grid-cols-2 min-[250px]:gap-2 lg:gap-10">
                                <div className="details-group-1 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">First Name :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.firstname}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Last Name :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.lastname}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Email :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.email}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Contact Number :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.contactnumber}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Date of Birth :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth).toLocaleDateString() : "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="details-group-2 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Gender :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.gender || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Address :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.address || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Email Verify :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.isverified ? "Verified" : "Not Verified"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">Employment Information</h3>
                            <div className="employees-all-details grid lg:grid-cols-2 min-[250px]:gap-2 lg:gap-10">
                                <div className="details-group-1 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Employee ID :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.employeeId || "Not assigned"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Position :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.position || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Department :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.department ? employeeData.department.name : "Not Specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Joining Date :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="details-group-2 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Employment Type :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.employmentType || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Work Location :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.workLocation || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Status :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.status || "Active"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Manager :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.manager ? `${employeeData.manager.firstname} ${employeeData.manager.lastname}` : "Not assigned"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Information */}
                        <div className="section">
                            <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">System Information</h3>
                            <div className="employees-all-details grid lg:grid-cols-2 min-[250px]:gap-2 lg:gap-10">
                                <div className="details-group-1 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Notices :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.notice?.length || 0}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Salary Records :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.salary?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="details-group-2 flex flex-col gap-3">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Leave Requests :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.leaverequest?.length || 0}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Requests :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.generaterequest?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact Information */}
                        {employeeData.emergencyContact && (
                            <div className="section">
                                <h3 className="font-semibold text-lg mb-3 text-blue-700 border-b pb-2">Emergency Contact</h3>
                                <div className="employees-all-details grid lg:grid-cols-3 min-[250px]:gap-2 lg:gap-10">
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Name :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.emergencyContact.name || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Relationship :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.emergencyContact.relationship || "Not specified"}</p>
                                    </div>
                                    <div className="label-value-pair flex items-center gap-2">
                                        <label className="font-bold md:text-sm xl:text-lg">Phone :</label>
                                        <p className="md:text-sm xl:text-lg">{employeeData.emergencyContact.phone || "Not specified"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export const DeleteEmployeeDialogBox = ({ EmployeeID }) => {
    const dispatch = useDispatch()
    const DeleteEmployee = (EMID) => {
        dispatch(HandleDeleteHREmployees({ apiroute: `DELETE.${EMID}` }))
    }
    return (
        <div className="delete-employee-dialog-container">
            <Dialog>
                <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">Delete</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    <div className="flex flex-col justify-center items-center gap-4">
                        <p className="text-lg font-bold min-[250px]:text-center">Are you sure you want to delete this employee?</p>
                        <div className="delete-employee-button-group flex gap-2">
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-red-700 border-red-700 hover:bg-transparent hover:text-red-700" onClick={() => DeleteEmployee(EmployeeID)}>Delete</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-green-700 border-green-700 hover:bg-transparent hover:text-green-700">Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}



export const CreateDepartmentDialogBox = () => {
    const { toast } = useToast()
    const dispatch = useDispatch()
    const [formdata, setformdata] = useState({
        name: "",
        description: ""
    })

    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }

    const CreateDepartment = () => {
        dispatch(HandlePostHRDepartments({ apiroute: "CREATE", data: formdata }))
        setformdata({
            name: "",
            description: ""
        })
    }

    const ShowToast = () => {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: `All Fields are required to create a department`,
        })
    }

    return (
        <Dialog>
            <DialogTrigger className="min-[250px]:text-sm sm:text-lg min-[250px]:px-2 min-[250px]:py-1 sm:px-4 sm:py-2 bg-blue-700 font-bold text-white rounded-lg border-2 border-blue-700 hover:bg-white hover:text-blue-700">Create Department</DialogTrigger>
            <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                <div className="create-department-container flex flex-col gap-4">
                    <div className="create-department-heading">
                        <h1 className="font-bold text-2xl">Create Department</h1>
                    </div>
                    <div className="create-department-form flex flex-col gap-4">
                        <div className="form-group flex flex-col gap-3">
                            <div className="label-input-field flex flex-col gap-1">
                                <label htmlFor="departmentname" className="md:text-md lg:text-lg font-bold">Department Name</label>
                                <input type="text"
                                    id="departmentname"
                                    name="name"
                                    value={formdata.name}
                                    onChange={handleformchange}
                                    placeholder="Enter Department Name"
                                    className="border-2 border-gray-700 rounded px-2 py-1" />
                            </div>
                            <div className="label-input-field flex flex-col gap-1">
                                <label htmlFor="departmentdescription" className="md:text-md lg:text-lg font-bold">Department Description</label>
                                <textarea
                                    id="departmentdescription"
                                    name="description"
                                    value={formdata.description}
                                    onChange={handleformchange}
                                    className="border-2 border-gray-700 rounded px-2 py-1 h-[100px]"
                                    placeholder="Write Your Department Description Here"></textarea>
                            </div>
                        </div>
                        <div className="create-department-button flex justify-center items-center">
                            {
                                (formdata.name.trim().length === 0 || formdata.description.trim().length === 0) ? <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-md hover:bg-white hover:text-blue-700" onClick={() => ShowToast()}>Create</Button> :
                                    <DialogClose asChild>
                                        <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-md hover:bg-white hover:text-blue-700" onClick={() => CreateDepartment()}>Create</Button>
                                    </DialogClose>
                            }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}



export const EmployeesIDSDialogBox = ({ DepartmentID }) => {
    console.log("this is Department ID", DepartmentID)
    const EmployeesIDState = useSelector((state) => state.EMployeesIDReducer)
    const dispatch = useDispatch()
    const [SelectedEmployeesData, Set_selectedEmployeesData] = useState({
        departmentID: DepartmentID,
        employeeIDArray: [],
    })

    const SelectEmployees = (EMID) => {
        if (SelectedEmployeesData.employeeIDArray.includes(EMID)) {
            Set_selectedEmployeesData({ ...SelectedEmployeesData, employeeIDArray: SelectedEmployeesData.employeeIDArray.filter((item) => item !== EMID) })
        }
        else if (!SelectedEmployeesData.employeeIDArray.includes(EMID)) {
            Set_selectedEmployeesData({ ...SelectedEmployeesData }, SelectedEmployeesData.employeeIDArray.push(EMID))
        }
    }

    const ClearSelectedEmployeesData = () => {
        Set_selectedEmployeesData({
            departmentID: DepartmentID,
            employeeIDArray: []
        })
    }

    const SetEmployees = () => {
        dispatch(HandlePatchHRDepartments({ apiroute: "UPDATE", data: SelectedEmployeesData }))
        ClearSelectedEmployeesData()
    }

    console.log(SelectedEmployeesData)

    useEffect(() => {
        Set_selectedEmployeesData(
            {
                departmentID: DepartmentID,
                employeeIDArray: [],
            }
        )
    }, [DepartmentID])

    return (
        <div className="employeeIDs-box-container">
            <Dialog>
                <DialogTrigger className="px-4 py-2 font-bold m-2 bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-white hover:text-blue-700 min-[250px]:text-xs md:text-sm lg:text-lg" onClick={() => dispatch(fetchEmployeesIDs({ apiroute: "GETALL" }))}>Add Employees</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    {EmployeesIDState.isLoading ? <Loading height={"h-auto"} /> : <div className="employeeID-checkbox-container flex flex-col gap-4">
                        <div>
                            <h1 className="font-bold text-2xl">Select Employees</h1>
                        </div>
                        <div className="employeeID-checkbox-group">
                            <Command className="rounded-lg border shadow-md w-full">
                                <CommandInput placeholder="Type a Employee Name..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="All Employees">
                                        {EmployeesIDState.data ? EmployeesIDState.data.map((item, index) => <CommandItem key={index}>
                                            <div className="employeeID-checkbox flex justify-center items-center gap-2">
                                                <input type="checkbox" id={`EmployeeID-${index + 1}`} className="border-2 border-gray-700 w-4 h-4" onClick={() => SelectEmployees(item._id)} checked={SelectedEmployeesData.employeeIDArray.includes(item._id)} disabled={item.department ? true : false} />
                                                <label htmlFor={`EmployeeID-${index + 1}`} className="text-lg">{`${item.firstname} ${item.lastname}`} <span className="text-xs mx-0.5 overflow-hidden text-ellipsis">{item.department ? `(${item.department.name})` : null}</span> </label>
                                            </div>
                                        </CommandItem>) : null}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </div>
                        <div className="employeeID-checkbox-button-group flex justify-center items-center gap-2">
                            <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-lg hover:bg-white hover:text-blue-700" onClick={() => SetEmployees()}>Add</Button>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 bg-blue-700 border-blue-700 px-2 py-1 rounded-lg hover:bg-white hover:text-blue-700" onClick={() => ClearSelectedEmployeesData()}>Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>}

                </DialogContent>
            </Dialog>
        </div>
    )
}

export const RemoveEmployeeFromDepartmentDialogBox = ({ DepartmentName, DepartmentID, EmployeeID }) => {
    const dispatch = useDispatch()

    const RemoveEmployee = (EMID) => {
        dispatch(HandleDeleteHRDepartments({ apiroute: "DELETE", data: { departmentID: DepartmentID, employeeIDArray: [EMID], action: "delete-employee" } }))
    }

    return (
        <div className="remove-employee">
            <Dialog>
                <DialogTrigger className="btn-sm btn-blue-700 text-md border-2 border-blue-800 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md hover:bg-blue-800 hover:text-white">Remove</DialogTrigger>
                <DialogContent className="max-w-[315px] lg:max-w-[35vw] 2xl:max-w-[30vw]">
                    <div className="flex flex-col justify-center items-center gap-4">
                        <p className="text-lg font-bold min-[250px]:text-center">{`Are you sure you want to remove this employee from ${DepartmentName} department ?`}</p>
                        <div className="delete-employee-button-group flex gap-2">
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-red-700 border-red-700 hover:bg-transparent hover:text-red-700" onClick={() => RemoveEmployee(EmployeeID)}>Remove</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button className="btn-sm btn-blue-700 text-md border-2 min-[250px]:px-2 min-[250px]:py-1 sm:px-1 sm:py-0.5 xl:px-2 xl:py-1 rounded-md bg-green-700 border-green-700 hover:bg-transparent hover:text-green-700">Cancel</Button>
                            </DialogClose>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}


export const EditEmployeeDialogBox = ({ EmployeeID }) => {
    const HREmployeesState = useSelector((state) => state.HREmployeesPageReducer)
    const dispatch = useDispatch()
    const { toast } = useToast()
    
    // Sync with employee page
    
    const FetchEmployeeData = (EmID) => {
        const employee = HREmployeesState.data.find((item) => item._id === EmID)
        return employee
    }
    
    const employeeData = FetchEmployeeData(EmployeeID)
    
    const [formdata, setformdata] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        employeeId: "",
        position: "",
        joiningDate: "",
        employmentType: "Full-time",
        workLocation: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
    })
    
    const [isOpen, setIsOpen] = useState(false)
    
    useEffect(() => {
        if (employeeData && isOpen) {
            setformdata({
                firstname: employeeData.firstname || "",
                lastname: employeeData.lastname || "",
                email: employeeData.email || "",
                contactnumber: employeeData.contactnumber || "",
                employeeId: employeeData.employeeId || "",
                position: employeeData.position || "",
                joiningDate: employeeData.joiningDate ? employeeData.joiningDate.split('T')[0] : "",
                employmentType: employeeData.employmentType || "Full-time",
                workLocation: employeeData.workLocation || "",
                dateOfBirth: employeeData.dateOfBirth ? employeeData.dateOfBirth.split('T')[0] : "",
                gender: employeeData.gender || "",
                address: employeeData.address || "",
                emergencyContactName: employeeData.emergencyContact?.name || "",
                emergencyContactRelationship: employeeData.emergencyContact?.relationship || "",
                emergencyContactPhone: employeeData.emergencyContact?.phone || "",
            })
        }
    }, [employeeData, isOpen])

    // Handle form submission
    const handleSubmitEdit = async (e) => {
      e.preventDefault()
      // Prepare update payload
      const {
        dateOfBirth,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
        ...rest
      } = formdata
      const updatePayload = {
        ...rest,
        // Cast date string to Date
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        // Nested emergencyContact object
        emergencyContact: {
          name: emergencyContactName || null,
          relationship: emergencyContactRelationship || null,
          phone: emergencyContactPhone || null
        }
      }
      const result = await dispatch(HandlePatchHREmployees({ 
        apiroute: `UPDATE.${EmployeeID}`, 
        data: updatePayload 
      }))
      if (result.type.includes('fulfilled')) {
        toast({ title: 'Success', description: 'Employee updated successfully' })
        setIsOpen(false)
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
        dispatch(fetchEmployeesIDs())
      } else {
        toast({ title: 'Error', description: 'Failed to update employee', variant: 'destructive' })
      }
    }

    const handleformchange = (event) => {
        CommonStateHandler(formdata, setformdata, event)
    }
    
    return (
        <div className="EditEmployee-content">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600">Edit</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                     <form onSubmit={handleSubmitEdit} className="edit-employee-container flex flex-col gap-5">
                         {/* Basic Information */}
                         <div className="section">
                             <h3 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h3>
                             <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                                 <div className="form-group flex flex-col gap-3">
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-firstname" className="md:text-md lg:text-lg font-bold">First Name</label>
                                         <input type="text"
                                             id="edit-firstname"
                                             className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="firstname"
                                             value={formdata.firstname}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-lastname" className="md:text-md lg:text-lg font-bold">Last Name</label>
                                         <input type="text"
                                             id="edit-lastname"
                                             className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="lastname"
                                             value={formdata.lastname}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-email" className="md:text-md lg:text-lg font-bold">Email</label>
                                         <input type="email"
                                             id="edit-email" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="email"
                                             value={formdata.email}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-contactnumber" className="md:text-md lg:text-lg font-bold">Contact Number</label>
                                         <input type="text"
                                             id="edit-contactnumber" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="contactnumber"
                                             value={formdata.contactnumber}
                                             onChange={handleformchange} />
                                     </div>
                                 </div>
                                 <div className="form-group flex flex-col gap-3">
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-dateOfBirth" className="md:text-md lg:text-lg font-bold">Date of Birth</label>
                                         <input type="date"
                                             id="edit-dateOfBirth" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="dateOfBirth"
                                             value={formdata.dateOfBirth}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-gender" className="md:text-md lg:text-lg font-bold">Gender</label>
                                         <select
                                             id="edit-gender" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="gender"
                                             value={formdata.gender}
                                             onChange={handleformchange}>
                                             <option value="">Select Gender</option>
                                             <option value="Male">Male</option>
                                             <option value="Female">Female</option>
                                             <option value="Other">Other</option>
                                         </select>
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-address" className="md:text-md lg:text-lg font-bold">Address</label>
                                         <input type="text"
                                             id="edit-address" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="address"
                                             value={formdata.address}
                                             onChange={handleformchange} />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Employment Information */}
                         <div className="section">
                             <h3 className="font-semibold text-lg mb-3 text-blue-700">Employment Information</h3>
                             <div className="form-container grid md:grid-cols-2 min-[250px]:grid-cols-1 gap-4">
                                 <div className="form-group flex flex-col gap-3">
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-employeeId" className="md:text-md lg:text-lg font-bold">Employee ID</label>
                                         <input type="text"
                                             id="edit-employeeId" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="employeeId"
                                             value={formdata.employeeId}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-position" className="md:text-md lg:text-lg font-bold">Position</label>
                                         <input type="text"
                                             id="edit-position" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="position"
                                             value={formdata.position}
                                             onChange={handleformchange} />
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-joiningDate" className="md:text-md lg:text-lg font-bold">Joining Date</label>
                                         <input type="date"
                                             id="edit-joiningDate" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="joiningDate"
                                             value={formdata.joiningDate}
                                             onChange={handleformchange} />
                                     </div>
                                 </div>
                                 <div className="form-group flex flex-col gap-3">
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-employmentType" className="md:text-md lg:text-lg font-bold">Employment Type</label>
                                         <select
                                             id="edit-employmentType" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="employmentType"
                                             value={formdata.employmentType}
                                             onChange={handleformchange}>
                                             <option value="Full-time">Full-time</option>
                                             <option value="Part-time">Part-time</option>
                                             <option value="Contract">Contract</option>
                                             <option value="Intern">Intern</option>
                                         </select>
                                     </div>
                                     <div className="label-input-field flex flex-col gap-1">
                                         <label htmlFor="edit-workLocation" className="md:text-md lg:text-lg font-bold">Work Location</label>
                                         <input type="text"
                                             id="edit-workLocation" className="border-2 border-gray-700 rounded px-2 py-1"
                                             name="workLocation"
                                             value={formdata.workLocation}
                                             onChange={handleformchange} />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Emergency Contact */}
                         <div className="section">
                             <h3 className="font-semibold text-lg mb-3 text-blue-700">Emergency Contact</h3>
                             <div className="form-container grid md:grid-cols-3 min-[250px]:grid-cols-1 gap-4">
                                 <div className="label-input-field flex flex-col gap-1">
                                     <label htmlFor="edit-emergencyContactName" className="md:text-md lg:text-lg font-bold">Contact Name</label>
                                     <input type="text"
                                         id="edit-emergencyContactName" className="border-2 border-gray-700 rounded px-2 py-1"
                                         name="emergencyContactName"
                                         value={formdata.emergencyContactName}
                                         onChange={handleformchange} />
                                 </div>
                                 <div className="label-input-field flex flex-col gap-1">
                                     <label htmlFor="edit-emergencyContactRelationship" className="md:text-md lg:text-lg font-bold">Relationship</label>
                                     <input type="text"
                                         id="edit-emergencyContactRelationship" className="border-2 border-gray-700 rounded px-2 py-1"
                                         name="emergencyContactRelationship"
                                         value={formdata.emergencyContactRelationship}
                                         onChange={handleformchange} />
                                 </div>
                                 <div className="label-input-field flex flex-col gap-1">
                                     <label htmlFor="edit-emergencyContactPhone" className="md:text-md lg:text-lg font-bold">Contact Phone</label>
                                     <input type="text"
                                         id="edit-emergencyContactPhone" className="border-2 border-gray-700 rounded px-2 py-1"
                                         name="emergencyContactPhone"
                                         value={formdata.emergencyContactPhone}
                                         onChange={handleformchange} />
                                 </div>
                             </div>
                         </div>
                         
                         {/* Actions */}
                         <div className="flex justify-end gap-2 pt-4">
                           <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                           <Button type="submit" variant="primary">Save Changes</Button>
                         </div>
                       </form>
                 </DialogContent>
             </Dialog>
         </div>
     )
 }