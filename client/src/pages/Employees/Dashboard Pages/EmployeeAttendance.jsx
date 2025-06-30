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
import NewAttendanceButton from "@/components/NewAttendanceButton";
import { Clock, Calendar, CheckCircle, XCircle, TrendingUp, Users, BarChart3, PlayCircle, StopCircle } from 'lucide-react';

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
      const response = await apiService.get('/api/v1/attendance/employee/my-attendance');
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
      const response = await apiService.get('/api/v1/attendance/employee/my-status');
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
      Present: 'bg-green-500/20 text-green-300 border border-green-500/30',
      Absent: 'bg-red-500/20 text-red-300 border border-red-500/30',
      Leave: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      Holiday: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    };

    const icons = {
      Present: <CheckCircle className="w-3 h-3" />,
      Absent: <XCircle className="w-3 h-3" />,
      Leave: <Calendar className="w-3 h-3" />,
      Holiday: <Calendar className="w-3 h-3" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles[status] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Clock className="w-10 h-10 text-purple-400" />
          My Attendance
        </h1>
        <p className="text-gray-300 text-lg">Track your daily attendance and work hours</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Clock In/Out Card */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Today's Attendance
              </h2>
              <p className="text-gray-300">{moment().format('dddd, MMMM Do YYYY')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="text-4xl font-bold text-white">
                  {moment().format('HH:mm')}
                </div>
                <div className="flex items-center gap-2">
                  {clockStatus ? (
                    <PlayCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <StopCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    clockStatus 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {clockStatus ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>
                
                {todayAttendance && (
                  <div className="space-y-2 text-sm text-gray-300">
                    {todayAttendance.checkInTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        In: {todayAttendance.checkInTime}
                      </div>
                    )}
                    {todayAttendance.checkOutTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        Out: {todayAttendance.checkOutTime}
                      </div>
                    )}
                    {todayAttendance.workHours && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Hours: {todayAttendance.workHours.toFixed(2)}h
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <NewAttendanceButton 
                  onUpdate={handleAttendanceStatusChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              This Month
            </h3>
            <p className="text-gray-300 text-sm">Attendance summary</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Days
              </span>
              <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{stats.totalDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Present
              </span>
              <span className="font-bold text-green-300 bg-green-500/20 px-3 py-1 rounded-lg">{stats.presentDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Absent
              </span>
              <span className="font-bold text-red-300 bg-red-500/20 px-3 py-1 rounded-lg">{stats.absentDays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Avg Hours
              </span>
              <span className="font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-lg">{stats.avgWorkHours}h</span>
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Attendance Rate
            </h3>
            <p className="text-gray-300 text-sm">This month</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-green-300 mb-2">
              {stats.totalDays > 0 
                ? Math.round((stats.presentDays / stats.totalDays) * 100)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {stats.presentDays} out of {stats.totalDays} days
            </div>
            <div className="relative bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${stats.totalDays > 0 
                    ? (stats.presentDays / stats.totalDays) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Attendance History
          </h2>
          <p className="text-gray-300">Your recent attendance records</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Check In</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Check Out</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Work Hours</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-200">Comments</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.slice(0, 30).map((record, index) => (
                  <tr key={record._id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                    <td className="py-4 px-4 text-white font-medium">
                      {moment(record.date).format('MMM DD, YYYY')}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {record.checkInTime || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {record.checkOutTime || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {record.comments || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No attendance records found</p>
                    <p className="text-sm">Your attendance history will appear here</p>
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

export default EmployeeAttendance;
