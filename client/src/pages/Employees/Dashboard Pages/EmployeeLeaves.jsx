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
  axios.defaults.baseURL = 'http://localhost:5000';
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
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/leave/all', getAuthHeaders());
      if (response.data.success) {
        // Filter leaves for current employee
        const employeeLeaves = response.data.leaves.filter(
          leave => leave.employeeId === user._id
        );
        setLeaves(employeeLeaves);
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
        ...formData,
        employeeId: user._id,
        status: 'Pending'
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
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="employee-leaves p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600 mt-2">Manage your leave requests and view leave history</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request for approval.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="leaveType">Leave Type *</Label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={moment().format('YYYY-MM-DD')}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate || moment().format('YYYY-MM-DD')}
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="text-sm text-gray-600">
                  Total days: {calculateLeaveDays(formData.startDate, formData.endDate)}
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Brief reason for leave"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Additional details (optional)"
                  rows={3}
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
      </div>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
            <CardDescription>This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
            <CardDescription>This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Days Taken</CardTitle>
            <CardDescription>This year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalDays}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell className="font-medium">
                      {leave.leaveType}
                    </TableCell>
                    <TableCell>
                      {moment(leave.startDate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {moment(leave.endDate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {calculateLeaveDays(leave.startDate, leave.endDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(leave.status)}
                    </TableCell>
                    <TableCell>
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      {moment(leave.createdAt).format('MMM DD, YYYY')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
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
