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

const EmployeeAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [clockStatus, setClockStatus] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    avgWorkHours: 0
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
      loadAttendanceData();
    }
  }, [user]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceHistory(),
        fetchAttendanceStatus(),
        fetchTodayAttendance()
      ]);
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await axios.get(`/api/v1/attendance/employee-history/${user._id}`, getAuthHeaders());
      if (response.data.success) {
        const history = response.data.data;
        setAttendanceHistory(history);
        calculateStats(history);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get(`/api/v1/attendance/employee-status/${user._id}`, getAuthHeaders());
      if (response.data.success) {
        setClockStatus(response.data.data.isClockedIn);
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

  const calculateStats = (history) => {
    const currentMonth = moment().month();
    const currentYear = moment().year();
    
    const monthlyRecords = history.filter(record => {
      const recordDate = moment(record.date);
      return recordDate.month() === currentMonth && recordDate.year() === currentYear;
    });

    const presentDays = monthlyRecords.filter(record => record.status === 'Present').length;
    const absentDays = monthlyRecords.filter(record => record.status === 'Absent').length;
    const totalWorkHours = monthlyRecords
      .filter(record => record.workHours)
      .reduce((sum, record) => sum + record.workHours, 0);
    
    const avgWorkHours = presentDays > 0 ? totalWorkHours / presentDays : 0;

    setStats({
      totalDays: monthlyRecords.length,
      presentDays,
      absentDays,
      avgWorkHours: parseFloat(avgWorkHours.toFixed(2))
    });
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
        await fetchAttendanceHistory(); // Refresh to get updated work hours
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clock out",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Present: 'bg-green-100 text-green-800',
      Absent: 'bg-red-100 text-red-800',
      Leave: 'bg-yellow-100 text-yellow-800',
      Holiday: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="employee-attendance p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600 mt-2">Track your daily attendance and work hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Clock In/Out Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>{moment().format('dddd, MMMM Do YYYY')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {moment().format('HH:mm')}
                </div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    clockStatus 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {clockStatus ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>
                
                {todayAttendance && (
                  <div className="mt-4 text-sm text-gray-600">
                    {todayAttendance.checkInTime && (
                      <div>In: {todayAttendance.checkInTime}</div>
                    )}
                    {todayAttendance.checkOutTime && (
                      <div>Out: {todayAttendance.checkOutTime}</div>
                    )}
                    {todayAttendance.workHours && (
                      <div>Hours: {todayAttendance.workHours.toFixed(2)}h</div>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={clockStatus ? handleClockOut : handleClockIn}
                className={`${
                  clockStatus 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                size="lg"
              >
                {clockStatus ? 'Clock Out' : 'Clock In'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Days</span>
                <span className="font-medium">{stats.totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Present</span>
                <span className="font-medium text-green-600">{stats.presentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Absent</span>
                <span className="font-medium text-red-600">{stats.absentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Hours</span>
                <span className="font-medium">{stats.avgWorkHours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalDays > 0 
                  ? Math.round((stats.presentDays / stats.totalDays) * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {stats.presentDays} out of {stats.totalDays} days
              </div>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ 
                    width: `${stats.totalDays > 0 
                      ? (stats.presentDays / stats.totalDays) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.slice(0, 30).map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {moment(record.date).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {record.checkInTime || '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime || '-'}
                    </TableCell>
                    <TableCell>
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      {record.comments || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No attendance records found
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

export default EmployeeAttendance;
