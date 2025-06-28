import React, { useState, useEffect } from 'react';
import { apiService } from '@/apis/apiService';
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
import AttendanceButton from "@/components/AttendanceButton";

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('EMtoken') || sessionStorage.getItem('EMtoken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAttendanceHistory(),
        fetchAttendanceStatus()
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
      const response = await axios.get('http://localhost:5001/api/v1/attendance/employee/my-attendance', getAuthHeaders());
      if (response.data.success) {
        const history = response.data.data || [];
        setAttendanceHistory(history);
        calculateStats(history);
        
        // Find today's attendance from the history
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = history.find(record => 
          moment(record.date).format('YYYY-MM-DD') === today
        );
        setTodayAttendance(todayRecord);
      } else {
        setAttendanceHistory([]);
        calculateStats([]);
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        });
      } else {
        setAttendanceHistory([]);
        calculateStats([]);
        setTodayAttendance(null);
      }
    }
  };

  const fetchAttendanceStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/v1/attendance/employee/my-status', getAuthHeaders());
      if (response.data.success) {
        const { isClockedIn, todayAttendance: todayData } = response.data.data;
        setClockStatus(isClockedIn);
        if (todayData) {
          setTodayAttendance(todayData);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        });
      }
    }
  };

  const handleAttendanceStatusChange = (statusData) => {
    setClockStatus(statusData.isClockedIn || false);
    if (statusData.todayAttendance) {
      setTodayAttendance(statusData.todayAttendance);
    }
    // Refresh attendance history when status changes
    fetchAttendanceHistory();
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

  const getStatusBadge = (status) => {
    const styles = {
      Present: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      Absent: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      Leave: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      Holiday: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  return (
    <div className="employee-attendance p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">My Attendance</h1>
        <p className="text-gray-600 dark:text-neutral-400 mt-2">Track your daily attendance and work hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Clock In/Out Card */}
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Today's Attendance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">{moment().format('dddd, MMMM Do YYYY')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
                  {moment().format('HH:mm')}
                </div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    clockStatus 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'
                  }`}>
                    {clockStatus ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>
                
                {todayAttendance && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-neutral-400">
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
              
              <AttendanceButton 
                onStatusChange={handleAttendanceStatusChange}
                size="lg"
                className="min-w-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">This Month</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Total Days</span>
                <span className="font-medium text-gray-900 dark:text-neutral-100">{stats.totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Present</span>
                <span className="font-medium text-green-600 dark:text-green-400">{stats.presentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Absent</span>
                <span className="font-medium text-red-600 dark:text-red-400">{stats.absentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-neutral-400">Avg Hours</span>
                <span className="font-medium text-gray-900 dark:text-neutral-100">{stats.avgWorkHours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Attendance Rate</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalDays > 0 
                  ? Math.round((stats.presentDays / stats.totalDays) * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-gray-600 dark:text-neutral-400 mt-2">
                {stats.presentDays} out of {stats.totalDays} days
              </div>
              <div className="mt-4 bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
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
      <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-neutral-100">Attendance History</CardTitle>
          <CardDescription className="text-gray-600 dark:text-neutral-400">Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-neutral-700">
                <TableHead className="text-gray-900 dark:text-neutral-100">Date</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Status</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Check In</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Check Out</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Work Hours</TableHead>
                <TableHead className="text-gray-900 dark:text-neutral-100">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.slice(0, 30).map((record) => (
                  <TableRow key={record._id} className="border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {moment(record.date).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {record.checkInTime || '-'}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {record.checkOutTime || '-'}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-neutral-100">
                      {record.comments || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-gray-200 dark:border-neutral-700">
                  <TableCell colSpan={6} className="text-center text-gray-500 dark:text-neutral-400">
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
