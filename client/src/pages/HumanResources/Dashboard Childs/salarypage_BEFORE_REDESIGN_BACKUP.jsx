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
import { SidebarProvider } from "@/components/ui/sidebar";
import { Calendar, DollarSign, Users, Clock, Settings, Calculator, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
    paymentFrequency: 'bi-weekly', // weekly, bi-weekly, monthly
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
    overtimeRate: 25.80, // 1.5x regular rate
    holidayRate: 34.40 // 2x regular rate
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
    // Load from localStorage or database
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

      // Calculate dates for bi-weekly payment
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 13); // 2 weeks

      // Calculate salary based on attendance
      const salaryCalc = await calculateSalaryFromAttendance(
        formData.employeeID,
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (!salaryCalc) {
        toast({
          title: "Calculation Error",
          description: "Unable to calculate salary from attendance data",
          variant: "destructive"
        });
        return;
      }

      // Add bonuses and additional deductions
      const bonusAmount = (salaryCalc.grossPay * formData.bonusPercentage) / 100;
      const additionalDeductions = (salaryCalc.grossPay * formData.deductionPercentage) / 100;
      const finalNetPay = salaryCalc.netPay + bonusAmount - additionalDeductions;

      const salaryData = {
        employeeID: formData.employeeID,
        basicpay: salaryCalc.grossPay,
        bonusePT: formData.bonusPercentage,
        deductionPT: globalSettings.defaultTaxRate + formData.deductionPercentage,
        duedate: getNextPaymentDate(),
        currency: 'USD',
        status: formData.autoPayment ? 'Scheduled' : 'Pending',
        workHours: salaryCalc.totalHours,
        overtimeHours: salaryCalc.overtimeHours,
        hourlyRate: globalSettings.defaultHourlyRate,
        paymentType: 'Auto-calculated'
      };

      const response = await axios.post('http://localhost:5001/api/v1/salary/create', salaryData, headers);

      if (response.data.success) {
        toast({
          title: "Salary Created",
          description: `Salary record created for $${finalNetPay.toFixed(2)} net pay`
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

  // Get next payment date (every 2 weeks on Thursday)
  const getNextPaymentDate = () => {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7; // Thursday is day 4
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    
    // If today is Thursday, get next Thursday (14 days from now)
    if (daysUntilThursday === 0) {
      nextThursday.setDate(today.getDate() + 14);
    } else if (daysUntilThursday < 14) {
      // If within 2 weeks, use the next bi-weekly Thursday
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
      <div className="flex w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-slate-900">
        <div className="sidebar-container">
          <HRdashboardSidebar />
        </div>
        
        <div className="flex-1 w-full max-w-none overflow-x-auto">
          <div className="w-full p-8 space-y-8">
            {/* Professional Header */}
            <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/20 shadow-xl p-8">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-emerald-600 dark:from-white dark:via-blue-300 dark:to-emerald-400 bg-clip-text text-transparent">
                        Salary Management System
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-neutral-300 font-medium">
                        Automated payroll processing with real-time calculations and comprehensive tax management
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {/* Settings Dialog */}
                  <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 px-6 py-3 h-auto bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-white/20 dark:border-neutral-700/20 hover:bg-white dark:hover:bg-neutral-700 transition-all duration-200 shadow-lg">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Global Settings</span>
                      </Button>
                    </DialogTrigger>
                {/* Settings Dialog */}
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </DialogTrigger>                    <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
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
                      <Button variant="outline" className="flex items-center gap-2 px-6 py-3 h-auto bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-white/20 dark:border-neutral-700/20 hover:bg-white dark:hover:bg-neutral-700 transition-all duration-200 shadow-lg">
                        <Calculator className="h-5 w-5" />
                        <span className="font-medium">Auto Payroll</span>
                      </Button>
                    </DialogTrigger>
                      Auto Payroll
                    </Button>
                    <DialogContent className="sm:max-w-[700px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
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
                      <Button className="px-6 py-3 h-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg">
                        <DollarSign className="h-5 w-5" />
                        <span>Create Salary Record</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border border-white/20 dark:border-neutral-700/20">
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
                            <li>• Overtime (&gt;8 hours/day) paid at 1.5x rate</li>
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

export default HRSalaryPage;
