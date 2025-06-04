import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../apis/apiService';
import { debugAuthState, handleAuthResponse } from '../../utils/authDebug';
import { socketService } from '../../utils/socketService';

export const HRLoginHandler = ({ credentials, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting HR login with:', { ...credentials, password: '***' });
      
      const response = await apiService.post('/api/auth/HR/login', credentials);
      
      console.log('HR Login response:', response.data);
      
      // Save token to localStorage
      const tokenSaved = handleAuthResponse(response, 'HR');
      
      // Debug authentication state after login
      debugAuthState();
      
      if (tokenSaved) {
        // Initialize socket connection with new auth token
        socketService.reconnect();
        
        if (onSuccess) onSuccess(response.data);
        navigate('/HR/dashboard/dashboard-data');
      } else {
        setError({ message: 'Login successful but no token received' });
        if (onError) onError({ message: 'Login successful but no token received' });
      }
    } catch (err) {
      console.error('HR Login error:', err);
      setError(err.response?.data || { message: 'Network error during login' });
      if (onError) onError(err.response?.data || { message: 'Network error during login' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (credentials?.email && credentials?.password) {
      handleLogin();
    }
  }, [credentials]);

  return { loading, error };
};

export const EmployeeLoginHandler = ({ credentials, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting Employee login with:', { ...credentials, password: '***' });
      
      const response = await apiService.post('/api/auth/employee/login', credentials);
      
      console.log('Employee Login response:', response.data);
      
      // Save token to localStorage
      const tokenSaved = handleAuthResponse(response, 'Employee');
      
      // Debug authentication state after login
      debugAuthState();
      
      if (tokenSaved) {
        // Initialize socket connection with new auth token
        socketService.reconnect();
        
        if (onSuccess) onSuccess(response.data);
        navigate('/employee/dashboard');
      } else {
        setError({ message: 'Login successful but no token received' });
        if (onError) onError({ message: 'Login successful but no token received' });
      }
    } catch (err) {
      console.error('Employee Login error:', err);
      setError(err.response?.data || { message: 'Network error during login' });
      if (onError) onError(err.response?.data || { message: 'Network error during login' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (credentials?.email && credentials?.password) {
      handleLogin();
    }
  }, [credentials]);

  return { loading, error };
};
