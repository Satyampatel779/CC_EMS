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
      Pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      Approved: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      Rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      Cancelled: 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}>
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  return (
    <div className="employee-leaves p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">My Leave Requests</h1>
          <p className="text-gray-600 dark:text-neutral-400 mt-2">Manage your leave requests and view leave history</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-neutral-100">Request Leave</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-neutral-400">
                Submit a new leave request for approval.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="leaveType" className="text-gray-900 dark:text-neutral-100">Leave Type *</Label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-900 dark:text-neutral-100">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={moment().format('YYYY-MM-DD')}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-gray-900 dark:text-neutral-100">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate || moment().format('YYYY-MM-DD')}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="text-sm text-gray-600 dark:text-neutral-400">
                  Total days: {calculateLeaveDays(formData.startDate, formData.endDate)}
                </div>
              )}

              <div>
                <Label htmlFor="reason" className="text-gray-900 dark:text-neutral-100">Reason *</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Brief reason for leave"
                  required
                  className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-900 dark:text-neutral-100">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional details (optional)"
                  rows={3}
                  className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 placeholder:text-gray-500 dark:placeholder:text-neutral-400"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Total Requests</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Approved</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Pending</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Days Taken</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalDays}</div>
          </CardContent>
        </Card>
      </div>      {/* Leave History Table */}
      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-neutral-100">Leave History</CardTitle>
          <CardDescription className="text-gray-600 dark:text-neutral-400">Your recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-neutral-700">
                <TableHead className="text-gray-900 dark:text-neutral-100">Leave Type</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Start Date</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">End Date</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Days</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Reason</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Applied On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave._id} className="border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-neutral-100">
                      {leave.type}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {moment(leave.startdate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {moment(leave.enddate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {calculateLeaveDays(leave.startdate, leave.enddate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(leave.status)}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {leave.reason}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {moment(leave.createdAt).format('MMM DD, YYYY')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-gray-200 dark:border-neutral-700">
                  <TableCell colSpan={7} className="text-center text-gray-500 dark:text-neutral-400">
                    No leave requests found
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

export default EmployeeLeaves;
