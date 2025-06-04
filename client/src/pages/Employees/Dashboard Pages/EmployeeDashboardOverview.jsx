import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5001';
}

const EmployeeDashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [clockStatus, setClockStatus] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [lastActivity, setLastActivity] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
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
    const loadDashboard = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        await fetchEmployeeData();
        await fetchAttendanceStatus();
        await fetchTodayAttendance();
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get('/api/v1/employee/by-employee', getAuthHeaders());
      setEmployeeData(response.data.employee);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(`/api/v1/attendance/employee-status/${user._id}`, getAuthHeaders());
      if (response.data.success) {
        setClockStatus(response.data.data.isClockedIn);
        setLastActivity(response.data.data.lastActivity);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/v1/attendance/employee-history/${user._id}`, getAuthHeaders());
      if (response.data.success) {
        const todayRecord = response.data.data.find(record => 
          moment(record.date).format('YYYY-MM-DD') === today
        );
        setTodayAttendance(todayRecord);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      const response = await axios.post('/api/v1/attendance/clock-in', {
        employeeId: user._id
      }, getAuthHeaders());

      if (response.data.success) {
        setClockStatus(true);
        toast({
          title: "Success",
          description: "Clocked in successfully!"
        });
        await fetchTodayAttendance();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clock in",
        variant: "destructive"
      });
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await axios.post('/api/v1/attendance/clock-out', {
        employeeId: user._id
      }, getAuthHeaders());

      if (response.data.success) {
        setClockStatus(false);
        toast({
          title: "Success",
          description: "Clocked out successfully!"
        });
        await fetchTodayAttendance();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clock out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard-overview p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {employeeData?.firstName || user?.firstName || 'Employee'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {moment().format('dddd, MMMM Do YYYY')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Clock In/Out Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Clock in/out for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {moment().format('HH:mm')}
              </div>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  clockStatus 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {clockStatus ? 'Clocked In' : 'Clocked Out'}
                </span>
              </div>
              
              {todayAttendance && (
                <div className="text-sm text-gray-600 mb-4">
                  {todayAttendance.checkInTime && (
                    <div>Clocked in at: {todayAttendance.checkInTime}</div>
                  )}
                  {todayAttendance.checkOutTime && (
                    <div>Clocked out at: {todayAttendance.checkOutTime}</div>
                  )}
                  {todayAttendance.workHours && (
                    <div>Work hours: {todayAttendance.workHours.toFixed(2)}h</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={clockStatus ? handleClockOut : handleClockIn}
              className={`w-full ${
                clockStatus 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {clockStatus ? 'Clock Out' : 'Clock In'}
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Working Days</span>
                <span className="font-medium">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Present Days</span>
                <span className="font-medium text-green-600">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Absent Days</span>
                <span className="font-medium text-red-600">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Leaves Taken</span>
                <span className="font-medium text-blue-600">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Employee ID</span>
                <div className="font-medium">{employeeData?.employeeId || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Department</span>
                <div className="font-medium">{employeeData?.department || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Position</span>
                <div className="font-medium">{employeeData?.position || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Join Date</span>
                <div className="font-medium">
                  {employeeData?.joiningDate 
                    ? moment(employeeData.joiningDate).format('MMM DD, YYYY')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastActivity ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    lastActivity.type === 'clockIn' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <span className="font-medium">
                      {lastActivity.type === 'clockIn' ? 'Clocked In' : 'Clocked Out'}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {moment(lastActivity.timestamp).fromNow()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>      </div>
    </div>
  );
};

export default EmployeeDashboardOverview;
