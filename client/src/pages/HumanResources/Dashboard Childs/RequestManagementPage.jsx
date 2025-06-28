import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllRequests, 
  createRequestByHR,
  updateRequestStatus, 
  updateRequestPriority,
  closeRequest,
  deleteRequest,
  setSelectedRequest,
  clearSelectedRequest,
  setFilters,
  clearError 
} from '../../../redux/Slices/RequestManagementSlice';
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Plus,
  AlertCircle,
  Edit,
  X
} from 'lucide-react';

const RequestManagementPage = () => {
  const dispatch = useDispatch();
  const { 
    requests, 
    selectedRequest, 
    loading, 
    error, 
    updateLoading, 
    deleteLoading,
    hrCreateLoading,
    closeLoading,
    priorityUpdateLoading,
    filters   
  } = useSelector(state => state.requestManagementReducer);
  
  const { employees } = useSelector(state => ({ 
    employees: state.HREmployeesPageReducer.data || [] 
  }));

  // Get HR data from auth state
  const { hr } = useSelector(state => ({ 
    hr: state.HRAuthReducer?.hr || {} 
  }));
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    hrComments: ''
  });
  const [newRequest, setNewRequest] = useState({
    requesttitle: '',
    requestconent: '',
    employeeID: '',
    priority: 'Medium',
    requestType: 'General'
  });
  // Toast notification system
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    dispatch(fetchAllRequests());
    dispatch(HandleGetHREmployees({ apiroute: "GETALL" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
  };  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateRequestStatus({
        id: selectedRequest._id,
        status: statusUpdate.status,
        hrComments: statusUpdate.hrComments,
        approvedby: hr._id
      })).unwrap();
      setShowModal(false);
      setStatusUpdate({ status: '', hrComments: '' });
      dispatch(clearSelectedRequest());
      showToast('Request status updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating request status:', error);
      showToast('Failed to update request status. Please try again.', 'error');
    }
  };
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createRequestByHR({
        ...newRequest,
        hrID: hr._id
      })).unwrap();
      setShowCreateModal(false);
      setNewRequest({
        requesttitle: '',
        requestconent: '',
        employeeID: '',
        priority: 'Medium',
        requestType: 'General'
      });
      showToast('Request created successfully!', 'success');
    } catch (error) {
      console.error('Error creating request:', error);
      showToast('Failed to create request. Please try again.', 'error');
    }
  };  const handleCloseRequest = async (request) => {
    if (window.confirm('Are you sure you want to close this request? This action cannot be undone.')) {
      try {
        await dispatch(closeRequest({
          id: request._id,
          closedBy: hr._id,
          hrComments: `Request closed by ${hr.firstname} ${hr.lastname}`
        })).unwrap();
        showToast('Request closed successfully!', 'success');
      } catch (error) {
        console.error('Error closing request:', error);
        showToast('Failed to close request. Please try again.', 'error');
      }
    }
  };
  const handlePriorityUpdate = async (requestId, newPriority) => {
    try {
      await dispatch(updateRequestPriority({
        id: requestId,
        priority: newPriority,
        updatedBy: hr._id
      })).unwrap();
      showToast('Priority updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating priority:', error);
      showToast('Failed to update priority. Please try again.', 'error');
    }
  };
  const handleViewRequest = (request) => {
    dispatch(setSelectedRequest(request));
    setStatusUpdate({
      status: request.status,
      hrComments: request.hrComments || ''
    });
    setShowModal(true);
  };
  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await dispatch(deleteRequest(id)).unwrap();
        showToast('Request deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting request:', error);
        showToast('Failed to delete request. Please try again.', 'error');
      }
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': 
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in review': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'denied':
      case 'rejected': return <XCircle size={16} className="text-red-600" />;
      case 'in review': return <Clock size={16} className="text-blue-600" />;
      case 'closed': return <X size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getRequestTypeLabel = (type) => {
    return type || 'General';
  };
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.requesttitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || request.status?.toLowerCase() === filters.status.toLowerCase();
    const matchesType = filters.type === 'all' || request.requestType === filters.type;
    const matchesPriority = filters.priority === 'all' || request.priority?.toLowerCase() === filters.priority.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-100">Request Management</h1>
          <p className="text-gray-600 dark:text-neutral-400">Manage employee requests and approvals</p>
        </div><div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            disabled={hrCreateLoading}
          >
            <Plus size={20} />
            {hrCreateLoading ? 'Creating...' : 'Create Request'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>
      </div>      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400"
              />
            </div>
          </div>
            {showFilters && (
            <div className="flex gap-3">              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in review">In Review</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="closed">Closed</option>
              </select>
                <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100"
              >
                <option value="all">All Types</option>
                <option value="IT Support">IT Support</option>
                <option value="HR Support">HR Support</option>
                <option value="Facilities">Facilities</option>
                <option value="Finance">Finance</option>
                <option value="General">General</option>
              </select>              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">        {[
          { label: 'Total Requests', value: requests.length, color: 'blue' },
          { label: 'Pending', value: requests.filter(r => r.status?.toLowerCase() === 'pending').length, color: 'yellow' },
          { label: 'Approved', value: requests.filter(r => r.status?.toLowerCase() === 'approved').length, color: 'green' },
          { label: 'Denied/Rejected', value: requests.filter(r => r.status?.toLowerCase() === 'denied' || r.status?.toLowerCase() === 'rejected').length, color: 'red' }        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4">
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-neutral-400">{stat.label}</div>
          </div>
        ))}
      </div>      {/* Requests List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700 border-b border-gray-200 dark:border-neutral-600">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Request</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Type</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Date</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Status</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Priority</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request._id} className="border-b border-gray-100 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors duration-200"><td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{request.requesttitle}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {request.requestconent}
                      </div>
                      {request.createdBy === 'HR' && (
                        <div className="text-xs text-blue-600 font-medium mt-1">Created by HR</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-900">
                        {request.employee?.firstname} {request.employee?.lastname}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRequestTypeLabel(request.requestType)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={request.priority || 'Medium'}
                      onChange={(e) => handlePriorityUpdate(request._id, e.target.value)}
                      disabled={priorityUpdateLoading}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                        request.priority?.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                        request.priority?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View & Update"
                      >
                        <Eye size={16} />
                      </button>                      {request.status?.toLowerCase() !== 'closed' && (
                        <button
                          onClick={() => handleCloseRequest(request)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Close Request"
                          disabled={closeLoading}
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        disabled={deleteLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No requests found</p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Request Details</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Information */}
              <div className="space-y-4">                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Title
                  </label>
                  <div className="text-gray-900">{selectedRequest.requesttitle}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee
                    </label>
                    <div className="text-gray-900">
                      {selectedRequest.employee?.firstname} {selectedRequest.employee?.lastname}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="text-gray-900">{getRequestTypeLabel(selectedRequest.requestType)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <div className="text-gray-900 capitalize">{selectedRequest.priority || 'Medium'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Submitted
                    </label>
                    <div className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="text-gray-900 whitespace-pre-wrap">{selectedRequest.requestconent}</div>
                </div>

                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments
                    </label>
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-blue-600">
                          <span>📎</span>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {attachment.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleStatusUpdate} className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800">Update Request Status</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="in review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HR Comments
                  </label>
                  <textarea
                    value={statusUpdate.hrComments}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, hrComments: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add comments about this request..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updateLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Create New Request</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    value={newRequest.requesttitle}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requesttitle: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter request title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  <select
                    value={newRequest.employeeID}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, employeeID: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstname} {employee.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Type
                  </label>
                  <select
                    value={newRequest.requestType}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requestType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="IT Support">IT Support</option>
                    <option value="HR Support">HR Support</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newRequest.requestconent}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, requestconent: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the request in detail..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={hrCreateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hrCreateLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {hrCreateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full ${
          toast.type === 'success' ? 'bg-green-500 text-white' :
          toast.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagementPage;
