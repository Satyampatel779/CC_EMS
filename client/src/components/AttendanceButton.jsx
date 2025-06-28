import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from '@/apis/apiService';

// Dedicated component for clock-in/clock-out functionality
const AttendanceButton = ({ onStatusChange, className = "", size = "lg" }) => {
  const [clockStatus, setClockStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('EMtoken');
    if (!token) {
      console.error('No employee token found');
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Check current clock status
  const checkClockStatus = async () => {
    setChecking(true);
    if (!isAuthenticated()) {
      setChecking(false);
      return;
    }

    try {
      console.log('Checking clock status...');
      const response = await apiService.get('/api/v1/attendance/employee/my-status');
      console.log('Status response:', response.data);
      
      if (response.data.success) {
        const isClocked = response.data.data.isClockedIn || false;
        setClockStatus(isClocked);
        if (onStatusChange) {
          onStatusChange(response.data.data);
        }
        console.log('Clock status updated:', isClocked);
      }
    } catch (error) {
      console.error('Error checking clock status:', error);
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to check status",
          variant: "destructive"
        });
      }
    } finally {
      setChecking(false);
    }
  };

  // Handle clock in
  const handleClockIn = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    try {
      console.log('Attempting to clock in...');
      const response = await apiService.post('/api/v1/attendance/employee/clock-in');
      console.log('Clock in response:', response.data);
      
      if (response.data.success) {
        setClockStatus(true);
        toast({
          title: "Success",
          description: "Clocked in successfully!",
          variant: "default"
        });
        // Refresh status after successful clock in
        setTimeout(() => checkClockStatus(), 1000);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to clock in",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Clock in error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clock in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!isAuthenticated()) return;
    
    setLoading(true);
    try {
      console.log('Attempting to clock out...');
      const response = await apiService.post('/api/v1/attendance/employee/clock-out');
      console.log('Clock out response:', response.data);
      
      if (response.data.success) {
        setClockStatus(false);
        toast({
          title: "Success",
          description: "Clocked out successfully!",
          variant: "default"
        });
        // Refresh status after successful clock out
        setTimeout(() => checkClockStatus(), 1000);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to clock out",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Clock out error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clock out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle button click
  const handleButtonClick = () => {
    console.log('Button clicked! Current status:', clockStatus);
    if (clockStatus) {
      handleClockOut();
    } else {
      handleClockIn();
    }
  };

  // Check status on mount
  useEffect(() => {
    checkClockStatus();
  }, []);

  if (checking) {
    return (
      <Button disabled size={size} className={className}>
        Checking...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleButtonClick}
      disabled={loading}
      size={size}
      className={`${className} ${
        clockStatus 
          ? 'bg-red-600 hover:bg-red-700 text-white' 
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {loading 
        ? (clockStatus ? 'Clocking Out...' : 'Clocking In...') 
        : (clockStatus ? 'Clock Out' : 'Clock In')
      }
    </Button>
  );
};

export default AttendanceButton;
