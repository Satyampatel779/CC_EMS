import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllHRProfiles,
  createHRProfile,
  updateHRProfile,
  deleteHRProfile,
  updateHRPermissions,
  changeHRPassword,
  setSelectedProfile,
  clearSelectedProfile,
  setFilters,
  clearError 
} from '../../../redux/Slices/HRProfilesSlice';
import { HandleGetHRDepartments } from '../../../redux/Thunks/HRDepartmentPageThunk';
import { Plus, Edit, Trash2, Eye, Shield, Key, User, Mail, Phone, Building } from 'lucide-react';

const HRProfilesPage = () => {
  const dispatch = useDispatch();
  const { 
    hrProfiles, 
    selectedProfile, 
    loading, 
    error, 
    createLoading, 
    updateLoading, 
    deleteLoading,
    passwordChangeLoading,
    filters 
  } = useSelector(state => state.hrProfilesReducer);
  const { data: departments } = useSelector(state => state.HRDepartmentPageReducer);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view, permissions, password
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'HR_Specialist',
    status: 'active',
    permissions: {
      canCreateEmployee: false,
      canEditEmployee: false,
      canDeleteEmployee: false,
      canViewSalary: false,
      canManageSalary: false,
      canManageLeaves: false,
      canManageRecruitment: false,
      canManageRequests: false,
      canViewReports: false,
      canManageCalendar: false
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  useEffect(() => {
    dispatch(fetchAllHRProfiles());
    dispatch(HandleGetHRDepartments({ apiroute: 'GETALL' }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('permissions.')) {
      const permissionName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await dispatch(createHRProfile(formData)).unwrap();
      } else if (modalMode === 'edit') {
        await dispatch(updateHRProfile({ 
          id: selectedProfile._id, 
          profileData: formData 
        })).unwrap();
      } else if (modalMode === 'permissions') {
        await dispatch(updateHRPermissions({
          id: selectedProfile._id,
          permissions: formData.permissions
        })).unwrap();
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      await dispatch(changeHRPassword({
        id: selectedProfile._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      alert('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleEdit = (profile) => {
    dispatch(setSelectedProfile(profile));
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      department: profile.department?._id || profile.department || '',
      role: profile.role,
      status: profile.status,
      permissions: profile.permissions || formData.permissions
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (profile) => {
    dispatch(setSelectedProfile(profile));
    setModalMode('view');
    setShowModal(true);
  };

  const handlePermissions = (profile) => {
    dispatch(setSelectedProfile(profile));
    setFormData({
      ...formData,
      permissions: profile.permissions || formData.permissions
    });
    setModalMode('permissions');
    setShowModal(true);
  };

  const handlePasswordChange = (profile) => {
    dispatch(setSelectedProfile(profile));
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setModalMode('password');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this HR profile?')) {
      try {
        await dispatch(deleteHRProfile(id)).unwrap();
      } catch (error) {
        console.error('Error deleting HR profile:', error);
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
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'HR_Specialist',
      status: 'active',
      permissions: {
        canCreateEmployee: false,
        canEditEmployee: false,
        canDeleteEmployee: false,
        canViewSalary: false,
        canManageSalary: false,
        canManageLeaves: false,
        canManageRecruitment: false,
        canManageRequests: false,
        canViewReports: false,
        canManageCalendar: false
      }
    });
    dispatch(clearSelectedProfile());
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      'HR_Manager': 'HR Manager',
      'HR_Specialist': 'HR Specialist',
      'HR_Assistant': 'HR Assistant',
      'HR_Director': 'HR Director'
    };
    return roles[role] || role;
  };
  const filteredProfiles = (hrProfiles || []).filter(profile => {
    const matchesDepartment = filters.department === 'all' || 
      profile.department?._id === filters.department ||
      profile.department === filters.department;
    const matchesRole = filters.role === 'all' || profile.role === filters.role;
    const matchesStatus = filters.status === 'all' || profile.status === filters.status;
    const matchesSearch = filters.search === '' || 
      profile.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      profile.email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesDepartment && matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HR Profiles Management</h1>
          <p className="text-gray-600">Manage HR staff profiles and permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add HR Profile
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.department}
              onChange={(e) => dispatch(setFilters({ department: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"            >
              <option value="all">All Departments</option>
              {(departments || []).map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.role}
              onChange={(e) => dispatch(setFilters({ role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="HR_Director">HR Director</option>
              <option value="HR_Manager">HR Manager</option>
              <option value="HR_Specialist">HR Specialist</option>
              <option value="HR_Assistant">HR Assistant</option>
            </select>
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* HR Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <div key={profile._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                  <p className="text-sm text-gray-500">{getRoleLabel(profile.role)}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                {profile.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building size={16} />
                <span>{profile.department?.name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleView(profile)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(profile)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handlePermissions(profile)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Manage Permissions"
                >
                  <Shield size={16} />
                </button>
                <button
                  onClick={() => handlePasswordChange(profile)}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Change Password"
                >
                  <Key size={16} />
                </button>
                <button
                  onClick={() => handleDelete(profile._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No HR profiles found</p>
          <button
            onClick={openCreateModal}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create First HR Profile
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Create HR Profile' : 
                 modalMode === 'edit' ? 'Edit HR Profile' :
                 modalMode === 'view' ? 'HR Profile Details' :
                 modalMode === 'permissions' ? 'Manage Permissions' :
                 'Change Password'}
              </h2>
            </div>

            {modalMode === 'password' ? (
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordChangeLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {passwordChangeLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {modalMode !== 'permissions' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={modalMode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={modalMode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={modalMode === 'view'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={modalMode === 'view'}                        >
                          <option value="">Select Department</option>
                          {(departments || []).map((dept) => (
                            <option key={dept._id} value={dept._id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role *
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={modalMode === 'view'}
                        >
                          <option value="HR_Director">HR Director</option>
                          <option value="HR_Manager">HR Manager</option>
                          <option value="HR_Specialist">HR Specialist</option>
                          <option value="HR_Assistant">HR Assistant</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={modalMode === 'view'}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(formData.permissions).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name={`permissions.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      disabled={createLoading || updateLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {(createLoading || updateLoading) ? 'Saving...' : 
                       modalMode === 'create' ? 'Create Profile' : 
                       modalMode === 'permissions' ? 'Update Permissions' :
                       'Update Profile'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRProfilesPage;
