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
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Award, 
  CreditCard, 
  PiggyBank,
  Receipt,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading salary information...</p>
        </div>
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="min-h-screen p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Salary Information</h1>
          <p className="text-gray-300 text-lg mt-2">View your salary details and payment history</p>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-6">💰</div>
          <h3 className="text-2xl font-bold text-white mb-4">No Salary Information Available</h3>
          <p className="text-gray-300 text-lg">Your salary information has not been set up yet. Please contact HR for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <DollarSign className="w-10 h-10 text-green-400" />
          My Salary Information
        </h1>
        <p className="text-gray-300 text-lg mt-2">View your salary details and payment history</p>
      </div>

      {/* Current Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Monthly Salary</h3>
              <p className="text-gray-400 text-xs">Gross monthly pay</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {formatCurrency(salaryData.basicpay)}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Annual Salary</h3>
              <p className="text-gray-400 text-xs">Total yearly compensation</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {formatCurrency(calculateAnnualSalary(salaryData.basicpay))}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Bonuses</h3>
              <p className="text-gray-400 text-xs">Monthly bonuses</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {formatCurrency(salaryData.bonuses || 0)}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-300 text-sm font-medium">Net Salary</h3>
              <p className="text-gray-400 text-xs">Take-home pay</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <PiggyBank className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-400">
            {formatCurrency(salaryData.netpay)}
          </div>
        </div>

      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Earnings Breakdown */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Earnings Breakdown
            </h2>
            <p className="text-gray-300">Monthly earnings components</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="font-medium text-gray-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Basic Salary
              </span>
              <span className="text-white font-bold">{formatCurrency(salaryData.basicpay)}</span>
            </div>
            
            {salaryData.bonuses > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="font-medium text-gray-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Bonuses
                </span>
                <span className="text-white font-bold">{formatCurrency(salaryData.bonuses)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3 font-bold text-lg border-t-2 border-green-400/30 bg-green-500/10 rounded-xl px-4">
              <span className="text-green-300">Gross Salary</span>
              <span className="text-green-300">{formatCurrency(
                (salaryData.basicpay || 0) + (salaryData.bonuses || 0)
              )}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-red-400" />
              Deductions
            </h2>
            <p className="text-gray-300">Monthly deductions</p>
          </div>
          
          <div className="space-y-4">
            {salaryData.deductions > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="font-medium text-gray-200 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Total Deductions
                </span>
                <span className="text-red-400 font-bold">-{formatCurrency(salaryData.deductions)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3 font-bold text-lg border-t-2 border-red-400/30 bg-red-500/10 rounded-xl px-4">
              <span className="text-red-300">Total Deductions</span>
              <span className="text-red-300">-{formatCurrency(salaryData.deductions || 0)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Salary Information
            </h2>
            <p className="text-gray-300">Additional details</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Due Date
              </span>
              <span className="font-medium text-white">
                {moment(salaryData.duedate).format('MMM DD, YYYY')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Payment Status
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                salaryData.status === 'Paid' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                salaryData.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {salaryData.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Currency
              </span>
              <span className="font-medium text-white">{salaryData.currency}</span>
            </div>
            {salaryData.paymentdate && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Payment Date
                </span>
                <span className="font-medium text-white">
                  {moment(salaryData.paymentdate).format('MMM DD, YYYY')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Annual Summary
            </h2>
            <p className="text-gray-300">Year-to-date information</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">YTD Gross</span>
              <span className="font-medium text-green-400">
                {formatCurrency(calculateAnnualSalary(salaryData.basicpay))}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">YTD Deductions</span>
              <span className="font-medium text-red-400">
                -{formatCurrency((salaryData.deductions || 0) * 12)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-white/10 pt-4">
              <span className="text-gray-300 font-bold">YTD Net</span>
              <span className="font-bold text-white text-lg">
                {formatCurrency(calculateAnnualSalary(salaryData.netpay))}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Salary History */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Salary History
          </h2>
          <p className="text-gray-300">Your salary changes over time</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-200 font-semibold">Due Date</TableHead>
                <TableHead className="text-gray-200 font-semibold">Basic Salary</TableHead>
                <TableHead className="text-gray-200 font-semibold">Bonuses</TableHead>
                <TableHead className="text-gray-200 font-semibold">Deductions</TableHead>
                <TableHead className="text-gray-200 font-semibold">Net Salary</TableHead>
                <TableHead className="text-gray-200 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.length > 0 ? (
                salaryHistory.map((salary) => (
                  <TableRow key={salary._id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="text-white">
                      {moment(salary.duedate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatCurrency(salary.basicpay)}
                    </TableCell>
                    <TableCell className="text-purple-400 font-medium">
                      {formatCurrency(salary.bonuses || 0)}
                    </TableCell>
                    <TableCell className="text-red-400 font-medium">
                      -{formatCurrency(salary.deductions || 0)}
                    </TableCell>
                    <TableCell className="text-green-400 font-bold">
                      {formatCurrency(salary.netpay)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        salary.status === 'Paid' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        salary.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {salary.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/10">
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No salary history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSalary;
