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
import { Plus, Edit, Trash2, Eye, Users, Calendar, MapPin, DollarSign } from 'lucide-react';

const RecruitmentManagementPage = () => {
  const dispatch = useDispatch();
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
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await dispatch(createRecruitment(formData)).unwrap();
      } else if (modalMode === 'edit') {
        await dispatch(updateRecruitment({ 
          id: selectedRecruitment._id, 
          recruitmentData: formData 
        })).unwrap();
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (recruitment) => {
    setSelectedRecruitment(recruitment);
    setFormData({
      title: recruitment.title,
      department: recruitment.department?._id || recruitment.department,
      position: recruitment.position,
      description: recruitment.description,
      requirements: recruitment.requirements,
      location: recruitment.location,
      salaryRange: recruitment.salaryRange,
      applicationDeadline: new Date(recruitment.applicationDeadline).toISOString().split('T')[0],
      status: recruitment.status,
      numberOfPositions: recruitment.numberOfPositions,
      employmentType: recruitment.employmentType,
      experienceLevel: recruitment.experienceLevel,
      benefits: recruitment.benefits
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (recruitment) => {
    dispatch(setSelectedRecruitment(recruitment));
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recruitment?')) {
      try {
        await dispatch(deleteRecruitment(id)).unwrap();
      } catch (error) {
        console.error('Error deleting recruitment:', error);
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
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
    dispatch(clearSelectedRecruitment());
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };

  const formatSalaryRange = (salaryRange) => {
    if (salaryRange?.min && salaryRange?.max) {
      return `$${salaryRange.min.toLocaleString()} - $${salaryRange.max.toLocaleString()}`;
    }
    return 'Not specified';
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-neutral-100">Recruitment Management</h1>
          <p className="text-gray-600 dark:text-neutral-400">Manage job postings and recruitment processes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          New Recruitment
        </button>
      </div>      {/* Recruitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recruitments.map((recruitment) => (
          <div key={recruitment._id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-neutral-700 hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 truncate">{recruitment.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recruitment.status)}`}>
                {recruitment.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                <Users size={16} />
                <span>{recruitment.department?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                <MapPin size={16} />
                <span>{recruitment.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                <DollarSign size={16} />
                <span>{formatSalaryRange(recruitment.salaryRange)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                <Calendar size={16} />
                <span>Deadline: {new Date(recruitment.applicationDeadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-neutral-500">
                {recruitment.numberOfPositions} position(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(recruitment)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(recruitment)}
                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(recruitment._id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                  disabled={deleteLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recruitments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-neutral-500 text-lg">No recruitments found</p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create First Recruitment
          </button>
        </div>
      )}      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                {modalMode === 'create' ? 'Create New Recruitment' : 
                 modalMode === 'edit' ? 'Edit Recruitment' : 'Recruitment Details'}
              </h2>
            </div>            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    name="salaryRange.min"
                    value={formData.salaryRange.min}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    name="salaryRange.max"
                    value={formData.salaryRange.max}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Number of Positions
                  </label>
                  <input
                    type="number"
                    name="numberOfPositions"
                    value={formData.numberOfPositions}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    disabled={modalMode === 'view'}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                  disabled={modalMode === 'view'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={modalMode === 'view'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
                  Benefits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-gray-300 dark:border-neutral-600 rounded-lg px-3 py-2 bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={modalMode === 'view'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 dark:text-neutral-300 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    disabled={createLoading || updateLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {(createLoading || updateLoading) ? 'Saving...' : 
                     modalMode === 'create' ? 'Create Recruitment' : 'Update Recruitment'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentManagementPage;
