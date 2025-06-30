import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  ArrowLeft,
  CalendarDays,
  User,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const LeaveRequestPage = () => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    duration: 'full-day',
    emergencyContact: '',
    attachments: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 20,
    sick: 10,
    personal: 5,
    emergency: 3
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', balance: leaveBalance.annual },
    { value: 'sick', label: 'Sick Leave', balance: leaveBalance.sick },
    { value: 'personal', label: 'Personal Leave', balance: leaveBalance.personal },
    { value: 'emergency', label: 'Emergency Leave', balance: leaveBalance.emergency },
    { value: 'maternity', label: 'Maternity Leave', balance: 90 },
    { value: 'paternity', label: 'Paternity Leave', balance: 15 }
  ];

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('EMtoken') || sessionStorage.getItem('EMtoken');
      if (!token) return;

      // Mock API call - replace with actual endpoint
      // const response = await fetch('/api/employee/leave-balance', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setLeaveBalance(data.balance);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return formData.duration === 'half-day' ? diffDays * 0.5 : diffDays;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    const leaveDays = calculateLeaveDays();
    const selectedLeaveType = leaveTypes.find(type => type.value === formData.leaveType);
    if (selectedLeaveType && leaveDays > selectedLeaveType.balance) {
      newErrors.leaveType = `Insufficient balance. Available: ${selectedLeaveType.balance} days`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('EMtoken') || sessionStorage.getItem('EMtoken');
      
      const submitData = {
        ...formData,
        leaveDays: calculateLeaveDays(),
        status: 'pending'
      };

      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Leave request submitted successfully!",
      });

      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        duration: 'full-day',
        emergencyContact: '',
        attachments: null
      });

      // Navigate back to leaves page
      navigate('/auth/employee/dashboard/leaves');

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const leaveDays = calculateLeaveDays();
  const selectedLeaveType = leaveTypes.find(type => type.value === formData.leaveType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/auth/employee/dashboard/leaves')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaves
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Submit Leave Request
            </h1>
            <p className="text-gray-600">Request time off from work</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Leave Request Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Leave Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Leave Type *
                  </label>
                  <Select 
                    value={formData.leaveType} 
                    onValueChange={(value) => handleInputChange('leaveType', value)}
                  >
                    <SelectTrigger className={errors.leaveType ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex justify-between items-center w-full">
                            <span>{type.label}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({type.balance} days available)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.leaveType && (
                    <p className="text-sm text-red-600">{errors.leaveType}</p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={errors.startDate ? 'border-red-300' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? 'border-red-300' : ''}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Duration Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <Select 
                    value={formData.duration} 
                    onValueChange={(value) => handleInputChange('duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-day">Full Day</SelectItem>
                      <SelectItem value="half-day">Half Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reason for Leave *
                  </label>
                  <Textarea
                    placeholder="Please provide the reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className={`min-h-[100px] ${errors.reason ? 'border-red-300' : ''}`}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Emergency Contact (Optional)
                  </label>
                  <Input
                    placeholder="Emergency contact number"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/auth/employee/dashboard/leaves')}
                    className="gap-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leave Summary */}
          {formData.startDate && formData.endDate && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Leave Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{leaveDays} days</span>
                </div>
                {selectedLeaveType && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedLeaveType.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{selectedLeaveType.balance} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-medium ${
                        selectedLeaveType.balance - leaveDays < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedLeaveType.balance - leaveDays} days
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leave Balance */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveTypes.slice(0, 4).map((type) => (
                  <div key={type.value} className="flex justify-between items-center">
                    <span className="text-gray-600">{type.label}:</span>
                    <Badge variant="outline" className="font-medium">
                      {type.balance} days
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Submit requests at least 2 weeks in advance</p>
                <p>• Emergency leaves require manager approval</p>
                <p>• Sick leaves may require medical certificate</p>
                <p>• Annual leaves are subject to team scheduling</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestPage;
