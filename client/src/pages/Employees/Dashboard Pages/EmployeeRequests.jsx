import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  MessageSquare,
  Edit,
  AlertCircle,
  X,
  Send,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchEmployeeRequests, 
  createRequest, 
  updateRequestContent,
  clearError,
  clearEmployeeRequests
} from '../../../redux/Slices/RequestManagementSlice';

const EmployeeRequests = () => {
  const dispatch = useDispatch();
  const { 
    employeeRequests: requests, 
    createLoading, 
    updateLoading, 
    loading, 
    error 
  } = useSelector(state => state.requestManagementReducer);
    // Get employee data from auth or employee state
  const employee = useSelector(state => state.employeeAuthReducer?.employee);
  const employeeId = employee?._id;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [toast, setToast] = useState(null);
  const [newRequest, setNewRequest] = useState({
    requesttitle: '',
    requestconent: '',
    priority: 'Medium',
    requestType: 'General'
  });  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeRequests(employeeId));
    }
    
    return () => {
      dispatch(clearEmployeeRequests());
    };  }, [dispatch, employeeId]);
  // Toast notification system
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch, showToast]);
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
      try {
      const requestData = {
        requesttitle: newRequest.requesttitle,
        requestconent: newRequest.requestconent,
        employeeID: employeeId,
        priority: newRequest.priority,
        requestType: newRequest.requestType
      };

      await dispatch(createRequest(requestData)).unwrap();
      
      setNewRequest({
        requesttitle: '',
        requestconent: '',
        priority: 'Medium',
        requestType: 'General'
      });
      setIsDialogOpen(false);
      showToast('Request submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast('Failed to submit request. Please try again.', 'error');
    }
  };
  const handleEditRequest = async (e) => {
    e.preventDefault();
    
    try {
      const requestData = {
        requestID: editingRequest._id,
        requesttitle: newRequest.requesttitle,
        requestconent: newRequest.requestconent,
        priority: newRequest.priority,
        requestType: newRequest.requestType
      };

      await dispatch(updateRequestContent(requestData)).unwrap();
      
      setEditingRequest(null);
      setNewRequest({
        requesttitle: '',
        requestconent: '',
        priority: 'Medium',
        requestType: 'General'
      });
      setIsDialogOpen(false);
      showToast('Request updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating request:', error);
      showToast('Failed to update request. Please try again.', 'error');
    }
  };

  const openEditDialog = (request) => {
    setEditingRequest(request);
    setNewRequest({
      requesttitle: request.requesttitle,
      requestconent: request.requestconent,
      priority: request.priority || 'Medium',
      requestType: request.requestType || 'General'
    });
    setIsDialogOpen(true);
  };

  const resetDialog = () => {
    setEditingRequest(null);
    setNewRequest({
      requesttitle: '',
      requestconent: '',
      priority: 'Medium',
      requestType: 'General'
    });
    setIsDialogOpen(false);
  };  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'denied':
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'in review':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requesttitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border backdrop-blur-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
          'bg-blue-500/20 border-blue-500/30 text-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-purple-400" />
            My Requests
          </h1>
          <p className="text-gray-300 text-lg mt-2">Submit and track your requests to HR and IT support</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetDialog}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Request
            </Button>
          </DialogTrigger>          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRequest ? 'Edit Request' : 'Submit New Request'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingRequest ? handleEditRequest : handleSubmitRequest} className="space-y-4">
              <div>
                <Label htmlFor="requestType">Request Type</Label>
                <Select 
                  value={newRequest.requestType} 
                  onValueChange={(value) => setNewRequest({...newRequest, requestType: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Support">IT Support</SelectItem>
                    <SelectItem value="HR Support">HR Support</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requesttitle">Subject</Label>
                <Input
                  id="requesttitle"
                  value={newRequest.requesttitle}
                  onChange={(e) => setNewRequest({...newRequest, requesttitle: e.target.value})}
                  placeholder="Brief description of your request"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newRequest.priority} 
                  onValueChange={(value) => setNewRequest({...newRequest, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestconent">Description</Label>
                <Textarea
                  id="requestconent"
                  value={newRequest.requestconent}
                  onChange={(e) => setNewRequest({...newRequest, requestconent: e.target.value})}
                  placeholder="Detailed description of your request"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={createLoading || updateLoading}
                >
                  {(createLoading || updateLoading) ? 'Processing...' : 
                   editingRequest ? 'Update Request' : 'Submit Request'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-xl font-semibold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-semibold">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-semibold">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Denied/Rejected</p>                <p className="text-xl font-semibold">
                  {requests.filter(r => r.status?.toLowerCase() === 'denied' || r.status?.toLowerCase() === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="in review">In Review</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">        {filteredRequests.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{request.requesttitle}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{request.requestType}</span>
                    <span>•</span>
                    <span>Submitted on {new Date(request.createdAt).toLocaleDateString()}</span>
                    {request.createdBy === 'HR' && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">Created by HR</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority || 'Medium'}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                  {request.status?.toLowerCase() === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(request)}
                      className="h-6 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-700">Description:</p>
                  <p className="text-gray-600">{request.requestconent}</p>
                </div>
                {request.hrComments && (
                  <div>
                    <p className="font-medium text-sm text-gray-700">HR Response:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">{request.hrComments}</p>
                      {request.updatedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Updated on {new Date(request.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {request.status?.toLowerCase() === 'closed' && request.closedDate && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Closed on:</strong> {new Date(request.closedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more requests.'
                  : 'Submit your first request to get started.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequests;
