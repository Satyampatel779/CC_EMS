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
import { 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Timer,
  Target,
  BarChart3,
  DollarSign,
  FileText,
  Sun,
  Moon
} from "lucide-react";

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

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return { greeting: "Good Morning", icon: Sun };
    if (hour < 17) return { greeting: "Good Afternoon", icon: Sun };
    return { greeting: "Good Evening", icon: Moon };
  };

  const { greeting, icon: GreetingIcon } = getGreeting();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Attendance Status",
      value: clockStatus ? "Checked In" : "Checked Out",
      icon: Clock,
      color: clockStatus ? "text-green-400" : "text-orange-400",
      bgColor: clockStatus ? "bg-green-500/10" : "bg-orange-500/10"
    },
    {
      title: "This Month",
      value: "22 Days",
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Performance",
      value: "Excellent",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Team Rating",
      value: "4.8★",
      icon: Award,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    }
  ];

  const quickActions = [
    { title: "View Attendance", icon: Clock, description: "Check your attendance history" },
    { title: "Request Leave", icon: Calendar, description: "Submit a new leave request" },
    { title: "View Salary", icon: DollarSign, description: "Check your salary details" },
    { title: "My Documents", icon: FileText, description: "Access your documents" }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 md:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <GreetingIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {greeting}, {employeeData?.firstname || employeeData?.firstName || user?.firstName || 'Employee'}!
              </h1>
              <p className="text-gray-300 text-lg mt-1">
                {moment().format('dddd, MMMM Do YYYY')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clock In/Out Card */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Timer className="h-5 w-5 text-white" />
                </div>
                Attendance Management
              </CardTitle>
              <CardDescription className="text-gray-300">
                Track your daily attendance and working hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-gray-300 text-sm">Current Status</p>
                  <p className={`text-2xl font-bold ${clockStatus ? 'text-green-400' : 'text-orange-400'}`}>
                    {clockStatus ? 'Checked In' : 'Checked Out'}
                  </p>
                  {lastActivity && (
                    <p className="text-gray-400 text-sm mt-1">
                      Last activity: {moment(lastActivity.timestamp).format('h:mm A')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <NewAttendanceButton onStatusChange={handleAttendanceChange} />
                </div>
              </div>
              
              {todayAttendance && (
                <div className="bg-white/5 rounded-xl p-4 mt-4">
                  <h4 className="text-white font-semibold mb-2">Today's Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">Check In</p>
                      <p className="text-white font-medium">
                        {todayAttendance.checkInTime ? moment(todayAttendance.checkInTime).format('h:mm A') : 'Not checked in'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300">Check Out</p>
                      <p className="text-white font-medium">
                        {todayAttendance.checkOutTime ? moment(todayAttendance.checkOutTime).format('h:mm A') : 'Not checked out'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">This Week</span>
                  <span className="text-white font-semibold">5/5 Days</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">This Month</span>
                  <span className="text-white font-semibold">22/24 Days</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Great Performance!</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">You're maintaining excellent attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-300">
              Access frequently used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <div key={index} className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <action.icon className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <h4 className="text-white font-medium group-hover:text-blue-100 transition-colors">{action.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboardOverview;
