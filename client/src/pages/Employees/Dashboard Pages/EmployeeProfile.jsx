import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, MapPin, Users, Building, Clock, Edit, Save, X, Camera } from 'lucide-react';

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('EMtoken');
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive"
      });
      return null;
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // Fetch employee data from API
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log('🔍 Fetching employee profile data...');
      
      const response = await axios.get('http://localhost:5001/api/v1/employee/by-employee', headers);
      
      console.log('📋 Profile API Response:', response.data);

      if (response.data.success && response.data.employee) {
        const emp = response.data.employee;
        setEmployeeData(emp);
        
        // Initialize form data with employee data
        setFormData({
          firstname: emp.firstname || '',
          lastname: emp.lastname || '',
          email: emp.email || '',
          contactnumber: emp.contactnumber || '',
          dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
          gender: emp.gender || '',
          address: emp.address || '',
          emergencyContactName: emp.emergencyContact?.name || '',
          emergencyContactRelationship: emp.emergencyContact?.relationship || '',
          emergencyContactPhone: emp.emergencyContact?.phone || ''
        });

        console.log('✅ Employee data loaded successfully');
        toast({
          title: "Profile Loaded",
          description: "Your profile information has been loaded successfully"
        });
      } else {
        throw new Error('Failed to load profile data');
      }
    } catch (error) {
      console.error('❌ Error fetching employee data:', error);
      toast({
        title: "Error Loading Profile",
        description: error.response?.data?.message || "Failed to load your profile information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log('💾 Saving profile changes...', formData);

      // Prepare data for API
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        contactnumber: formData.contactnumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone
        }
      };

      // Remove empty emergency contact if no data provided
      if (!updateData.emergencyContact.name && !updateData.emergencyContact.relationship && !updateData.emergencyContact.phone) {
        delete updateData.emergencyContact;
      }

      const response = await axios.patch(
        'http://localhost:5001/api/v1/employee/update-profile',
        updateData,
        headers
      );

      console.log('💾 Profile update response:', response.data);

      if (response.data.success) {
        const updatedEmployee = response.data.employee;
        setEmployeeData(updatedEmployee);
        setIsEditing(false);
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!"
        });
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update your profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (employeeData) {
      setFormData({
        firstname: employeeData.firstname || '',
        lastname: employeeData.lastname || '',
        email: employeeData.email || '',
        contactnumber: employeeData.contactnumber || '',
        dateOfBirth: employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: employeeData.gender || '',
        address: employeeData.address || '',
        emergencyContactName: employeeData.emergencyContact?.name || '',
        emergencyContactRelationship: employeeData.emergencyContact?.relationship || '',
        emergencyContactPhone: employeeData.emergencyContact?.phone || ''
      });
    }
    setIsEditing(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto animate-spin" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-white text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state - no data loaded
  if (!employeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-300 mb-6">
            Unable to load your profile information
          </p>
          <Button 
            onClick={fetchEmployeeData} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            My Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your personal information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={handleCancel} 
              disabled={saving}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-4xl font-bold text-white">
                    {employeeData.firstname?.charAt(0)?.toUpperCase() || 'E'}
                    {employeeData.lastname?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {employeeData.firstname} {employeeData.lastname}
              </h3>
              <p className="text-gray-300 mb-3">
                {employeeData.position || 'Employee'}
              </p>
              <div className="flex justify-center">
                <Badge 
                  className={`${
                    employeeData.status === 'Active' 
                      ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  } px-3 py-1 rounded-full`}
                >
                  {employeeData.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-3">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-400" />
                Personal Information
              </h2>
              <p className="text-gray-300">
                Your basic details and contact information
              </p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-gray-200 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    First Name
                  </Label>
                  <Input
                    id="firstname"
                    name="firstname"
                    value={formData.firstname || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-gray-200 font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Last Name
                  </Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    value={formData.lastname || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    disabled={true}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl opacity-60"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contactnumber" className="text-gray-200 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    Phone Number
                  </Label>
                  <Input
                    id="contactnumber"
                    name="contactnumber"
                    value={formData.contactnumber || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-gray-200 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-200 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Gender
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                  >
                    <option value="" className="bg-gray-800">Select Gender</option>
                    <option value="Male" className="bg-gray-800">Male</option>
                    <option value="Female" className="bg-gray-800">Female</option>
                    <option value="Other" className="bg-gray-800">Other</option>
                  </select>
                </div>

              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-200 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-400" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName" className="text-gray-200 font-medium">
                      Contact Name
                    </Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship" className="text-gray-200 font-medium">
                      Relationship
                    </Label>
                    <Input
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone" className="text-gray-200 font-medium">
                      Contact Phone
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 rounded-xl focus:border-purple-400 focus:ring-purple-400/20 disabled:opacity-50 transition-all duration-200"
                    />
                  </div>
                  
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Employment Information */}
        <div className="lg:col-span-4">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-400" />
                Employment Information
              </h2>
              <p className="text-gray-300">
                Your job details and company information (read-only)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  Employee ID
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.employeeId || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  Department
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.department?.name || employeeData.department || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  Position
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.position || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Join Date
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.joiningDate 
                      ? new Date(employeeData.joiningDate).toLocaleDateString()
                      : 'Not Available'
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Employment Type
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.employmentType || 'Not Specified'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Manager
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.manager?.firstname && employeeData.manager?.lastname 
                      ? `${employeeData.manager.firstname} ${employeeData.manager.lastname}`
                      : 'Not Assigned'
                    }
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Work Location
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-white font-medium">
                    {employeeData.workLocation || 'Not Specified'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-200 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Status
                </Label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <Badge 
                    className={`${
                      employeeData.status === 'Active' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    } px-3 py-1 rounded-full font-medium`}
                  >
                    {employeeData.status || 'Unknown'}
                  </Badge>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfile;
