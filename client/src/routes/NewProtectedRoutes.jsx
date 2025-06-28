import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const NewProtectedRoutes = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('EMtoken');
    
    if (!token) {
      console.log('🔒 No token found - user not authenticated');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Verifying token with server...');
      
      const response = await axios.get('http://localhost:5001/api/auth/employee/check-login', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        console.log('✅ Authentication verified - user is logged in');
        setIsAuthenticated(true);
      } else {
        console.log('❌ Authentication failed - removing invalid token');
        localStorage.removeItem('EMtoken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🧹 Token expired or invalid - removing token');
        localStorage.removeItem('EMtoken');
      }
      
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Verifying authentication...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, redirect to login
  console.log('🔄 Redirecting to login page...');
  return <Navigate to="/auth/employee/login" replace />;
};

export default NewProtectedRoutes;
