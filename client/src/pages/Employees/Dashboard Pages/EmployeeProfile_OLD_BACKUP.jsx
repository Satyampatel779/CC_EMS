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
  axios.defaults.baseURL = 'http://localhost:5001';
}

const EmployeeProfile = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  const user = useSelector((state) => state.employeereducer?.user);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('EMtoken') || sessionStorage.getItem('EMtoken');
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
        const emp = response.data.employee;
        setEmployeeData(emp);
        setFormData({
          firstName: emp.firstname || '',
          lastName: emp.lastname || '',
          email: emp.email || '',
          phone: emp.contactnumber || '',
          dateOfBirth: emp.dateOfBirth ? moment(emp.dateOfBirth).format('YYYY-MM-DD') : '',
          gender: emp.gender || '',
          address: emp.address || '',
          emergencyContactName: emp.emergencyContact?.name || '',
          emergencyContactRelationship: emp.emergencyContact?.relationship || '',
          emergencyContactPhone: emp.emergencyContact?.phone || ''
        });
      } else {
        toast({ title: 'Error', description: response.data.message || 'Failed to load profile', variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
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
      console.log('Submitting form data:', formData);
      
      // Transform form data to match backend field names and structure
      const transformedData = {
        firstname: formData.firstName || formData.firstname,
        lastname: formData.lastName || formData.lastname,
        contactnumber: formData.phone || formData.contactnumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName || formData.emergencyContact?.name || "",
          relationship: formData.emergencyContactRelationship || formData.emergencyContact?.relationship || "",
          phone: formData.emergencyContactPhone || formData.emergencyContact?.phone || ""
        }
      };

      // Remove empty values
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] === "" || transformedData[key] === null || transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      // Don't send empty emergency contact object
      if (transformedData.emergencyContact) {
        const hasEmergencyData = Object.values(transformedData.emergencyContact).some(val => val && val.trim() !== "");
        if (!hasEmergencyData) {
          delete transformedData.emergencyContact;
        }
      }

      console.log('Transformed data to send:', transformedData);

      const response = await axios.patch('/api/v1/employee/update-profile', transformedData, getAuthHeaders());
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        const updatedEmployee = response.data.employee;
        setEmployeeData(updatedEmployee);
        
        // Update form data with the response
        setFormData({
          firstName: updatedEmployee.firstname,
          lastName: updatedEmployee.lastname,
          firstname: updatedEmployee.firstname,
          lastname: updatedEmployee.lastname,
          email: updatedEmployee.email,
          phone: updatedEmployee.contactnumber,
          contactnumber: updatedEmployee.contactnumber,
          dateOfBirth: updatedEmployee.dateOfBirth,
          gender: updatedEmployee.gender,
          address: updatedEmployee.address,
          emergencyContactName: updatedEmployee.emergencyContact?.name || '',
          emergencyContactRelationship: updatedEmployee.emergencyContact?.relationship || '',
          emergencyContactPhone: updatedEmployee.emergencyContact?.phone || '',
          emergencyContact: updatedEmployee.emergencyContact,
          ...updatedEmployee
        });
        
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update profile",
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
      <div className="flex items-center justify-center h-64 bg-white dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-neutral-100"></div>
      </div>
    );
  }

  return (
    <div className="employee-profile p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">My Profile</h1>
          <p className="text-gray-600 dark:text-neutral-400 mt-2">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
        <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              {employeeData?.profilePicture ? (
                <img 
                  src={employeeData.profilePicture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover"
                />              ) : (
                <span className="text-4xl text-gray-500 dark:text-neutral-400">
                  {(employeeData?.firstname || employeeData?.firstName)?.charAt(0) || 'E'}
                </span>
              )}
            </div>
            {isEditing && (
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700">
                Change Photo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-neutral-100">Personal Information</CardTitle>
            <CardDescription className="text-gray-600 dark:text-neutral-400">Your basic details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <Label htmlFor="firstName" className="text-gray-700 dark:text-neutral-300">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData?.firstname || formData?.firstName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-gray-700 dark:text-neutral-300">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData?.lastname || formData?.lastName || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-neutral-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    disabled={true} // Email should not be editable by employee
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-neutral-300">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData?.contactnumber || formData?.phone || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-neutral-300">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData?.dateOfBirth ? moment(formData.dateOfBirth).format('YYYY-MM-DD') : ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-gray-700 dark:text-neutral-300">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData?.gender || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

              </div>              <div>
                <Label htmlFor="address" className="text-gray-700 dark:text-neutral-300">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData?.address || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                />
              </div>

              {/* Emergency Contact Information */}
              <div className="col-span-full">
                <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-neutral-200">Emergency Contact</h4>                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName" className="text-gray-700 dark:text-neutral-300">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData?.emergencyContactName || formData?.emergencyContact?.name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-gray-700 dark:text-neutral-300">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      value={formData?.emergencyContactRelationship || formData?.emergencyContact?.relationship || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone" className="text-gray-700 dark:text-neutral-300">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData?.emergencyContactPhone || formData?.emergencyContact?.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-gray-900 dark:text-neutral-100 disabled:bg-gray-100 dark:disabled:bg-neutral-600"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700">
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
              </div>              <div>
                <Label>Department</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border">
                  {employeeData?.department?.name || employeeData?.department || 'N/A'}
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
                  {employeeData?.manager?.firstname && employeeData?.manager?.lastname 
                    ? `${employeeData.manager.firstname} ${employeeData.manager.lastname}`
                    : employeeData?.manager || 'N/A'
                  }
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
