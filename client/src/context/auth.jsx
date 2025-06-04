import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../apis/apiService';
import { debugAuthState } from '../utils/authDebug';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Debug current auth state
        debugAuthState();
        
        // Try HR auth first
        try {
          const response = await apiService.get('/api/auth/HR/check-login');
          if (response.data.success) {
            setUser({...response.data.user, role: 'HR-Admin'});
            console.log('HR user authenticated:', response.data.user);
            return;
          }
        } catch (hrError) {
          console.log('HR auth check failed:', hrError.response?.data?.message);
        }
        
        // Try employee auth if HR fails
        try {
          const empResponse = await apiService.get('/api/auth/employee/check-login');
          if (empResponse.data.success) {
            setUser({...empResponse.data.user, role: 'Employee'});
            console.log('Employee user authenticated:', empResponse.data.user);
            return;
          }
        } catch (empError) {
          console.log('Employee auth check failed:', empError.response?.data?.message);
        }
        
        // No valid authentication found
        console.log('No valid authentication found');
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.response?.data?.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  const login = async (credentials, isHR = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = isHR ? '/api/auth/HR/login' : '/api/auth/employee/login';
      console.log(`Attempting ${isHR ? 'HR' : 'Employee'} login...`);
      
      const response = await apiService.post(endpoint, credentials);
      
      if (response.data.success) {
        console.log(`${isHR ? 'HR' : 'Employee'} login successful:`, response.data);
        
        // The token is already handled by the axios interceptor
        // Now get the user data
        const userResponse = isHR 
          ? await apiService.get('/api/auth/HR/check-login')
          : await apiService.get('/api/auth/employee/check-login');
          
        if (userResponse.data.success) {
          setUser({...userResponse.data.user, role: isHR ? 'HR-Admin' : 'Employee'});
          console.log('User data set:', userResponse.data.user);
          return { success: true, data: response.data };
        } else {
          throw new Error('Failed to get user data after login');
        }
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      setLoading(true);
      
      const endpoint = user?.role === 'HR-Admin' ? '/api/auth/HR/logout' : '/api/auth/employee/logout';
      
      await apiService.post(endpoint);
      
      // Clear local storage tokens
      localStorage.removeItem('HRtoken');
      localStorage.removeItem('EMtoken');
      
      setUser(null);
      console.log('User logged out successfully');
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout API fails, clear local state
      localStorage.removeItem('HRtoken');
      localStorage.removeItem('EMtoken');
      setUser(null);
      
      setError(err.response?.data?.message || 'Logout failed');
      return { success: false, message: err.response?.data?.message || 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default state instead of throwing an error
    console.warn('useAuth must be used within an AuthProvider. Returning default state.');
    return {
      user: null,
      loading: false,
      error: null,
      login: async () => ({ success: false, message: 'AuthProvider not available' }),
      logout: async () => ({ success: false, message: 'AuthProvider not available' }),
      isAuthenticated: false
    };
  }
  return context;
}
