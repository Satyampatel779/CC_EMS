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

const NewEmployeeProfile = () => {
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
      <div className="flex items-center justify-center h-64 bg-white dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-neutral-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state - no data loaded
  if (!employeeData) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-neutral-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 mb-4">
            Unable to load your profile information
          </p>
          <Button onClick={fetchEmployeeData} className="bg-indigo-600 hover:bg-indigo-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-profile p-6 bg-gray-50 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">My Profile</h1>
          <p className="text-gray-600 dark:text-neutral-400 mt-2">
            Manage your personal information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Picture Section */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {employeeData.firstname?.charAt(0)?.toUpperCase() || 'E'}
                {employeeData.lastname?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
              {employeeData.firstname} {employeeData.lastname}
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 text-sm">
              {employeeData.position || 'Employee'}
            </p>
            <Badge 
              variant={employeeData.status === 'Active' ? 'default' : 'destructive'}
              className="mt-2"
            >
              {employeeData.status || 'Unknown'}
            </Badge>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Personal Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">
              Your basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* First Name */}
                <div>
                  <Label htmlFor="firstname" className="text-gray-700 dark:text-neutral-300">
                    First Name
                  </Label>
                  <Input
                    id="firstname"
                    name="firstname"
                    value={formData.firstname || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastname" className="text-gray-700 dark:text-neutral-300">
                    Last Name
                  </Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    value={formData.lastname || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-neutral-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    disabled={true} // Email should not be editable
                    className="bg-gray-50 dark:bg-neutral-600 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="contactnumber" className="text-gray-700 dark:text-neutral-300">
                    Phone Number
                  </Label>
                  <Input
                    id="contactnumber"
                    name="contactnumber"
                    value={formData.contactnumber || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-neutral-300">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender" className="text-gray-700 dark:text-neutral-300">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-gray-700 dark:text-neutral-300">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="col-span-full pt-4">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-neutral-200">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div>
                    <Label htmlFor="emergencyContactName" className="text-gray-700 dark:text-neutral-300">
                      Contact Name
                    </Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-gray-700 dark:text-neutral-300">
                      Relationship
                    </Label>
                    <Input
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContactPhone" className="text-gray-700 dark:text-neutral-300">
                      Contact Phone
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-50 dark:disabled:bg-neutral-600"
                    />
                  </div>
                  
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card className="lg:col-span-3 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Employment Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">
              Your job details and company information (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Employee ID</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.employeeId || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Department</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.department?.name || employeeData.department || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Position</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.position || 'Not Assigned'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Join Date</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.joiningDate 
                      ? new Date(employeeData.joiningDate).toLocaleDateString()
                      : 'Not Available'
                    }
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Employment Type</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.employmentType || 'Not Specified'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Manager</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.manager?.firstname && employeeData.manager?.lastname 
                      ? `${employeeData.manager.firstname} ${employeeData.manager.lastname}`
                      : 'Not Assigned'
                    }
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Work Location</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <span className="text-gray-900 dark:text-neutral-100">
                    {employeeData.workLocation || 'Not Specified'}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 dark:text-neutral-300 font-medium">Status</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md border">
                  <Badge 
                    variant={employeeData.status === 'Active' ? 'default' : 'destructive'}
                  >
                    {employeeData.status || 'Unknown'}
                  </Badge>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default NewEmployeeProfile;
