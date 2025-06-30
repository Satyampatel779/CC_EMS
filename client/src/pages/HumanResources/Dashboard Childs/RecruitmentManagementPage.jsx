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
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Building,
  Star,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RecruitmentManagementPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { 
    recruitments, 
    selectedRecruitment, 
    loading, 
    error, 
    createLoading, 
    updateLoading, 
    deleteLoading 
  } = useSelector(state => state.recruitmentReducer);
  const { departments } = useSelector(state => ({ 
    departments: state.HRDepartmentPageReducer.data || [] 
  }));

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
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
    salaryRange: {
      min: '',
      max: ''
    },
    applicationDeadline: '',
    status: 'active',
    numberOfPositions: 1,
    employmentType: 'full-time',
    experienceLevel: 'entry',
    benefits: ''
  });

  useEffect(() => {
    dispatch(fetchRecruitments());
    dispatch(HandleGetHRDepartments({ apiroute: "GETALL" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, dispatch, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
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
    dispatch(clearSelectedRecruitment());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await dispatch(createRecruitment(formData)).unwrap();
        toast({
          title: "Success",
          description: "Job posting created successfully",
        });
      } else if (modalMode === 'edit') {
        await dispatch(updateRecruitment({ 
          id: selectedRecruitment._id, 
          recruitmentData: formData 
        })).unwrap();
        toast({
          title: "Success",
          description: "Job posting updated successfully",
        });
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save job posting",
        variant: "destructive",
      });
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
      applicationDeadline: recruitment.applicationDeadline ? new Date(recruitment.applicationDeadline).toISOString().split('T')[0] : '',
      status: recruitment.status || 'active',
      numberOfPositions: recruitment.numberOfPositions || 1,
      employmentType: recruitment.employmentType || 'full-time',
      experienceLevel: recruitment.experienceLevel || 'entry',
      benefits: recruitment.benefits || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (recruitment) => {
    dispatch(setSelectedRecruitment(recruitment));
  };

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
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Recruitment Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage job postings and recruitment processes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetForm();
                      setModalMode('create');
                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Job Posting
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl sm:max-w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {modalMode === 'create' ? 'Create New Job Posting' : 
                       modalMode === 'edit' ? 'Edit Job Posting' : 'Job Posting Details'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Job Title *</label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter job title"
                          required
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Department *</label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange('department', value)}
                          disabled={modalMode === 'view'}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept._id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Position *</label>
                        <Input
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="Enter position"
                          required
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location *</label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Enter location"
                          required
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Min Salary</label>
                        <Input
                          type="number"
                          name="salaryRange.min"
                          value={formData.salaryRange.min}
                          onChange={handleInputChange}
                          placeholder="Minimum salary"
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Max Salary</label>
                        <Input
                          type="number"
                          name="salaryRange.max"
                          value={formData.salaryRange.max}
                          onChange={handleInputChange}
                          placeholder="Maximum salary"
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Application Deadline</label>
                        <Input
                          type="date"
                          name="applicationDeadline"
                          value={formData.applicationDeadline}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Number of Positions</label>
                        <Input
                          type="number"
                          name="numberOfPositions"
                          value={formData.numberOfPositions}
                          onChange={handleInputChange}
                          min="1"
                          disabled={modalMode === 'view'}
                          className="bg-white/70 dark:bg-slate-700/70"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employment Type</label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) => handleSelectChange('employmentType', value)}
                          disabled={modalMode === 'view'}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience Level</label>
                        <Select
                          value={formData.experienceLevel}
                          onValueChange={(value) => handleSelectChange('experienceLevel', value)}
                          disabled={modalMode === 'view'}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior Level</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleSelectChange('status', value)}
                          disabled={modalMode === 'view'}
                        >
                          <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Job Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the job responsibilities and role..."
                        disabled={modalMode === 'view'}
                        className="bg-white/70 dark:bg-slate-700/70 min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Requirements</label>
                      <Textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        placeholder="List the requirements and qualifications..."
                        disabled={modalMode === 'view'}
                        className="bg-white/70 dark:bg-slate-700/70 min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Benefits</label>
                      <Textarea
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleInputChange}
                        placeholder="Describe the benefits and perks..."
                        disabled={modalMode === 'view'}
                        className="bg-white/70 dark:bg-slate-700/70"
                      />
                    </div>
                    {modalMode !== 'view' && (
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowModal(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                          disabled={createLoading || updateLoading}
                        >
                          {modalMode === 'create' ? 'Create Job Posting' : 'Update Job Posting'}
                        </Button>
                      </div>
                    )}
                    {modalMode === 'view' && (
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowModal(false)}
                          className="rounded-xl"
                        >
                          Close
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => {
                            setModalMode('edit');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                        >
                          Edit Job Posting
                        </Button>
                      </div>
                    )}
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

        {/* Filters */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search job postings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 dark:bg-slate-700/70"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="bg-white/70 dark:bg-slate-700/70">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Postings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecruitments.length > 0 ? (
            filteredRecruitments.map((recruitment) => (
              <div key={recruitment._id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {recruitment.title}
                  </h3>
                  {getStatusPill(recruitment.status)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{recruitment.department?.name || recruitment.department || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{recruitment.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {recruitment.salaryRange?.min && recruitment.salaryRange?.max
                        ? `$${recruitment.salaryRange.min.toLocaleString()} - $${recruitment.salaryRange.max.toLocaleString()}`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Deadline: {recruitment.applicationDeadline 
                        ? new Date(recruitment.applicationDeadline).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Briefcase className="w-4 h-4" />
                    <span>{recruitment.numberOfPositions} position(s)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {recruitment.employmentType?.charAt(0).toUpperCase() + recruitment.employmentType?.slice(1) || 'Full-time'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(recruitment)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(recruitment)}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recruitment._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                      disabled={deleteLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-16 shadow-xl text-center">
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-3">No job postings found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first job posting to start recruiting</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setModalMode('create');
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Job Posting
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentManagementPage;
