import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const EmployeeSalary = () => {
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const { toast } = useToast();

  const user = useSelector((state) => state.employeereducer?.user);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      withCredentials: true
    };
  };

  useEffect(() => {
    if (user?._id) {
      fetchSalaryData();
    }
  }, [user]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/salary/all', getAuthHeaders());
      if (response.data.success) {
        // Filter salary records for current employee
        const employeeSalaries = response.data.salaries.filter(
          salary => salary.employeeId === user._id
        );
        
        // Get current salary (most recent)
        const currentSalary = employeeSalaries
          .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))[0];
        
        setSalaryData(currentSalary);
        setSalaryHistory(employeeSalaries);
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
      toast({
        title: "Error",
        description: "Failed to load salary information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const calculateAnnualSalary = (monthlySalary) => {
    return (monthlySalary || 0) * 12;
  };

  const calculateTakeHome = (grossSalary, deductions = 0) => {
    return grossSalary - deductions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="employee-salary p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Salary Information</h1>
          <p className="text-gray-600 mt-2">View your salary details and payment history</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-medium mb-2">No Salary Information Available</h3>
              <p>Your salary information has not been set up yet. Please contact HR for assistance.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="employee-salary p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Salary Information</h1>
        <p className="text-gray-600 mt-2">View your salary details and payment history</p>
      </div>

      {/* Current Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Salary</CardTitle>
            <CardDescription>Gross monthly pay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(salaryData.basicSalary)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Salary</CardTitle>
            <CardDescription>Total yearly compensation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(calculateAnnualSalary(salaryData.basicSalary))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowances</CardTitle>
            <CardDescription>Monthly allowances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(salaryData.allowances || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Salary</CardTitle>
            <CardDescription>Take-home pay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(calculateTakeHome(
                (salaryData.basicSalary || 0) + (salaryData.allowances || 0),
                salaryData.deductions || 0
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Earnings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>Monthly earnings components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Basic Salary</span>
                <span>{formatCurrency(salaryData.basicSalary)}</span>
              </div>
              
              {salaryData.allowances > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Allowances</span>
                  <span>{formatCurrency(salaryData.allowances)}</span>
                </div>
              )}
              
              {salaryData.overtime > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Overtime</span>
                  <span>{formatCurrency(salaryData.overtime)}</span>
                </div>
              )}
              
              {salaryData.bonus > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Bonus</span>
                  <span>{formatCurrency(salaryData.bonus)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                <span>Gross Salary</span>
                <span>{formatCurrency(
                  (salaryData.basicSalary || 0) + 
                  (salaryData.allowances || 0) + 
                  (salaryData.overtime || 0) + 
                  (salaryData.bonus || 0)
                )}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle>Deductions</CardTitle>
            <CardDescription>Monthly deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salaryData.taxDeductions > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Tax Deductions</span>
                  <span className="text-red-600">-{formatCurrency(salaryData.taxDeductions)}</span>
                </div>
              )}
              
              {salaryData.insurance > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Insurance</span>
                  <span className="text-red-600">-{formatCurrency(salaryData.insurance)}</span>
                </div>
              )}
              
              {salaryData.providentFund > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Provident Fund</span>
                  <span className="text-red-600">-{formatCurrency(salaryData.providentFund)}</span>
                </div>
              )}
              
              {salaryData.otherDeductions > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Other Deductions</span>
                  <span className="text-red-600">-{formatCurrency(salaryData.otherDeductions)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                <span>Total Deductions</span>
                <span className="text-red-600">-{formatCurrency(salaryData.deductions || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
            <CardDescription>Additional details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Effective From</span>
                <span className="font-medium">
                  {moment(salaryData.effectiveDate).format('MMM DD, YYYY')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Frequency</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium">USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">
                  {moment(salaryData.updatedAt).format('MMM DD, YYYY')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Summary</CardTitle>
            <CardDescription>Year-to-date information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">YTD Gross</span>
                <span className="font-medium">
                  {formatCurrency(calculateAnnualSalary(salaryData.basicSalary))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">YTD Deductions</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency((salaryData.deductions || 0) * 12)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">YTD Net</span>
                <span className="font-medium">
                  {formatCurrency(calculateTakeHome(
                    calculateAnnualSalary(salaryData.basicSalary),
                    (salaryData.deductions || 0) * 12
                  ))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Salary History */}
      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
          <CardDescription>Your salary changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effective Date</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.length > 0 ? (
                salaryHistory.map((salary) => (
                  <TableRow key={salary._id}>
                    <TableCell>
                      {moment(salary.effectiveDate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(salary.basicSalary)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(salary.allowances || 0)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(salary.deductions || 0)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(calculateTakeHome(
                        (salary.basicSalary || 0) + (salary.allowances || 0),
                        salary.deductions || 0
                      ))}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No salary history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSalary;
