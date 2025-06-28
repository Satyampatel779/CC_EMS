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
  X
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
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'denied':
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'in review':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'closed':
        return 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300';
      default:
        return 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300';
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">Submit and track your requests to HR and IT support</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
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
