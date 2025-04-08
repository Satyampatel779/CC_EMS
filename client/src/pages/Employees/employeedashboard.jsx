if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000'; // Update this to match your backend URL
}
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

export const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [clockStatus, setClockStatus] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [lastActivity, setLastActivity] = useState(null);
  const { toast } = useToast();

  const user = useSelector((state) => state.employeereducer?.user);

  // First, update the useEffect to properly manage loading

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
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
      // Load data in sequence to avoid race conditions
      await fetchEmployeeData();
      await fetchAttendanceStatus();
      await fetchAttendanceHistory();
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      // Always set loading to false when all requests are complete
      setLoading(false);
    }
  };

  loadDashboard();
}, [user]);

// Remove setLoading from the fetchEmployeeData function
const fetchEmployeeData = async () => {
  try {
    // Remove this line: setLoading(true);
    const res = await axios.get(`/api/v1/employee/${user?._id}`, getAuthHeaders());
    if (res.data.success) {
      setEmployeeData(res.data.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.data.message || "Failed to load employee data"
      });
    }
    // Remove this line: setLoading(false);
  } catch (error) {
    console.error("Error fetching employee data:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load employee data"
    });
    // Remove this line: setLoading(false);
  }
};

// Remove the finally blocks from fetchAttendanceStatus and fetchAttendanceHistory
const fetchAttendanceStatus = async () => {
  try {
    const res = await axios.get(`/api/v1/attendance/employee-status/${user?._id}`, getAuthHeaders());
    if (res.data.success) {
      setClockStatus(res.data.data.isClockedIn);
      setLastActivity(res.data.data.lastActivity);
    }
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    // Ensure we don't block the UI even if this API fails
  }
  // Remove the finally block
};

const fetchAttendanceHistory = async () => {
  try {
    const res = await axios.get(`/api/v1/attendance/employee-history/${user?._id}`, getAuthHeaders());
    if (res.data.success) {
      setAttendanceHistory(res.data.data || []);
    }
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    // Ensure we don't block the UI even if this API fails
  }
  // Remove the finally block
};
  const handleClockIn = async () => {
    try {
      const res = await axios.post('/api/v1/attendance/clock-in', { employeeId: user?._id }, getAuthHeaders());
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Successfully clocked in"
        });
        setClockStatus(true);
        setLastActivity({
          type: 'clockIn',
          timestamp: new Date()
        });
        fetchAttendanceHistory();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.data.message || 'Failed to clock in'
        });
      }
    } catch (error) {
      console.error("Error clocking in:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to clock in'
      });
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await axios.post('/api/v1/attendance/clock-out', { employeeId: user?._id }, getAuthHeaders());
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Successfully clocked out"
        });
        setClockStatus(false);
        setLastActivity({
          type: 'clockOut',
          timestamp: new Date()
        });
        fetchAttendanceHistory();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.data.message || 'Failed to clock out'
        });
      }
    } catch (error) {
      console.error("Error clocking out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to clock out'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div role="status">
          <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Employee Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2"><span className="font-semibold">Name:</span> {employeeData.firstname} {employeeData.lastname}</p>
                    <p className="mb-2"><span className="font-semibold">Email:</span> {employeeData.email}</p>
                    <p className="mb-2"><span className="font-semibold">Phone:</span> {employeeData.contactnumber}</p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-semibold">Department:</span> {employeeData.department?.name || 'Not Assigned'}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${employeeData.isverified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {employeeData.isverified ? 'Verified' : 'Not Verified'}
                      </span>
                    </p>
                    {employeeData.joinDate && (
                      <p className="mb-2"><span className="font-semibold">Join Date:</span> {moment(employeeData.joinDate).format('YYYY-MM-DD')}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Status</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <p className="text-lg font-medium mb-1">Current Status:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${clockStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {clockStatus ? "Clocked In" : "Clocked Out"}
                </span>
              </div>
              
              {lastActivity && (
                <p className="text-sm text-gray-500 mb-4">
                  Last activity: {moment(lastActivity.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </p>
              )}
              
              <div className="flex justify-center gap-3">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleClockIn} 
                  disabled={clockStatus}
                >
                  Clock In
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleClockOut} 
                  disabled={!clockStatus}
                >
                  Clock Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance History</CardTitle>
          </CardHeader>
          <CardContent>
            {!attendanceHistory || attendanceHistory.length === 0 ? (
              <p className="text-gray-500">No recent attendance records found</p>
            ) : (
              <div className="space-y-2">
                {attendanceHistory.slice(0, 5).map((record, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${record.status === 'Present' || record.checkInTime ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {record.status}
                        </span>
                        {record.checkInTime && <span className="ml-2 text-sm">(In: {record.checkInTime})</span>}
                        {record.checkOutTime && <span className="ml-2 text-sm">(Out: {record.checkOutTime})</span>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {moment(record.date).format('YYYY-MM-DD')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;