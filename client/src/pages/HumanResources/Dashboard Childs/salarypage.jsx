import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createSelector } from "@reduxjs/toolkit"
import * as Dialog from "@radix-ui/react-dialog"
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import LoadingBar from "react-top-loading-bar"
import { HandleGetHRSalaries, HandlePostHRSalaries, HandlePatchHRSalaries, HandleDeleteHRSalaries } from "../../../redux/Thunks/HRSalaryThunk"
import { fetchEmployeesIDs } from "../../../redux/Thunks/EmployeesIDsThunk"
import { Loading } from "../../../components/common/loading.jsx"
// Import SidebarProvider along with HRdashboardSidebar
import { HRdashboardSidebar } from "../../../components/ui/HRsidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Memoized selectors to prevent unnecessary re-renders
const selectSalaryState = createSelector(
  [(state) => state.HRSalaryPageReducer],
  (salaryState) => salaryState || {}
);

const selectEmployeesState = createSelector(
  [
    (state) => state.EMployeesIDReducer,
    (state) => state.EmployeesIDsReducer,
    (state) => state.HREmployeesIDsReducer
  ],
  (emReducer, employeesReducer, hrEmployeesReducer) => 
    emReducer || employeesReducer || hrEmployeesReducer || {}
);

export const HRSalaryPage = () => {
  const dispatch = useDispatch();
  const salaryState = useSelector(selectSalaryState);
  const employeesState = useSelector(selectEmployeesState);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [formData, setFormData] = useState({
    employeeID: "",
    basicpay: "",
    bonusePT: "",
    deductionPT: "",
    duedate: "",
    currency: "USD",
    status: "Pending"
  });

  useEffect(() => {
    dispatch(HandleGetHRSalaries({ apiroute: "GETALL" }));
    dispatch(fetchEmployeesIDs());
  }, [dispatch]);

  useEffect(() => {
    if (salaryState.success?.status) {
      setIsCreateDialogOpen(false);
      setIsUpdateDialogOpen(false);
      setFormData({
        employeeID: "",
        basicpay: "",
        bonusePT: "",
        deductionPT: "",
        duedate: "",
        currency: "USD",
        status: "Pending"
      });
      dispatch(HandleGetHRSalaries({ apiroute: "GETALL" }));
    }
  }, [salaryState.success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Setting ${name} to:`, value); // Add for debugging
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitCreate = (e) => {
    e.preventDefault();
    dispatch(HandlePostHRSalaries({
      apiroute: "CREATE",
      data: formData
    }));
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    dispatch(HandlePatchHRSalaries({
      apiroute: "UPDATE",
      data: {
        salaryID: currentSalary._id,
        ...formData
      }
    }));
  };

  const handleDelete = (salaryID) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      dispatch(HandleDeleteHRSalaries({
        apiroute: salaryID
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const openUpdateDialog = (salary) => {
    setCurrentSalary(salary);
    setFormData({
      employeeID: salary.employee?._id || "",
      basicpay: salary.basicpay || "",
      bonusePT: salary.basicpay ? ((salary.bonuses || 0) / salary.basicpay) * 100 : 0,
      deductionPT: salary.basicpay ? ((salary.deductions || 0) / salary.basicpay) * 100 : 0,
      duedate: salary.duedate ? new Date(salary.duedate).toISOString().split('T')[0] : "",
      currency: salary.currency || "USD",
      status: salary.status || "Pending"
    });
    setIsUpdateDialogOpen(true);
  };
  if (salaryState.isLoading) {
    return <Loading />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex">
        <div className="sidebar-container">
          <HRdashboardSidebar />
        </div>
        <div className="salary-page-content w-full mx-auto my-10 flex flex-col gap-5 px-4">
          <div className="salary-heading flex justify-between items-center md:pe-5">
            <h1 className="min-[250px]:text-xl md:text-4xl font-bold">Salary Management</h1>
            <div className="salary-create-button">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create New Salary
              </Button>
            </div>
          </div>

          {/* Salary List */}
          <div className="salary-table bg-white p-5 rounded-lg shadow">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="salary table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Basic Pay</TableCell>
                    <TableCell>Bonuses</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Pay</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryState.data && salaryState.data.length > 0 ? (
                    salaryState.data.map((salary) => (
                      <TableRow key={salary._id}>
                        <TableCell>{salary.employee?.firstname || 'Unknown'} {salary.employee?.lastname || ''}</TableCell>
                        <TableCell>{salary.basicpay || 0}</TableCell>
                        <TableCell>{salary.bonuses || 0}</TableCell>
                        <TableCell>{salary.deductions || 0}</TableCell>
                        <TableCell>{salary.netpay || 0}</TableCell>
                        <TableCell>{salary.currency || 'USD'}</TableCell>
                        <TableCell>{salary.duedate ? formatDate(salary.duedate) : 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            salary.status === "Paid" 
                              ? "bg-green-100 text-green-800" 
                              : salary.status === "Delayed" 
                              ? "bg-red-100 text-red-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {salary.status || 'Pending'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="small" variant="outlined" onClick={() => openUpdateDialog(salary)}>
                              Edit
                            </Button>
                            <Button size="small" variant="contained" color="error" onClick={() => handleDelete(salary._id)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No salary records found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Create Salary Dialog */}
          <Dialog.Root open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[90vh] w-[95vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg overflow-y-auto">
                <Dialog.Title className="text-xl font-bold mb-2">Create New Salary</Dialog.Title>
                <Dialog.Description className="text-gray-600 mb-4">
                  Enter the details for the new salary record.
                </Dialog.Description>
                
                <form onSubmit={handleSubmitCreate} className="grid gap-3 py-2">
              
                <div className="employee-selection mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee*
                  </label>
                  <div className="employee-buttons grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded">
                    {employeesState?.data ? (
                      employeesState.data.map((employee) => (
                        <button
                          key={employee._id}
                          type="button"
                          className={`p-2 text-left text-sm rounded transition-colors ${
                            formData.employeeID === employee._id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              employeeID: employee._id
                            });
                          }}
                        >
                          {employee.firstname} {employee.lastname}
                        </button>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">Loading employees...</div>
                    )}
                  </div>
                  {formData.employeeID ? (
                    <div className="mt-1 text-sm text-green-600">
                      ✓ Employee selected
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-red-500">
                      Please select an employee
                    </div>
                  )}
                </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      id="basicpay"
                      name="basicpay"
                      label="Basic Pay"
                      type="number"
                      value={formData.basicpay}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />

                    <div className="currency-selection">
                      <InputLabel id="currency-select-label" className="text-sm mb-1">Currency</InputLabel>
                      <Select
                        labelId="currency-select-label"
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                        <MenuItem value="INR">INR</MenuItem>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      id="bonusePT"
                      name="bonusePT"
                      label="Bonus (%)"
                      type="number"
                      value={formData.bonusePT}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />

                    <TextField
                      id="deductionPT"
                      name="deductionPT"
                      label="Deduction (%)"
                      type="number"
                      value={formData.deductionPT}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />
                  </div>

                  <TextField
                    id="duedate"
                    name="duedate"
                    label="Due Date"
                    type="date"
                    value={formData.duedate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                  <div className="flex justify-end mt-4 gap-2">
                    <Button 
                      type="button" 
                      variant="outlined" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                    >
                      Create Salary
                    </Button>
                  </div>
                </form>
                
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    X
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Update Salary Dialog */}
          <Dialog.Root open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[90vh] w-[95vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg overflow-y-auto">
                <Dialog.Title className="text-xl font-bold mb-2">Update Salary</Dialog.Title>
                <Dialog.Description className="text-gray-600 mb-4">
                  Update the details for this salary record.
                </Dialog.Description>
                
                <form onSubmit={handleSubmitUpdate} className="grid gap-3 py-2">
                  <div className="employee-selection mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee* (Selected)
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-300 rounded">
                      {employeesState?.data ? (
                        (() => {
                          const selectedEmployee = employeesState.data.find(
                            (employee) => employee._id === formData.employeeID
                          );
                          return selectedEmployee ? (
                            <div className="font-medium">
                              {selectedEmployee.firstname} {selectedEmployee.lastname}
                            </div>
                          ) : (
                            <div className="text-gray-500">Employee not found</div>
                          );
                        })()
                      ) : (
                        <div className="text-gray-500">Loading employee details...</div>
                      )}
                    </div>
                  </div>

                  <div className="status-selection mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status*
                    </label>
                    <div className="status-buttons grid grid-cols-3 gap-2">
                      {["Pending", "Paid", "Delayed"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`p-2 text-center text-sm rounded transition-colors ${
                            formData.status === status
                              ? status === "Paid" 
                                ? "bg-green-500 text-white" 
                                : status === "Delayed"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              status: status
                            });
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      id="basicpay-update"
                      name="basicpay"
                      label="Basic Pay"
                      type="number"
                      value={formData.basicpay}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />

                    <div className="currency-selection">
                      <InputLabel id="currency-update-label" className="text-sm mb-1">Currency</InputLabel>
                      <Select
                        labelId="currency-update-label"
                        id="currency-update"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                        <MenuItem value="INR">INR</MenuItem>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TextField
                      id="bonusePT-update"
                      name="bonusePT"
                      label="Bonus (%)"
                      type="number"
                      value={formData.bonusePT}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />

                    <TextField
                      id="deductionPT-update"
                      name="deductionPT"
                      label="Deduction (%)"
                      type="number"
                      value={formData.deductionPT}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      size="small"
                    />
                  </div>

                  <TextField
                    id="duedate-update"
                    name="duedate"
                    label="Due Date"
                    type="date"
                    value={formData.duedate}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />

                  <div className="flex justify-end mt-4 gap-2">
                    <Button 
                      type="button" 
                      variant="outlined" 
                      onClick={() => setIsUpdateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                    >
                      Update Salary
                    </Button>
                  </div>
                </form>
                
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    X
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </SidebarProvider>
  );
};