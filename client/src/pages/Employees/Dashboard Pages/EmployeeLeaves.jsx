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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail,
  CalendarDays,
  Plane,
  Heart,
  AlertTriangle,
  FileText,
  BarChart3
} from 'lucide-react';

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5001';
}

const EmployeeLeaves = () => {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    description: ''
  });
  const { toast } = useToast();

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
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/leave/employee/my-leaves', getAuthHeaders());
      if (response.data.success) {
        setLeaves(response.data.leaves || []);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (moment(formData.endDate).isBefore(formData.startDate)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive"
      });
      return;
    }

    try {
      const leaveData = {
        title: formData.leaveType || "Leave Application",
        reason: formData.reason,
        startdate: formData.startDate,
        enddate: formData.endDate,
        type: formData.leaveType
      };

      const response = await axios.post('/api/v1/leave/create-leave', leaveData, getAuthHeaders());
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully!"
        });
        setIsDialogOpen(false);
        setFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
          description: ''
        });
        await fetchLeaves();
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit leave request",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      Approved: 'bg-green-500/20 text-green-300 border border-green-500/30',
      Rejected: 'bg-red-500/20 text-red-300 border border-red-500/30',
      Cancelled: 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    };

    const icons = {
      Pending: <Clock className="w-3 h-3" />,
      Approved: <CheckCircle className="w-3 h-3" />,
      Rejected: <XCircle className="w-3 h-3" />,
      Cancelled: <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days') + 1;
  };

  const getLeaveStats = () => {
    const currentYear = moment().year();
    const yearlyLeaves = leaves.filter(leave => 
      moment(leave.startDate).year() === currentYear
    );

    const approved = yearlyLeaves.filter(leave => leave.status === 'Approved');
    const pending = yearlyLeaves.filter(leave => leave.status === 'Pending');
    const totalDays = approved.reduce((sum, leave) => 
      sum + calculateLeaveDays(leave.startDate, leave.endDate), 0
    );

    return {
      total: yearlyLeaves.length,
      approved: approved.length,
      pending: pending.length,
      totalDays
    };
  };

  const stats = getLeaveStats();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Plane className="w-10 h-10 text-purple-400" />
            My Leave Requests
          </h1>
          <p className="text-gray-300 text-lg">Manage your leave requests and view leave history</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Request Leave
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px] backdrop-blur-lg bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                Request Leave
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Submit a new leave request for approval.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leaveType" className="text-gray-200 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Leave Type *
                </Label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                >
                  <option value="" className="bg-gray-800">Select Leave Type</option>
                  <option value="Annual Leave" className="bg-gray-800">Annual Leave</option>
                  <option value="Sick Leave" className="bg-gray-800">Sick Leave</option>
                  <option value="Personal Leave" className="bg-gray-800">Personal Leave</option>
                  <option value="Maternity Leave" className="bg-gray-800">Maternity Leave</option>
                  <option value="Paternity Leave" className="bg-gray-800">Paternity Leave</option>
                  <option value="Emergency Leave" className="bg-gray-800">Emergency Leave</option>
                  <option value="Other" className="bg-gray-800">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-gray-200 font-medium flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={moment().format('YYYY-MM-DD')}
                    className="bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-gray-200 font-medium flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate || moment().format('YYYY-MM-DD')}
                    className="bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Total days: {calculateLeaveDays(formData.startDate, formData.endDate)}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-200 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  Reason *
                </Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Brief reason for leave"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-200 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional details (optional)"
                  rows={3}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                />
              </div>

              <DialogFooter className="flex gap-3">
                <Button 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total Requests</h3>
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
          <p className="text-gray-300 text-sm">This year</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Approved</h3>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-green-300 mb-2">{stats.approved}</div>
          <p className="text-gray-300 text-sm">This year</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Pending</h3>
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-300 mb-2">{stats.pending}</div>
          <p className="text-gray-300 text-sm">Awaiting approval</p>
        </div>

        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Days Taken</h3>
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-300 mb-2">{stats.totalDays}</div>
          <p className="text-gray-300 text-sm">This year</p>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Leave History
          </h2>
          <p className="text-gray-300">Your recent leave requests</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Leave Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Start Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">End Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Days</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Reason</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                    <td className="py-4 px-4 text-white font-medium">
                      {leave.type}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {moment(leave.startdate).format('MMM DD, YYYY')}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {moment(leave.enddate).format('MMM DD, YYYY')}
                    </td>
                    <td className="py-4 px-4 text-white font-medium">
                      {calculateLeaveDays(leave.startdate, leave.enddate)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {leave.reason}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {moment(leave.createdAt).format('MMM DD, YYYY')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No leave requests found</p>
                    <p className="text-sm">Your leave history will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaves;
