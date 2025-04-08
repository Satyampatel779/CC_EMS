import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/lib/axios';

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
        // Try HR auth first
        const response = await axios.get('/api/auth/HR/check-login');
        if (response.data.success) {
          setUser({...response.data.user, role: 'HR-Admin'});
        } else {
          // Try employee auth
          const empResponse = await axios.get('/api/auth/employee/check-login');
          if (empResponse.data.success) {
            setUser({...empResponse.data.user, role: 'Employee'});
          }
        }
      } catch (err) {
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
      const endpoint = isHR ? '/api/auth/HR/login' : '/api/auth/employee/login';
      const response = await axios.post(endpoint, credentials);
      
      if (response.data.success) {
        const userResponse = isHR 
          ? await axios.get('/api/auth/HR/check-login')
          : await axios.get('/api/auth/employee/check-login');
          
        setUser({...userResponse.data.user, role: isHR ? 'HR-Admin' : 'Employee'});
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (user?.role === 'HR-Admin') {
        await axios.post('/api/auth/HR/logout');
      } else {
        await axios.post('/api/auth/employee/logout');
      }
      setUser(null);
      return { success: true };
    } catch (err) {
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
  return useContext(AuthContext);
}
