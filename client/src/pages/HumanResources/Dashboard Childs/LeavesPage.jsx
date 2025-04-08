import React, { useState, useEffect } from "react";
import { Button, Card, Modal } from "@/components/ui";
import axios from "@/lib/axios";
import { useAuth } from "@/context/auth";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LeaveEndPoints } from "@/redux/apis/APIsEndpoints";

export function LeavesPage() {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(LeaveEndPoints.GETALL);
      if (response.data.success) {
        setLeaveRequests(response.data.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to fetch leave requests"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "An error occurred while fetching leave requests"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleApprove = async (leaveId) => {
    try {
      if (!user || !user._id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User information is missing. Please log in again."
        });
        return;
      }
      
      const response = await axios.patch(LeaveEndPoints.HR_UPDATE, {
        leaveID: leaveId,
        status: "Approved",
        HRID: user._id // Changed from approvedby to match the controller
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Leave request approved successfully"
        });
        fetchLeaveRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to approve leave"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "An error occurred while approving leave"
      });
    }
  };

  const handleReject = async (leaveId) => {
    try {
      if (!user || !user._id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User information is missing. Please log in again."
        });
        return;
      }
      
      const response = await axios.patch(LeaveEndPoints.HR_UPDATE, {
        leaveID: leaveId,
        status: "Rejected",
        HRID: user._id // Changed from approvedby to match the controller
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Leave request rejected successfully"
        });
        fetchLeaveRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to reject leave"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "An error occurred while rejecting leave"
      });
    }
  };

  const viewDetails = async (leaveId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(LeaveEndPoints.GETONE(leaveId));
      
      if (response.data.success) {
        setSelectedLeave(response.data.data);
        setShowModal(true);
      } else {
        toast.error(response.data.message || "Failed to fetch leave details");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred while fetching leave details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const calculateBusinessDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset hours to ensure full day count
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let count = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Only count Monday to Friday (0 = Sunday, 6 = Saturday)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };

  const handleExport = () => {
    // Convert leaves data to CSV
    const headers = ["Employee Name", "Department", "Leave Type", "Start Date", "End Date", "Status", "Reason"];
    const csvData = leaveRequests.map(leave => [
      `${leave.employee?.firstname || ''} ${leave.employee?.lastname || ''}`,
      leave.employee?.department || '',
      leave.title,
      formatDate(leave.startdate),
      formatDate(leave.enddate),
      leave.status,
      leave.reason ? leave.reason.replace(/,/g, ";") : ''  // Replace commas with semicolons to avoid CSV format issues
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leave_requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesStatus = filterStatus === "All" || leave.status === filterStatus;
    const employeeName = `${leave.employee?.firstname || ''} ${leave.employee?.lastname || ''}`.toLowerCase();
    const leaveType = leave.title?.toLowerCase() || '';
    const matchesSearch = 
      searchTerm === "" || 
      employeeName.includes(searchTerm.toLowerCase()) || 
      leaveType.includes(searchTerm.toLowerCase()) ||
      leave.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const pendingCount = leaveRequests.filter(leave => leave.status === "Pending").length;
  const approvedCount = leaveRequests.filter(leave => leave.status === "Approved").length;
  const rejectedCount = leaveRequests.filter(leave => leave.status === "Rejected").length;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Employee Leave Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
          <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
          <p className="text-sm text-yellow-600">Awaiting your approval</p>
        </Card>
        <Card className="p-4 bg-green-50 border border-green-200">
          <h3 className="text-lg font-medium text-green-800">Approved</h3>
          <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
          <p className="text-sm text-green-600">Successfully approved leaves</p>
        </Card>
        <Card className="p-4 bg-red-50 border border-red-200">
          <h3 className="text-lg font-medium text-red-800">Rejected</h3>
          <p className="text-3xl font-bold text-red-900">{rejectedCount}</p>
          <p className="text-sm text-red-600">Rejected leave requests</p>
        </Card>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Leave Requests</h2>
          <p className="text-gray-600">Manage employee leave requests</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employee, leave type..."
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-80"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading leave requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {leave.employee?.firstname} {leave.employee?.lastname}
                            </div>
                            <div className="text-sm text-gray-500">{leave.employee?.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.startdate) === formatDate(leave.enddate) 
                            ? formatDate(leave.startdate) 
                            : `${formatDate(leave.startdate)} to ${formatDate(leave.enddate)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => viewDetails(leave._id)} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {leave.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => handleApprove(leave._id)} 
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(leave._id)} 
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || filterStatus !== "All" 
                        ? "No matching leave requests found" 
                        : "No leave requests found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Leave Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Employee</p>
                <p className="font-medium">
                  {selectedLeave.employee?.firstname} {selectedLeave.employee?.lastname}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{selectedLeave.employee?.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Leave Type</p>
                <p className="font-medium">{selectedLeave.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(selectedLeave.status)}`}>
                  {selectedLeave.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(selectedLeave.startdate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">{formatDate(selectedLeave.enddate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{calculateBusinessDays(selectedLeave.startdate, selectedLeave.enddate)} business days</p>
              </div>
              {selectedLeave.approvedby && (
                <div>
                  <p className="text-sm text-gray-500">Approved/Rejected By</p>
                  <p className="font-medium">
                    {selectedLeave.approvedby.firstname} {selectedLeave.approvedby.lastname}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{formatDate(selectedLeave.createdAt)}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Reason</p>
              <p className="font-medium">{selectedLeave.reason}</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              {selectedLeave.status === "Pending" && (
                <>
                  <Button 
                    onClick={() => {
                      handleApprove(selectedLeave._id);
                      setShowModal(false);
                    }} 
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => {
                      handleReject(selectedLeave._id);
                      setShowModal(false);
                    }} 
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button 
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default LeavesPage;
