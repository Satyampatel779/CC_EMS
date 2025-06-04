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
          axios.get(AttendanceEndPoints.GETALL),
          axios.get(HREmployeesPageEndPoints.GETALL)
        ]);
        
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
    const employee = employees.find(e => e._id === attendance.employeeId);
    const employeeName = employee ? `${employee.firstname} ${employee.lastname}` : '';
    const attendanceDate = new Date(attendance.date).toLocaleDateString();
    const selectedDateStr = date ? date.toLocaleDateString() : '';
      const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !date || attendanceDate === selectedDateStr;
    const matchesEmployee = selectedEmployee === 'all' || attendance.employeeId === selectedEmployee;
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
      const response = await axios.post(AttendanceEndPoints.CREATE, newAttendance);
      
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
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await axios.delete(AttendanceEndPoints.DELETE(id));
        setAttendances(attendances.filter(a => a._id !== id));
        toast.success('Attendance record deleted successfully');
      } catch (error) {
        console.error('Error deleting attendance:', error);
        toast.error(error.response?.data?.message || 'Failed to delete attendance record');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Half Day':
        return 'bg-blue-100 text-blue-800';
      case 'Leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        
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
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Employee</label>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Date</label>
            <Input 
                type="date"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                className="border rounded-md"
                />
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Employee</label>            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="All Employees" />
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
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by Status</label>            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
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
          
          <Button 
            variant="outline"            onClick={() => {
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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableCaption>
            {filteredAttendances.length === 0 
              ? "No attendance records found" 
              : `Showing ${filteredAttendances.length} attendance records`}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.map(attendance => {
              const employee = employees.find(e => e._id === attendance.employeeId);
              return (
                <TableRow key={attendance._id}>
                  <TableCell className="font-medium">
                    {employee ? `${employee.firstname} ${employee.lastname}` : 'Unknown Employee'}
                  </TableCell>
                  <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </TableCell>
                  <TableCell>{attendance.checkInTime || 'N/A'}</TableCell>
                  <TableCell>{attendance.checkOutTime || 'N/A'}</TableCell>
                  <TableCell>{attendance.workHours || 0}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={attendance.comments}>
                    {attendance.comments || 'No comments'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
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