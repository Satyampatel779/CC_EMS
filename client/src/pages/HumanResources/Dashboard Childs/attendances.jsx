import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify';
import { AttendanceEndPoints, HREmployeesPageEndPoints } from '@/redux/apis/APIsEndpoints';

export function AttendancesPage() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
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
  // Fetch attendances and employees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [attendancesRes, employeesRes] = await Promise.all([
          axios.get('/api/v1/attendance'),
          axios.get('/api/v1/employee/all')
        ]);
        
        console.log('Attendances response:', attendancesRes.data);
        console.log('Employees response:', employeesRes.data);
        
        setAttendances(attendancesRes.data || []);
        setEmployees(employeesRes.data?.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter attendances based on search query, selected date, employee, and status
  const filteredAttendances = attendances.filter(attendance => {
    // Get employee data from populated field or find in employees array
    const employee = attendance.employeeId || employees.find(e => e._id === attendance.employeeId);
    const employeeName = employee ? `${employee.firstname || ''} ${employee.lastname || ''}`.trim() : 'Unknown Employee';
    const attendanceDate = new Date(attendance.date).toLocaleDateString();
    const selectedDateStr = date ? date.toLocaleDateString() : '';
    
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !date || attendanceDate === selectedDateStr;
    const matchesEmployee = selectedEmployee === 'all' || attendance.employeeId === selectedEmployee || attendance.employeeId?._id === selectedEmployee;
    const matchesStatus = selectedStatus === 'all' || attendance.status === selectedStatus;
    
    return matchesSearch && matchesDate && matchesEmployee && matchesStatus;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttendance({
      ...newAttendance,
      [name]: value
    });
  };

  const calculateWorkHours = () => {
    if (newAttendance.checkInTime && newAttendance.checkOutTime) {
      const checkIn = new Date(`2023-01-01T${newAttendance.checkInTime}`);
      const checkOut = new Date(`2023-01-01T${newAttendance.checkOutTime}`);
      
      if (checkOut > checkIn) {
        const diffMs = checkOut - checkIn;
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        setNewAttendance({
          ...newAttendance,
          workHours: diffHrs.toFixed(2)
        });
      }
    }
  };

  useEffect(() => {
    calculateWorkHours();
  }, [newAttendance.checkInTime, newAttendance.checkOutTime]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/v1/attendance', newAttendance);
      
      setAttendances([...attendances, response.data]);
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
      
      toast.success('Attendance record added successfully');
    } catch (error) {
      console.error('Error adding attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to add attendance record');
    }
  };
  const handleDelete = async (attendanceId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await axios.delete(`/api/v1/attendance/${attendanceId}`);
        setAttendances(attendances.filter(a => a._id !== attendanceId));
        toast.success('Attendance record deleted successfully');
      } catch (error) {
        console.error('Error deleting attendance:', error);
        toast.error('Failed to delete attendance record');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Half Day':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Leave':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Attendance Management</h1>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Attendance</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Attendance Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="employeeId" className="text-sm font-medium">Employee</label>
                  <Select
                    name="employeeId"
                    value={newAttendance.employeeId}
                    onValueChange={(value) => setNewAttendance({...newAttendance, employeeId: value})}
                    required
                  >
                    <SelectTrigger>
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
                  <label htmlFor="date" className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    name="date"
                    value={newAttendance.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    name="status"
                    value={newAttendance.status}
                    onValueChange={(value) => setNewAttendance({...newAttendance, status: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
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
                  <label htmlFor="checkInTime" className="text-sm font-medium">Check-in Time</label>
                  <Input
                    type="time"
                    name="checkInTime"
                    value={newAttendance.checkInTime}
                    onChange={handleInputChange}
                    required={newAttendance.status !== 'Absent' && newAttendance.status !== 'Leave'}
                    disabled={newAttendance.status === 'Absent' || newAttendance.status === 'Leave'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="checkOutTime" className="text-sm font-medium">Check-out Time</label>
                  <Input
                    type="time"
                    name="checkOutTime"
                    value={newAttendance.checkOutTime}
                    onChange={handleInputChange}
                    required={newAttendance.status !== 'Absent' && newAttendance.status !== 'Leave'}
                    disabled={newAttendance.status === 'Absent' || newAttendance.status === 'Leave'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="workHours" className="text-sm font-medium">Work Hours</label>
                  <Input
                    type="number"
                    name="workHours"
                    value={newAttendance.workHours}
                    onChange={handleInputChange}
                    step="0.01"
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="comments" className="text-sm font-medium">Comments</label>
                <Input
                  name="comments"
                  value={newAttendance.comments}
                  onChange={handleInputChange}
                  placeholder="Add any comments..."
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-neutral-100">Search Employee</label>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
            />
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-neutral-100">Filter by Date</label>
            <Input 
                type="date"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                className="border rounded-md bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                />
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 space-y-4">          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-neutral-100">Filter by Employee</label>            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600">
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.firstname} {employee.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-neutral-100">Filter by Status</label>            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="Leave">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <Button 
            variant="outline"
            className="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
            onClick={() => {
              setSearchQuery('');
              setDate(null);
              setSelectedEmployee('all');
              setSelectedStatus('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <Table>
          <TableCaption className="text-gray-600 dark:text-neutral-400">
            {filteredAttendances.length === 0 
              ? "No attendance records found" 
              : `Showing ${filteredAttendances.length} attendance records`}
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-neutral-600">
              <TableHead className="text-gray-900 dark:text-neutral-100">Employee Name</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Date</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Status</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Check-in</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Check-out</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Work Hours</TableHead>
              <TableHead className="text-gray-900 dark:text-neutral-100">Comments</TableHead>
              <TableHead className="text-right text-gray-900 dark:text-neutral-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.map(attendance => {
              // Get employee data from populated field or employees array
              const employee = attendance.employeeId || employees.find(e => e._id === attendance.employeeId);
              return (
                <TableRow key={attendance._id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 border-gray-200 dark:border-neutral-600">
                  <TableCell className="font-medium text-gray-900 dark:text-neutral-100">
                    {employee ? `${employee.firstname || ''} ${employee.lastname || ''}`.trim() : 'Unknown Employee'}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-neutral-300">{new Date(attendance.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-neutral-300">{attendance.checkInTime || 'N/A'}</TableCell>
                  <TableCell className="text-gray-700 dark:text-neutral-300">{attendance.checkOutTime || 'N/A'}</TableCell>
                  <TableCell className="text-gray-700 dark:text-neutral-300">{attendance.workHours ? `${attendance.workHours}h` : '0h'}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-gray-700 dark:text-neutral-300" title={attendance.comments}>
                    {attendance.comments || 'No comments'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                      onClick={() => handleDelete(attendance._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}