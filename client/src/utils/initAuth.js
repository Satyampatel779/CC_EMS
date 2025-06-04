import { apiService } from '../apis/apiService';
import { socketService } from './socketService';

// Initialize authentication on app start
export const initAuth = async () => {
  try {
    // Check if we have tokens in localStorage
    const hrToken = localStorage.getItem('HRtoken');
    const emToken = localStorage.getItem('EMtoken');
    
    console.log('Auth initialization - localStorage tokens:', {
      HR: hrToken ? 'Present' : 'None',
      EM: emToken ? 'Present' : 'None'
    });
    
    // Only attempt socket connection if we have auth tokens
    let isAuthenticated = false;
    let authType = null;
    
    // If we have a token, we'll try checking login status
    if (hrToken) {
      try {
        const response = await apiService.get('/api/auth/HR/check-login');
        console.log('HR auth check successful:', response.data);
        
        // Only initialize socket connection after successful auth
        if (response.data.success) {
          socketService.connect(true);
          isAuthenticated = true;
          authType = 'HR';
        }
      } catch (err) {
        console.warn('HR auth check failed:', err.response?.data || err.message);
      }
    }
    
    if (!isAuthenticated && emToken) {
      try {
        const response = await apiService.get('/api/auth/employee/check-login');
        console.log('Employee auth check successful:', response.data);
        
        // Only initialize socket connection after successful auth
        if (response.data.success) {
          socketService.connect(true);
          isAuthenticated = true;
          authType = 'Employee';
        }
      } catch (err) {
        console.warn('Employee auth check failed:', err.response?.data || err.message);
      }
    }
    
    // Return authentication status
    return {
      initialized: true,
      authenticated: isAuthenticated,
      type: authType
    };
    
  } catch (error) {
    console.error('Auth initialization error:', error);
    return {
      initialized: false,
      error: error.message
    };
  }
};
