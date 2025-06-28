import React, { useState, useEffect } from 'react';
import { apiService } from '@/apis/apiService';
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
import AttendanceButton from "@/components/AttendanceButton";
import NewAttendanceButton from "@/components/NewAttendanceButton";

if (!apiService.defaults.baseURL) apiService.defaults.baseURL = 'http://localhost:5001';

const EmployeeDashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [clockStatus, setClockStatus] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const { toast } = useToast();
  const user = useSelector((state) => state.employeereducer?.user);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await fetchEmployeeData();
        await fetchAttendanceStatus();
      } catch (e) {
        console.error('Dashboard init error:', e);
        toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await apiService.get('/api/v1/employee/by-employee');
      if (response.data.success) {
        setEmployeeData(response.data.employee);
        return response.data.employee;
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
    return null;
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await apiService.get('/api/v1/attendance/employee/my-status');
      if (response.data.success) {
        const { isClockedIn, lastActivity: la, todayAttendance: ta } = response.data.data;
        setClockStatus(isClockedIn);
        setLastActivity(la);
        setTodayAttendance(ta);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };

  // Handle attendance status changes from AttendanceButton
  const handleAttendanceChange = (data) => {
    setClockStatus(data.isClockedIn || false);
    setLastActivity(data.lastActivity);
    setTodayAttendance(data.todayAttendance);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="employee-dashboard-overview p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
          Welcome back, {employeeData?.firstname || employeeData?.firstName || user?.firstName || 'Employee'}!
        </h1>
        <p className="text-gray-600 dark:text-neutral-400 mt-2">
          {moment().format('dddd, MMMM Do YYYY')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clock In/Out Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Time Tracking</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Clock in/out for today</CardDescription>
          </CardHeader>          <CardContent>
            <div className="text-center">
              <div className="text-6xl mb-4 text-gray-900 dark:text-neutral-100">
                {moment().format('HH:mm')}
              </div>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  clockStatus 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'
                }`}>
                  {clockStatus ? 'Clocked In' : 'Clocked Out'}
                </span>
              </div>              
              {todayAttendance && (
                <div className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
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
            <div style={{ width: '100%' }}>
              <NewAttendanceButton 
                onUpdate={handleAttendanceChange}
              />
            </div>
          </CardFooter>
        </Card>        {/* Quick Stats */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">This Month</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Working Days</span>
                <span className="font-medium text-gray-900 dark:text-neutral-100">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Present Days</span>
                <span className="font-medium text-green-600 dark:text-green-400">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Absent Days</span>
                <span className="font-medium text-red-600 dark:text-red-400">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Leaves Taken</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Profile Summary</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Your information</CardDescription>
          </CardHeader>          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-neutral-400">Employee ID</span>
                <div className="font-medium text-gray-900 dark:text-neutral-100">{employeeData?.employeeId || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-neutral-400">Department</span>
                <div className="font-medium text-gray-900 dark:text-neutral-100">{employeeData?.department?.name || employeeData?.department || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-neutral-400">Position</span>
                <div className="font-medium text-gray-900 dark:text-neutral-100">{employeeData?.position || 'N/A'}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-neutral-400">Join Date</span>
                <div className="font-medium text-gray-900 dark:text-neutral-100">
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
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Your latest actions</CardDescription>
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
