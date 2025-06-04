import { useState } from 'react';
import { apiService } from '../apis/apiService';

export const useHRSignup = () => {
  const [loading, setLoading] = useState(false);
  // Initialize error as null so it's never undefined
  const [error, setError] = useState(null); 
  const [success, setSuccess] = useState(false);
  
  const handleSignup = async (formData) => {
    setLoading(true);
    setError(null); // Reset error state
    
    try {
      const response = await apiService.post('/api/auth/HR/signup', formData);
      setSuccess(true);
      return response.data;
    } catch (err) {
      // Ensure error is properly structured
      setError({
        message: err.response?.data?.message || 'An error occurred during signup',
        type: 'signup'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error, // This will be null instead of undefined when not set
    success,
    handleSignup
  };
};
