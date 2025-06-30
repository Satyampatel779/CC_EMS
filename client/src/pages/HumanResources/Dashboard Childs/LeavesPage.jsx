import React, { useState, useEffect } from "react";
import { Button, Card, Modal } from "@/components/ui";
import axios from "@/lib/axios";
import { useAuth } from "@/context/auth";
import { format } from "date-fns";
import { Search, Calendar, Clock, CheckCircle, XCircle, FileText, Download, Filter, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LeaveEndPoints } from "@/redux/apis/APIsEndpoints";

export function LeavesPage() {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const authState = useAuth();
  const user = authState?.user || null;
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
        HRID: user._id
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
        HRID: user._id
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
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.message || "Failed to fetch leave details"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "An error occurred while fetching leave details"
      });
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
      case "Approved": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
    }
  };

  const calculateBusinessDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    let count = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
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
      leave.reason ? leave.reason.replace(/,/g, ";") : ''
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
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
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Leave Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage employee leave requests and approvals
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExport}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Leave Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Pending</h3>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{pendingCount}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">Awaiting approval</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-2xl">
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Approved</h3>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{approvedCount}</p>
                  <p className="text-sm text-green-600 dark:text-green-300">Successfully approved</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-2xl">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 dark:from-red-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Rejected</h3>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">{rejectedCount}</p>
                  <p className="text-sm text-red-600 dark:text-red-300">Declined requests</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-2xl">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search employees or leave types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold">{filteredLeaves.length}</span> of <span className="font-semibold">{leaveRequests.length}</span> requests
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-xl overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading leave requests...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-3">No leave requests found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left p-6 font-semibold text-slate-700 dark:text-slate-300">Employee</th>
                    <th className="text-left p-6 font-semibold text-slate-700 dark:text-slate-300">Leave Details</th>
                    <th className="text-left p-6 font-semibold text-slate-700 dark:text-slate-300">Duration</th>
                    <th className="text-left p-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-center p-6 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave, index) => (
                    <tr key={leave._id || index} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-700/30 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/20 dark:bg-slate-800/20' : 'bg-transparent'}`}>
                      <td className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {`${leave.employee?.firstname?.[0] || ''}${leave.employee?.lastname?.[0] || ''}`}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {leave.employee?.firstname} {leave.employee?.lastname}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {leave.employee?.department || 'No Department'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{leave.title}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>{formatDate(leave.startdate)}</span>
                            <span>→</span>
                            <span>{formatDate(leave.enddate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {calculateBusinessDays(leave.startdate, leave.enddate)} days
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">Business days</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${getStatusClass(leave.status)}`}>
                          {leave.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => viewDetails(leave._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {leave.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(leave._id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all duration-200 hover:scale-110"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(leave._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Leave Details Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Leave Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedLeave.employee?.firstname} {selectedLeave.employee?.lastname}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Department</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedLeave.employee?.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Leave Type</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedLeave.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium border ${getStatusClass(selectedLeave.status)}`}>
                      {selectedLeave.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Start Date</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(selectedLeave.startdate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">End Date</label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(selectedLeave.enddate)}
                    </p>
                  </div>
                </div>

                {selectedLeave.reason && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reason</label>
                    <p className="text-slate-900 dark:text-slate-100 mt-2 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      {selectedLeave.reason}
                    </p>
                  </div>
                )}

                {selectedLeave.status === "Pending" && (
                  <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        handleApprove(selectedLeave._id);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Approve Leave
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedLeave._id);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Reject Leave
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeavesPage;
