import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewAttendanceButton = ({ onUpdate = () => {}, className = "", style = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  // Enhanced API request handler with better error handling
  const makeRequest = async (method, endpoint, data = {}) => {
    const token = localStorage.getItem('EMtoken');
    
    console.log(`🔄 Making ${method} request to ${endpoint}`);
    
    if (!token) {
      console.error('❌ No authentication token found');
      alert('Please login first to continue');
      return null;
    }

    try {
      const config = {
        method,
        url: `http://localhost:5001${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 10000 // 10 second timeout
      };
      
      if (method === 'POST' && Object.keys(data).length > 0) {
        config.data = data;
      }
      
      console.log(`📡 Request config:`, { method, endpoint, hasToken: !!token });
      
      const response = await axios(config);
      console.log(`✅ Response received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ API Error:`, error);
      
      if (error.response?.status === 401) {
        console.log('🔑 Authentication expired - clearing token');
        localStorage.removeItem('EMtoken');
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.message || 'Invalid request');
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        alert('Server is not running. Please make sure the backend is started.');
      } else {
        alert(error.response?.data?.message || 'An error occurred. Please try again.');
      }
      return null;
    }
  };

  // Check current attendance status
  const checkStatus = async () => {
    console.log('🔍 Checking attendance status...');
    setIsChecking(true);
    
    const result = await makeRequest('GET', '/api/v1/attendance/employee/my-status');
    
    if (result && result.success) {
      const status = result.data?.isClockedIn || false;
      setIsClockedIn(status);
      onUpdate(result.data);
      console.log(`📊 Status updated: ${status ? 'Clocked In' : 'Clocked Out'}`);
    } else {
      console.log('⚠️ Failed to check status');
    }
    setIsChecking(false);
  };

  // Handle clock in
  const handleClockIn = async () => {
    setIsLoading(true);
    console.log('⏰ Attempting to clock in...');
    
    const result = await makeRequest('POST', '/api/v1/attendance/employee/clock-in');
    
    if (result && result.success) {
      setIsClockedIn(true);
      console.log('✅ Successfully clocked in!');
      alert('✅ Successfully clocked in!');
      await checkStatus(); // Refresh status to get latest data
    } else {
      console.log('❌ Clock in failed');
    }
    setIsLoading(false);
  };

  // Handle clock out
  const handleClockOut = async () => {
    setIsLoading(true);
    console.log('🏁 Attempting to clock out...');
    
    const result = await makeRequest('POST', '/api/v1/attendance/employee/clock-out');
    
    if (result && result.success) {
      setIsClockedIn(false);
      console.log('✅ Successfully clocked out!');
      alert('✅ Successfully clocked out!');
      await checkStatus(); // Refresh status to get latest data
    } else {
      console.log('❌ Clock out failed');
    }
    setIsLoading(false);
  };

  // Initial status check on component mount
  useEffect(() => {
    console.log('🚀 NewAttendanceButton component mounted');
    checkStatus();
  }, []);

  // Main button click handler
  const handleButtonClick = () => {
    if (isLoading || isChecking) {
      console.log('⏳ Button disabled - operation in progress');
      return;
    }
    
    console.log(`🖱️ Button clicked - Current status: ${isClockedIn ? 'Clocked In' : 'Clocked Out'}`);
    
    if (isClockedIn) {
      handleClockOut();
    } else {
      handleClockIn();
    }
  };

  // Button style configuration
  const getButtonStyle = () => {
    let backgroundColor = '#ccc';
    let cursor = 'not-allowed';
    
    if (!isLoading && !isChecking) {
      backgroundColor = isClockedIn ? '#dc2626' : '#16a34a';
      cursor = 'pointer';
    }
    
    return {
      padding: '12px 24px',
      backgroundColor,
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '500',
      cursor,
      transition: 'all 0.2s ease',
      width: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      ...style
    };
  };

  // Button text logic
  const getButtonText = () => {
    if (isChecking) return 'Checking Status...';
    if (isLoading) return isClockedIn ? 'Clocking Out...' : 'Clocking In...';
    return isClockedIn ? 'Clock Out' : 'Clock In';
  };

  return (
    <div className={className}>
      <button
        onClick={handleButtonClick}
        disabled={isLoading || isChecking}
        style={getButtonStyle()}
        title={isChecking ? 'Checking your current status...' : 
               isLoading ? 'Processing your request...' : 
               isClockedIn ? 'Click to clock out' : 'Click to clock in'}
      >
        {getButtonText()}
      </button>
      
      {/* Debug info - only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
          Status: {isChecking ? 'Checking...' : isClockedIn ? 'Clocked In' : 'Clocked Out'} | 
          Token: {localStorage.getItem('EMtoken') ? '✅' : '❌'}
        </div>
      )}
    </div>
  );
};

export default NewAttendanceButton;
