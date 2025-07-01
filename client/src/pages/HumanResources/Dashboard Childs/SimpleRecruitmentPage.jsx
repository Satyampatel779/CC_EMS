import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRecruitments, 
  createRecruitment, 
  updateRecruitment, 
  deleteRecruitment,
  setSelectedRecruitment,
  clearSelectedRecruitment,
  clearError 
} from '../../../redux/Slices/RecruitmentSlice';
import { HandleGetHRDepartments } from '../../../redux/Thunks/HRDepartmentPageThunk';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Briefcase,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Simple toast replacement
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      const msg = `${title}: ${description}`;
      if (variant === 'destructive') {
        alert('Error: ' + msg);
      } else {
        alert('Success: ' + msg);
      }
    }
  };
};

// Simple Input component
const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full p-2 border rounded ${className}`}
    {...props}
  />
);

// Simple Textarea component
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full p-2 border rounded min-h-[80px] ${className}`}
    {...props}
  />
);

// Simple Button component
const Button = ({ children, className = "", variant = "default", onClick, disabled, ...props }) => {
  const baseClasses = "px-4 py-2 rounded transition-colors";
  const variantClasses = variant === "outline" ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700";
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Select component
const Select = ({ children, value, onValueChange }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full p-2 border rounded bg-white"
    >
      {children}
    </select>
  </div>
);

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

// Simple Modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="float-right text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const RecruitmentManagementPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { 
    recruitments = [], 
    selectedRecruitment, 
    loading, 
    error, 
    createLoading, 
    updateLoading, 
    deleteLoading 
  } = useSelector(state => state.recruitmentReducer || {});
  const { departments = [] } = useSelector(state => ({ 
    departments: state.HRDepartmentPageReducer?.data || [] 
  }));

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    position: '',
    description: '',
    requirements: '',
    location: '',
    salaryRange: { min: '', max: '' },
    applicationDeadline: '',
    status: 'active',
    numberOfPositions: 1,
    employmentType: 'full-time',
    experienceLevel: 'entry',
    benefits: ''
  });

  // Helper functions
  const getStatusPill = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.draft}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await dispatch(deleteRecruitment(id)).unwrap();
      toast({ title: 'Success', description: 'Job posting deleted successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete job posting', variant: 'destructive' });
    }
  };

  // Stats
  const total = Array.isArray(recruitments) ? recruitments.length : 0;
  const activeCount = Array.isArray(recruitments) ? recruitments.filter(r => r.status === 'active').length : 0;
  const draftCount = Array.isArray(recruitments) ? recruitments.filter(r => r.status === 'draft').length : 0;
  const closedCount = Array.isArray(recruitments) ? recruitments.filter(r => r.status === 'closed').length : 0;
  
  const stats = [
    { title: 'Total Postings', value: total, icon: Briefcase, color: 'text-blue-500' },
    { title: 'Active', value: activeCount, icon: CheckCircle, color: 'text-green-500' },
    { title: 'Draft', value: draftCount, icon: Clock, color: 'text-gray-500' },
    { title: 'Closed', value: closedCount, icon: XCircle, color: 'text-red-500' }
  ];

  // Filter recruitments
  const filteredRecruitments = React.useMemo(() => {
    if (!Array.isArray(recruitments)) return [];
    
    return recruitments.filter(recruitment => {
      const matchesSearch = searchQuery === '' || 
        recruitment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruitment.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruitment.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || recruitment.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || 
        recruitment.department === departmentFilter ||
        recruitment.department?.name === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [recruitments, searchQuery, statusFilter, departmentFilter]);

  // Effects
  useEffect(() => {
    dispatch(fetchRecruitments());
    dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', department: '', position: '', description: '', requirements: '',
      location: '', salaryRange: { min: '', max: '' }, applicationDeadline: '',
      status: 'active', numberOfPositions: 1, employmentType: 'full-time',
      experienceLevel: 'entry', benefits: ''
    });
    dispatch(clearSelectedRecruitment());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await dispatch(createRecruitment(formData)).unwrap();
        toast({ title: "Success", description: "Job posting created successfully" });
      } else if (modalMode === 'edit') {
        await dispatch(updateRecruitment({ 
          id: selectedRecruitment._id, 
          recruitmentData: formData 
        })).unwrap();
        toast({ title: "Success", description: "Job posting updated successfully" });
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save job posting", variant: "destructive" });
    }
  };

  const handleEdit = (recruitment) => {
    dispatch(setSelectedRecruitment(recruitment));
    setFormData({
      title: recruitment.title || '',
      department: recruitment.department || '',
      position: recruitment.position || '',
      description: recruitment.description || '',
      requirements: recruitment.requirements || '',
      location: recruitment.location || '',
      salaryRange: recruitment.salaryRange || { min: '', max: '' },
      applicationDeadline: recruitment.applicationDeadline ? 
        new Date(recruitment.applicationDeadline).toISOString().split('T')[0] : '',
      status: recruitment.status || 'active',
      numberOfPositions: recruitment.numberOfPositions || 1,
      employmentType: recruitment.employmentType || 'full-time',
      experienceLevel: recruitment.experienceLevel || 'entry',
      benefits: recruitment.benefits || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recruitment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
              <p className="text-gray-600">Manage job postings and recruitment processes</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setModalMode('create');
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Job Posting
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search job postings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept._id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Job Postings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecruitments.length > 0 ? (
          filteredRecruitments.map((recruitment) => (
            <div key={recruitment._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {recruitment.title}
                </h3>
                {getStatusPill(recruitment.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{recruitment.department?.name || recruitment.department || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{recruitment.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {recruitment.salaryRange?.min && recruitment.salaryRange?.max
                      ? `$${recruitment.salaryRange.min.toLocaleString()} - $${recruitment.salaryRange.max.toLocaleString()}`
                      : 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Deadline: {recruitment.applicationDeadline 
                      ? new Date(recruitment.applicationDeadline).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm font-medium text-gray-700">
                  {recruitment.employmentType?.charAt(0).toUpperCase() + recruitment.employmentType?.slice(1) || 'Full-time'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(recruitment)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(recruitment._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No job postings found</h3>
            <p className="text-gray-500 mb-4">Create your first job posting to start recruiting</p>
            <Button
              onClick={() => {
                resetForm();
                setModalMode('create');
                setShowModal(true);
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Job Posting
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">
            {modalMode === 'create' ? 'Create New Job Posting' : 'Edit Job Posting'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter job title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectItem value="">Select Department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position *</label>
                <Input
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Enter position"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job responsibilities..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Requirements</label>
              <Textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="List the requirements..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading || updateLoading}>
                {modalMode === 'create' ? 'Create Job Posting' : 'Update Job Posting'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default RecruitmentManagementPage;
