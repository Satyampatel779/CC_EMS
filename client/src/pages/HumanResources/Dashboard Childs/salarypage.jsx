import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HRdashboardSidebar } from "../../../components/ui/HRsidebar";
import { Calendar, DollarSign, Users, Clock, Settings, Calculator, CheckCircle, XCircle, AlertCircle, TrendingUp, CreditCard } from "lucide-react";

export const HRSalaryPage = () => {
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    employeeID: '',
    hourlyRate: 17.20,
    taxRate: 5,
    paymentFrequency: 'bi-weekly',
    autoPayment: true,
    startDate: '',
    bonusPercentage: 0,
    deductionPercentage: 0
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

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('HRtoken');
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "Failed to load salary data",
        variant: "destructive"
      });
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

  // Create new salary record
  const handleCreateSalary = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + 13);

      const calculatedData = await calculateSalaryFromAttendance(
        formData.employeeID, 
        formData.startDate, 
        endDate.toISOString().split('T')[0]
      );

      if (!calculatedData) {
        toast({
          title: "Calculation Error",
          description: "Could not calculate salary from attendance data",
          variant: "destructive"
        });
        return;
      }

      const salaryData = {
        employeeID: formData.employeeID,
        basicpay: calculatedData.grossPay,
        bonuses: (calculatedData.grossPay * formData.bonusPercentage) / 100,
        deductions: (calculatedData.grossPay * formData.deductionPercentage) / 100,
        netpay: calculatedData.netPay,
        duedate: endDate.toISOString().split('T')[0],
        status: 'Auto-Generated',
        workHours: calculatedData.totalHours,
        overtimeHours: calculatedData.overtimeHours,
        hourlyRate: formData.hourlyRate,
        paymentType: 'bi-weekly'
      };

      const response = await axios.post('http://localhost:5001/api/v1/salary/create', salaryData, headers);

      if (response.data.success) {
        toast({
          title: "Salary Created",
          description: "Salary record has been created successfully"
        });
        setIsCreateDialogOpen(false);
        resetForm();
        loadSalaryData();
      }
    } catch (error) {
      console.error('Error creating salary:', error);
      toast({
        title: "Creation Failed",
        description: error.response?.data?.message || "Failed to create salary record",
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
        basicpay: formData.basicpay,
        bonuses: (formData.basicpay * formData.bonusPercentage) / 100,
        deductions: (formData.basicpay * formData.deductionPercentage) / 100,
        netpay: formData.basicpay + ((formData.basicpay * formData.bonusPercentage) / 100) - ((formData.basicpay * formData.deductionPercentage) / 100),
        duedate: formData.duedate,
        status: formData.status
      };

      const response = await axios.put(`http://localhost:5001/api/v1/salary/update/${currentSalary._id}`, updateData, headers);

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
        description: "Failed to update salary record",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Process automatic payroll for all employees
  const processAutomaticPayroll = async () => {
    setProcessing(true);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 13);

      let successCount = 0;
      let failCount = 0;

      for (const employee of employees) {
        try {
          const calculatedData = await calculateSalaryFromAttendance(
            employee._id,
            startDate.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          );

          if (calculatedData && calculatedData.totalHours > 0) {
            const salaryData = {
              employeeID: employee._id,
              basicpay: calculatedData.grossPay,
              bonuses: 0,
              deductions: calculatedData.taxDeduction,
              netpay: calculatedData.netPay,
              duedate: today.toISOString().split('T')[0],
              status: 'Auto-Generated',
              workHours: calculatedData.totalHours,
              overtimeHours: calculatedData.overtimeHours,
              hourlyRate: globalSettings.defaultHourlyRate,
              paymentType: 'bi-weekly'
            };

            await axios.post('http://localhost:5001/api/v1/salary/create', salaryData, headers);
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing payroll for ${employee.firstname} ${employee.lastname}:`, error);
          failCount++;
        }
      }

      toast({
        title: "Payroll Processed",
        description: `Successfully processed ${successCount} salary records. ${failCount} failed.`
      });

      setIsPayrollDialogOpen(false);
      loadSalaryData();
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: "Payroll Failed",
        description: "Failed to process automatic payroll",
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
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'auto-generated': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'delayed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalRecords = salaries.length;
    const totalPaid = salaries.filter(s => s.status?.toLowerCase() === 'paid').length;
    const totalPending = salaries.filter(s => s.status?.toLowerCase() === 'pending').length;
    const totalAmount = salaries.reduce((sum, s) => sum + (s.netpay || 0), 0);

    return { totalRecords, totalPaid, totalPending, totalAmount };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xl font-medium text-gray-600 dark:text-neutral-300">Loading Salary Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-slate-900 overflow-x-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      {/* Professional Header */}
      <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/20 shadow-xl p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-600 dark:from-white dark:via-blue-300 dark:to-emerald-400 bg-clip-text text-transparent">
                  Salary Management System
                </h1>
                <p className="text-base lg:text-lg text-gray-600 dark:text-neutral-300 font-medium">
                  Automated payroll processing with real-time calculations and comprehensive tax management
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 lg:gap-4 justify-start xl:justify-end">
            {/* Settings Dialog */}
            <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 h-auto bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-white/20 dark:border-neutral-700/20 hover:bg-white dark:hover:bg-neutral-700 transition-all duration-200 shadow-lg">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Global Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Global Salary Settings</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-neutral-400">
                    Configure default rates and payment settings for the entire organization
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultHourlyRate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Default Hourly Rate ($)</Label>
                      <Input
                        id="defaultHourlyRate"
                        type="number"
                        step="0.01"
                        value={globalSettings.defaultHourlyRate}
                        onChange={(e) => setGlobalSettings({
                          ...globalSettings,
                          defaultHourlyRate: parseFloat(e.target.value)
                        })}
                        className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultTaxRate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Tax Rate (%)</Label>
                      <Input
                        id="defaultTaxRate"
                        type="number"
                        step="0.1"
                        value={globalSettings.defaultTaxRate}
                        onChange={(e) => setGlobalSettings({
                          ...globalSettings,
                          defaultTaxRate: parseFloat(e.target.value)
                        })}
                        className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="overtimeRate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Overtime Rate ($)</Label>
                      <Input
                        id="overtimeRate"
                        type="number"
                        step="0.01"
                        value={globalSettings.overtimeRate}
                        onChange={(e) => setGlobalSettings({
                          ...globalSettings,
                          overtimeRate: parseFloat(e.target.value)
                        })}
                        className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holidayRate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Holiday Rate ($)</Label>
                      <Input
                        id="holidayRate"
                        type="number"
                        step="0.01"
                        value={globalSettings.holidayRate}
                        onChange={(e) => setGlobalSettings({
                          ...globalSettings,
                          holidayRate: parseFloat(e.target.value)
                        })}
                        className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={saveGlobalSettings} className="px-8 py-3 h-auto bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 shadow-lg">
                    Save Settings
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Auto Payroll Dialog */}
            <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 h-auto bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-white/20 dark:border-neutral-700/20 hover:bg-white dark:hover:bg-neutral-700 transition-all duration-200 shadow-lg">
                  <Calculator className="h-5 w-5" />
                  <span className="font-medium">Auto Payroll</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] lg:max-w-[900px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Process Automatic Payroll</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-neutral-400">
                    Automatically calculate and create salary records for all employees based on their attendance data from the last 2 weeks.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">Payroll Configuration:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Hourly Rate:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">${globalSettings.defaultHourlyRate}/hour</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Overtime Rate:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">${globalSettings.overtimeRate}/hour</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Tax Deduction:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{globalSettings.defaultTaxRate}%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Payment Schedule:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Bi-weekly (Thursday)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Calculation Period:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Last 14 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Overtime Threshold:</span>
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-100">8 hours/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsPayrollDialogOpen(false)} className="px-6 py-3 h-auto">
                    Cancel
                  </Button>
                  <Button 
                    onClick={processAutomaticPayroll}
                    disabled={processing}
                    className="px-8 py-3 h-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg"
                  >
                    {processing ? 'Processing...' : 'Process Payroll'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Salary Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="px-4 lg:px-6 py-2 lg:py-3 h-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg">
                  <DollarSign className="h-5 w-5" />
                  <span>Create Salary Record</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] lg:max-w-[1000px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create New Salary Record</DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-neutral-400">
                    Configure salary settings for an employee. Work hours will be calculated automatically from attendance records.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSalary}>
                  <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="employeeID" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Employee</Label>
                        <Select value={formData.employeeID} onValueChange={(value) => setFormData({...formData, employeeID: value})}>
                          <SelectTrigger className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600">
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
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Pay Period Start</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          required
                          className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                          className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonusPercentage" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Bonus (%)</Label>
                        <Input
                          id="bonusPercentage"
                          type="number"
                          step="0.1"
                          value={formData.bonusPercentage}
                          onChange={(e) => setFormData({...formData, bonusPercentage: parseFloat(e.target.value)})}
                          className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deductionPercentage" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Deduction (%)</Label>
                        <Input
                          id="deductionPercentage"
                          type="number"
                          step="0.1"
                          value={formData.deductionPercentage}
                          onChange={(e) => setFormData({...formData, deductionPercentage: parseFloat(e.target.value)})}
                          className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }} className="px-6 py-3 h-auto">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="px-8 py-3 h-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg">
                      {processing ? 'Creating...' : 'Create Salary Record'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Records</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRecords}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Paid</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalPaid}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Pending</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalPending}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-neutral-400">Total Amount</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Records Table */}
      <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/20 dark:border-neutral-700/20 shadow-lg w-full">
        <CardHeader className="border-b border-gray-200 dark:border-neutral-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-700 rounded-t-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Salary Records</CardTitle>
              <CardDescription className="text-gray-600 dark:text-neutral-400">
                Manage employee salary records with automatic calculations and payment tracking
              </CardDescription>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-neutral-700">
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Basic Pay</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Hours</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Overtime</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Net Pay</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Due Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white px-4 py-3 text-left w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.length > 0 ? (
                  salaries.map((salary) => (
                    <TableRow key={salary._id} className="border-b border-gray-100 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-all duration-200">
                      <TableCell className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {salary.employeeID?.firstname} {salary.employeeID?.lastname}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-neutral-400">
                          ID: {salary.employeeID?.employeeid}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(salary.basicpay)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{salary.workHours || 0}h</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-orange-600 dark:text-orange-400">{salary.overtimeHours || 0}h</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(salary.netpay)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600 dark:text-neutral-300">
                        {salary.duedate ? new Date(salary.duedate).toLocaleDateString() : 'Not set'}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={`${getStatusColor(salary.status)} font-medium px-3 py-1`}>
                          {salary.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openUpdateDialog(salary)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-xs px-3 py-1"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteSalary(salary._id)}
                            className="hover:bg-red-600 transition-all duration-200 text-xs px-3 py-1"
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
                      <div className="text-gray-500 dark:text-neutral-400 space-y-3">
                        <div className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                          <DollarSign className="h-8 w-8 opacity-50" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">No salary records found</p>
                          <p className="text-sm">Create your first salary record to get started with payroll management</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Update Salary Record</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-neutral-400">
              Modify the salary details for this employee
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSalary}>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="basicpay" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Basic Pay ($)</Label>
                  <Input
                    id="basicpay"
                    type="number"
                    step="0.01"
                    value={formData.basicpay || ''}
                    onChange={(e) => setFormData({...formData, basicpay: parseFloat(e.target.value)})}
                    required
                    className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600">
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
              <div className="space-y-2">
                <Label htmlFor="duedate" className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Due Date</Label>
                <Input
                  id="duedate"
                  type="date"
                  value={formData.duedate || ''}
                  onChange={(e) => setFormData({...formData, duedate: e.target.value})}
                  required
                  className="h-12 bg-white/50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-600"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)} className="px-6 py-3 h-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={processing} className="px-8 py-3 h-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition-all duration-200 shadow-lg">
                {processing ? 'Updating...' : 'Update Salary'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRSalaryPage;
