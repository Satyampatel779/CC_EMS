import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:5000'; // Update this to match your backend URL
}

export const EmployeeDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new dashboard layout
    navigate('/auth/employee/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to Dashboard...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;