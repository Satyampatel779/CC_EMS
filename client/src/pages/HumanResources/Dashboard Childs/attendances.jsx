import React, { useState, useEffect, useMemo } from 'react';
import axios from '@/lib/axios';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Timer,
  BarChart3,
  Trash2
} from 'lucide-react';

export function AttendancesPage() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    employeeId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
    checkInTime: '09:00',
    checkOutTime: '17:00',
    workHours: 8,
    comments: ''
  });
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attendancesRes, employeesRes] = await Promise.all([
          axios.get('/api/v1/attendance'),
          axios.get('/api/v1/employee/all')
        ]);
        
        setAttendances(attendancesRes.data || []);
        setEmployees(employeesRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter attendances based on search criteria
  const filteredAttendances = useMemo(() => {
    return attendances.filter(attendance => {
      const employee = attendance.employeeId || employees.find(e => e._id === attendance.employeeId);
      const employeeName = employee ? `${employee.firstname || ''} ${employee.lastname || ''}`.trim() : 'Unknown Employee';
      
      const matchesSearch = searchQuery === '' || employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !selectedDate || format(new Date(attendance.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      const matchesEmployee = selectedEmployee === 'all' || attendance.employeeId === selectedEmployee || attendance.employeeId?._id === selectedEmployee;
      const matchesStatus = selectedStatus === 'all' || attendance.status === selectedStatus;
      
      return matchesSearch && matchesDate && matchesEmployee && matchesStatus;
    });
  }, [attendances, employees, searchQuery, selectedDate, selectedEmployee, selectedStatus]);

  // Calculate work hours automatically
  useEffect(() => {
    if (newAttendance.checkInTime && newAttendance.checkOutTime) {
      const checkIn = new Date(`2023-01-01T${newAttendance.checkInTime}`);
      const checkOut = new Date(`2023-01-01T${newAttendance.checkOutTime}`);
      
      if (checkOut > checkIn) {
        const diffMs = checkOut - checkIn;
        const diffHrs = diffMs / (1000 * 60 * 60);
        setNewAttendance(prev => ({
          ...prev,
          workHours: diffHrs.toFixed(2)
        }));
      }
    }
  }, [newAttendance.checkInTime, newAttendance.checkOutTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttendance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setNewAttendance(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/v1/attendance', newAttendance);
      setAttendances(prev => [...prev, response.data]);
      setIsModalOpen(false);
      setNewAttendance({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Present',
        checkInTime: '09:00',
        checkOutTime: '17:00',
        workHours: 8,
        comments: ''
      });
      
      toast({
        title: "Success",
        description: "Attendance record added successfully",
      });
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add attendance record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attendanceId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await axios.delete(`/api/v1/attendance/${attendanceId}`);
        setAttendances(prev => prev.filter(a => a._id !== attendanceId));
        toast({
          title: "Success",
          description: "Attendance record deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting attendance:', error);
        toast({
          title: "Error",
          description: "Failed to delete attendance record",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusPill = (status) => {
    const styles = {
      'Present': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Absent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Late': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Half Day': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Leave': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.default}`}>
        {status}
      </span>
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const present = filteredAttendances.filter(a => a.status === 'Present').length;
    const absent = filteredAttendances.filter(a => a.status === 'Absent').length;
    const late = filteredAttendances.filter(a => a.status === 'Late').length;
    
    return [
      {
        title: "Total Records",
        value: total,
        icon: BarChart3,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30"
      },
      {
        title: "Present",
        value: present,
        icon: UserCheck,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30"
      },
      {
        title: "Absent",
        value: absent,
        icon: UserX,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30"
      },
      {
        title: "Late",
        value: late,
        icon: Timer,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
      }
    ];
  }, [filteredAttendances]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-700 dark:text-slate-300 mt-4 text-center">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Attendance Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Track and manage employee attendance records
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl sm:max-w-[600px] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add New Attendance Record</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee</label>
                        <Select
                          value={newAttendance.employeeId}
                          onValueChange={(value) => handleSelectChange('employeeId', value)}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue placeholder="Select Employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map(employee => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.firstname} {employee.lastname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date</label>
                        <Input
                          type="date"
                          name="date"
                          value={newAttendance.date}
                          onChange={handleInputChange}
                          className="bg-white/70 dark:bg-slate-700/70"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                        <Select
                          value={newAttendance.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                            <SelectItem value="Half Day">Half Day</SelectItem>
                            <SelectItem value="Leave">Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Work Hours</label>
                        <Input
                          type="number"
                          name="workHours"
                          value={newAttendance.workHours}
                          onChange={handleInputChange}
                          className="bg-white/70 dark:bg-slate-700/70"
                          step="0.1"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Check-in Time</label>
                        <Input
                          type="time"
                          name="checkInTime"
                          value={newAttendance.checkInTime}
                          onChange={handleInputChange}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Check-out Time</label>
                        <Input
                          type="time"
                          name="checkOutTime"
                          value={newAttendance.checkOutTime}
                          onChange={handleInputChange}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Comments</label>
                      <Input
                        name="comments"
                        value={newAttendance.comments}
                        onChange={handleInputChange}
                        placeholder="Optional comments..."
                        className="bg-white/70 dark:bg-slate-700/70"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                      >
                        Add Record
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Table */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 dark:bg-slate-700/70"
              />
            </div>
            <Input
              type="date"
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              className="bg-white/70 dark:bg-slate-700/70"
            />
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                <SelectValue placeholder="Filter by Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.firstname} {employee.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="Leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredAttendances.length}</span> of <span className="font-semibold text-slate-900 dark:text-slate-100">{attendances.length}</span> records
            </p>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Employee</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Check-in</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Check-out</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Work Hours</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendances.length > 0 ? (
                  filteredAttendances.map((attendance, index) => {
                    const employee = employees.find(e => e._id === (attendance.employeeId?._id || attendance.employeeId));
                    return (
                      <TableRow key={attendance._id || index} className={`border-slate-100 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-700/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-white/20 dark:bg-slate-800/20' : ''}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown Employee'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {employee?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-slate-100">
                          {format(new Date(attendance.date), 'PPP')}
                        </TableCell>
                        <TableCell>
                          {getStatusPill(attendance.status)}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-slate-100">
                          {attendance.checkInTime || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-slate-100">
                          {attendance.checkOutTime || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-slate-100 font-medium">
                          {attendance.workHours} hrs
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(attendance._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center h-24">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="h-12 w-12 text-slate-400" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No attendance records found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}