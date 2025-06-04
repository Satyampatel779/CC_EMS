import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import moment from 'moment';
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
import { useToast } from "@/hooks/use-toast";

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000';
}

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const user = useSelector((state) => state.employeereducer?.user);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      withCredentials: true
    };
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/api/v1/employee/by-employee', getAuthHeaders());
      if (response.data.success) {
        setEmployeeData(response.data.employee);
        setFormData(response.data.employee);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.patch('/api/v1/employee/update-employee', formData, getAuthHeaders());
      
      if (response.data.success) {
        setEmployeeData(response.data.employee);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData(employeeData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="employee-profile p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              {employeeData?.profilePicture ? (
                <img 
                  src={employeeData.profilePicture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-500">
                  {employeeData?.firstName?.charAt(0) || 'E'}
                </span>
              )}
            </div>
            {isEditing && (
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData?.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData?.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData?.phone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData?.dateOfBirth ? moment(formData.dateOfBirth).format('YYYY-MM-DD') : ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData?.gender || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData?.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
            <CardDescription>Your job details and company information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <Label>Employee ID</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.employeeId || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Department</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.department || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Position</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.position || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Join Date</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.joiningDate 
                    ? moment(employeeData.joiningDate).format('MMM DD, YYYY')
                    : 'N/A'
                  }
                </div>
              </div>

              <div>
                <Label>Employment Type</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.employmentType || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Manager</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.manager || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Work Location</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.workLocation || 'N/A'}
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employeeData?.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employeeData?.status || 'N/A'}
                  </span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>      </div>
    </div>
  );
};

export default EmployeeProfile;
