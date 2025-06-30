import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  Users, 
  Clock, 
  Calendar, 
  Settings, 
  Calculator, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Filter,
  TrendingUp,
  Award,
  Target,
  CreditCard
} from 'lucide-react';

const ProfessionalSalaryPage = () => {
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    employeeID: '',
    hourlyRate: 17.20,
    taxRate: 5,
    paymentFrequency: 'bi-weekly',
    autoPayment: true,
    startDate: '',
    bonusPercentage: 0,
    deductionPercentage: 0,
    basicpay: 0,
    status: 'Pending',
    duedate: ''
  });

  // Settings state
  const [globalSettings, setGlobalSettings] = useState({
    defaultHourlyRate: 17.20,
    defaultTaxRate: 5,
    autoPaymentEnabled: true,
    paymentDays: ['Thursday'],
    overtimeRate: 25.80,
    holidayRate: 34.40
  });

  // Notification function
  const showNotification = (title, description, type = 'success') => {
    // Simple notification for now - you can replace with a proper toast library
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-xl z-50 transform transition-all duration-300`;
    notification.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm opacity-90">${description}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('HRtoken');
    if (!token) {
      showNotification("Authentication Error", "Please log in again", "error");
      return null;
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Load initial data
  useEffect(() => {
    loadSalaryData();
    loadEmployees();
    loadGlobalSettings();
  }, []);

  const loadSalaryData = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('http://localhost:5001/api/v1/salary/all', headers);
      if (response.data.success) {
        setSalaries(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading salary data:', error);
      showNotification("Error", "Failed to load salary data", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.get('http://localhost:5001/api/v1/employee/all-employees-ids', headers);
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadGlobalSettings = () => {
    const saved = localStorage.getItem('salarySettings');
    if (saved) {
      setGlobalSettings({ ...globalSettings, ...JSON.parse(saved) });
    }
  };

  // Calculate salary based on work hours
  const calculateSalaryFromAttendance = async (employeeId, startDate, endDate) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return null;

      const response = await axios.get(
        `http://localhost:5001/api/v1/attendance/employee-history/${employeeId}?startDate=${startDate}&endDate=${endDate}`,
        headers
      );

      if (response.data.success) {
        const attendanceRecords = response.data.data;
        let totalHours = 0;
        let overtimeHours = 0;

        attendanceRecords.forEach(record => {
          if (record.workHours) {
            if (record.workHours > 8) {
              totalHours += 8;
              overtimeHours += record.workHours - 8;
            } else {
              totalHours += record.workHours;
            }
          }
        });

        const regularPay = totalHours * globalSettings.defaultHourlyRate;
        const overtimePay = overtimeHours * globalSettings.overtimeRate;
        const grossPay = regularPay + overtimePay;
        const taxDeduction = (grossPay * globalSettings.defaultTaxRate) / 100;
        const netPay = grossPay - taxDeduction;

        return {
          totalHours,
          overtimeHours,
          regularPay,
          overtimePay,
          grossPay,
          taxDeduction,
          netPay
        };
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      return null;
    }
  };

  // Get next payment date (every 2 weeks on Thursday)
  const getNextPaymentDate = () => {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    
    if (daysUntilThursday === 0) {
      nextThursday.setDate(today.getDate() + 14);
    } else if (daysUntilThursday < 14) {
      nextThursday.setDate(today.getDate() + daysUntilThursday + 14);
    }
    
    return nextThursday.toISOString().split('T')[0];
  };

  // Process automatic payroll for all employees
  const processAutomaticPayroll = async () => {
    setProcessing(true);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const processedEmployees = [];
      
      for (const employee of employees) {
        // Calculate 2-week period
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 13);

        const salaryCalc = await calculateSalaryFromAttendance(
          employee._id,
          startDate.toISOString(),
          endDate.toISOString()
        );

        if (salaryCalc && salaryCalc.totalHours > 0) {
          const salaryData = {
            employeeID: employee._id,
            basicpay: salaryCalc.grossPay,
            bonusePT: 0,
            deductionPT: globalSettings.defaultTaxRate,
            duedate: getNextPaymentDate(),
            currency: 'USD',
            status: 'Auto-Generated',
            workHours: salaryCalc.totalHours,
            overtimeHours: salaryCalc.overtimeHours,
            hourlyRate: globalSettings.defaultHourlyRate,
            paymentType: 'Auto-Payroll'
          };

          try {
            const response = await axios.post('http://localhost:5001/api/v1/salary/create', salaryData, headers);
            if (response.data.success) {
              processedEmployees.push({
                name: `${employee.firstname} ${employee.lastname}`,
                amount: salaryCalc.netPay,
                hours: salaryCalc.totalHours
              });
            }
          } catch (error) {
            console.error(`Error processing payroll for ${employee.firstname}:`, error);
          }
        }
      }

      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll for ${processedEmployees.length} employees`
      });

      setIsPayrollDialogOpen(false);
      loadSalaryData();
      
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Payroll Error",
        description: "Failed to process automatic payroll",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Update salary record
  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const updateData = {
        salaryID: currentSalary._id,
        basicpay: formData.basicpay,
        bonusePT: formData.bonusPercentage,
        deductionPT: formData.deductionPercentage,
        duedate: formData.duedate,
        currency: 'USD',
        status: formData.status
      };

      const response = await axios.patch('http://localhost:5001/api/v1/salary/update', updateData, headers);

      if (response.data.success) {
        toast({
          title: "Salary Updated",
          description: "Salary record has been updated successfully"
        });
        setIsUpdateDialogOpen(false);
        loadSalaryData();
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update salary record",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Delete salary record
  const handleDeleteSalary = async (salaryId) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.delete(`http://localhost:5001/api/v1/salary/delete/${salaryId}`, headers);

      if (response.data.success) {
        toast({
          title: "Salary Deleted",
          description: "Salary record has been deleted successfully"
        });
        loadSalaryData();
      }
    } catch (error) {
      console.error('Error deleting salary:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete salary record",
        variant: "destructive"
      });
    }
  };

  // Save global settings
  const saveGlobalSettings = () => {
    localStorage.setItem('salarySettings', JSON.stringify(globalSettings));
    toast({
      title: "Settings Saved",
      description: "Global salary settings have been updated"
    });
    setIsSettingsDialogOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employeeID: '',
      hourlyRate: globalSettings.defaultHourlyRate,
      taxRate: globalSettings.defaultTaxRate,
      paymentFrequency: 'bi-weekly',
      autoPayment: true,
      startDate: '',
      bonusPercentage: 0,
      deductionPercentage: 0
    });
  };

  // Open update dialog
  const openUpdateDialog = (salary) => {
    setCurrentSalary(salary);
    setFormData({
      ...formData,
      basicpay: salary.basicpay,
      bonusPercentage: salary.bonuses ? ((salary.bonuses / salary.basicpay) * 100) : 0,
      deductionPercentage: salary.deductions ? ((salary.deductions / salary.basicpay) * 100) : 0,
      duedate: salary.duedate ? new Date(salary.duedate).toISOString().split('T')[0] : '',
      status: salary.status
    });
    setIsUpdateDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'auto-generated': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salary management...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex">
        <div className="sidebar-container">
          <HRdashboardSidebar />
        </div>
        
        <div className="flex-1 p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
                  💰 Professional Salary Management
                </h1>
                <p className="text-gray-600 dark:text-neutral-400 mt-2">
                  Automated payroll system with hourly calculations and tax management
                </p>
              </div>
              
              <div className="flex gap-3">
                {/* Settings Dialog */}
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Global Salary Settings</DialogTitle>
                      <DialogDescription>
                        Configure default rates and payment settings
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
                          <Input
                            id="defaultHourlyRate"
                            type="number"
                            step="0.01"
                            value={globalSettings.defaultHourlyRate}
                            onChange={(e) => setGlobalSettings({
                              ...globalSettings,
                              defaultHourlyRate: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="defaultTaxRate">Tax Rate (%)</Label>
                          <Input
                            id="defaultTaxRate"
                            type="number"
                            step="0.1"
                            value={globalSettings.defaultTaxRate}
                            onChange={(e) => setGlobalSettings({
                              ...globalSettings,
                              defaultTaxRate: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
                          <Input
                            id="overtimeRate"
                            type="number"
                            step="0.01"
                            value={globalSettings.overtimeRate}
                            onChange={(e) => setGlobalSettings({
                              ...globalSettings,
                              overtimeRate: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="holidayRate">Holiday Rate ($)</Label>
                          <Input
                            id="holidayRate"
                            type="number"
                            step="0.01"
                            value={globalSettings.holidayRate}
                            onChange={(e) => setGlobalSettings({
                              ...globalSettings,
                              holidayRate: parseFloat(e.target.value)
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={saveGlobalSettings}>Save Settings</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Auto Payroll Dialog */}
                <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Auto Payroll
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Automatic Payroll</DialogTitle>
                      <DialogDescription>
                        This will automatically calculate and create salary records for all employees based on their attendance data from the last 2 weeks.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Payroll Details:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Hourly Rate: ${globalSettings.defaultHourlyRate}/hour</li>
                          <li>• Overtime Rate: ${globalSettings.overtimeRate}/hour (after 8 hours/day)</li>
                          <li>• Tax Deduction: {globalSettings.defaultTaxRate}%</li>
                          <li>• Payment Date: Every Thursday (bi-weekly)</li>
                          <li>• Calculation Period: Last 14 days</li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPayrollDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={processAutomaticPayroll}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing ? 'Processing...' : 'Process Payroll'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Create Salary Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Create Salary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Salary Record</DialogTitle>
                      <DialogDescription>
                        Configure salary settings for an employee. Hours will be calculated automatically from attendance.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSalary}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="employeeID">Employee</Label>
                            <Select value={formData.employeeID} onValueChange={(value) => setFormData({...formData, employeeID: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((employee) => (
                                  <SelectItem key={employee._id} value={employee._id}>
                                    {employee.firstname} {employee.lastname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="startDate">Pay Period Start</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <Input
                              id="hourlyRate"
                              type="number"
                              step="0.01"
                              value={formData.hourlyRate}
                              onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="bonusPercentage">Bonus (%)</Label>
                            <Input
                              id="bonusPercentage"
                              type="number"
                              step="0.1"
                              value={formData.bonusPercentage}
                              onChange={(e) => setFormData({...formData, bonusPercentage: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="deductionPercentage">Extra Deduction (%)</Label>
                            <Input
                              id="deductionPercentage"
                              type="number"
                              step="0.1"
                              value={formData.deductionPercentage}
                              onChange={(e) => setFormData({...formData, deductionPercentage: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Automatic Calculation Info:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Work hours will be calculated from attendance records</li>
                            <li>• Overtime (>8 hours/day) paid at 1.5x rate</li>
                            <li>• Tax deduction: {globalSettings.defaultTaxRate}%</li>
                            <li>• Next payment date: {getNextPaymentDate()}</li>
                          </ul>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={processing || !formData.employeeID || !formData.startDate}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {processing ? 'Creating...' : 'Create Salary'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Total Salaries</p>
                      <p className="text-2xl font-bold">{salaries.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Total Payroll</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(salaries.reduce((sum, salary) => sum + (salary.netpay || 0), 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Pending Payments</p>
                      <p className="text-2xl font-bold">
                        {salaries.filter(s => s.status === 'Pending' || s.status === 'Scheduled').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-neutral-400">Next Payment</p>
                      <p className="text-lg font-bold">{getNextPaymentDate()}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Salary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Records</CardTitle>
              <CardDescription>
                Manage employee salary records with automatic calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.length > 0 ? (
                    salaries.map((salary) => (
                      <TableRow key={salary._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {salary.employee?.firstname} {salary.employee?.lastname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {salary.employee?.department?.name || 'No Department'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{salary.workHours || 0}h regular</div>
                            {salary.overtimeHours > 0 && (
                              <div className="text-orange-600">{salary.overtimeHours}h overtime</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(salary.basicpay)}</TableCell>
                        <TableCell>{formatCurrency(salary.deductions)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(salary.netpay)}</TableCell>
                        <TableCell>
                          {salary.duedate ? new Date(salary.duedate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(salary.status)}>
                            {salary.status || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openUpdateDialog(salary)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteSalary(salary._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No salary records found</p>
                          <p className="text-sm">Create your first salary record to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Update Dialog */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Salary Record</DialogTitle>
                <DialogDescription>
                  Modify the salary details for this employee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSalary}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="basicpay">Basic Pay ($)</Label>
                      <Input
                        id="basicpay"
                        type="number"
                        step="0.01"
                        value={formData.basicpay || ''}
                        onChange={(e) => setFormData({...formData, basicpay: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="duedate">Due Date</Label>
                    <Input
                      id="duedate"
                      type="date"
                      value={formData.duedate || ''}
                      onChange={(e) => setFormData({...formData, duedate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Salary'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfessionalSalaryPage;
