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
  axios.defaults.baseURL = 'http://localhost:5001';
}

const EmployeeSalary = () => {
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const { toast } = useToast();

  const user = useSelector((state) => state.employeereducer?.user);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('EMtoken') || sessionStorage.getItem('EMtoken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      withCredentials: true
    };
  };

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/salary/employee/my-salary', getAuthHeaders());
      if (response.data.success) {
        const salaries = response.data.salaries || [];
        
        // Get current salary (most recent)
        const currentSalary = salaries
          .sort((a, b) => new Date(b.duedate) - new Date(a.duedate))[0];
        
        setSalaryData(currentSalary);
        setSalaryHistory(salaries);
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
              {formatCurrency(salaryData.basicpay)}
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
              {formatCurrency(calculateAnnualSalary(salaryData.basicpay))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bonuses</CardTitle>
            <CardDescription>Monthly bonuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(salaryData.bonuses || 0)}
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
              {formatCurrency(salaryData.netpay)}
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
                <span>{formatCurrency(salaryData.basicpay)}</span>
              </div>
              
              {salaryData.bonuses > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Bonuses</span>
                  <span>{formatCurrency(salaryData.bonuses)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2">
                <span>Gross Salary</span>
                <span>{formatCurrency(
                  (salaryData.basicpay || 0) + (salaryData.bonuses || 0)
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
              {salaryData.deductions > 0 && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Deductions</span>
                  <span className="text-red-600">-{formatCurrency(salaryData.deductions)}</span>
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
                <span className="text-gray-600">Due Date</span>
                <span className="font-medium">
                  {moment(salaryData.duedate).format('MMM DD, YYYY')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    salaryData.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    salaryData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {salaryData.status}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium">{salaryData.currency}</span>
              </div>
              {salaryData.paymentdate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date</span>
                  <span className="font-medium">
                    {moment(salaryData.paymentdate).format('MMM DD, YYYY')}
                  </span>
                </div>
              )}
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
                  {formatCurrency(calculateAnnualSalary(salaryData.basicpay))}
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
                  {formatCurrency(calculateAnnualSalary(salaryData.netpay))}
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
                <TableHead>Due Date</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Bonuses</TableHead>
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
                      {moment(salary.duedate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(salary.basicpay)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(salary.bonuses || 0)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(salary.deductions || 0)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(salary.netpay)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        salary.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        salary.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {salary.status}
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
