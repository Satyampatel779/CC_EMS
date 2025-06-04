// Create an API service using axios
import axios from 'axios'
import { debugAuthState, handleAuthResponse } from '../utils/authDebug'

// Configure base URL and credentials
const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_EMPLOYEE_API || 'http://localhost:5001'

// Create axios instance with proper configuration
const apiService = axios.create({
  baseURL: BASE_URL.trim(),
  withCredentials: true,  // Always include credentials for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging and ensuring proper cookie handling
apiService.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always true for all requests
    config.withCredentials = true;
    
    // Try to get token from localStorage
    const hrToken = localStorage.getItem('HRtoken');
    const emToken = localStorage.getItem('EMtoken');
    
    // Add token to headers if available in localStorage
    if (hrToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${hrToken}`;
    } else if (emToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${emToken}`;
    }
    
    // Log request details for debugging
    console.log(`API Request: ${config.method?.toUpperCase() || 'UNKNOWN'} ${config.url}`, {
      withCredentials: config.withCredentials,
      hasAuthHeader: !!config.headers.Authorization,
      tokenSource: hrToken ? 'HR' : emToken ? 'Employee' : 'None'
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging and handling authentication errors
apiService.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.statusText);
    
    // Handle authentication responses
    if (response.data?.token && (
        response.config.url.includes('/auth/HR/login') || 
        response.config.url.includes('/auth/employee/login')
    )) {
      const userType = response.config.url.includes('/auth/HR/login') ? 'HR' : 'Employee';
      handleAuthResponse(response, userType);
      
      // Debug auth state after login
      setTimeout(() => debugAuthState(), 100);
    }
    
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication error detected');
      
      // Clean up localStorage tokens on auth errors
      if (error.config.url.includes('/auth/HR')) {
        localStorage.removeItem('HRtoken');
      } else if (error.config.url.includes('/auth/employee')) {
        localStorage.removeItem('EMtoken');
      }
      
      // Check if we need to redirect to login
      if (error.response?.data?.gologin) {
        console.log('Redirecting to login page:', error.response.data.loginURL || '/auth/HR/login');
        // You can implement redirection logic here or handle it in your components
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to check if user is authenticated
export const checkAuthentication = async (type = 'HR') => {
  try {
    const endpoint = type === 'HR' ? '/api/auth/HR/check-login' : '/api/auth/employee/check-login';
    const response = await apiService.get(endpoint);
    return { isAuthenticated: true, data: response.data };
  } catch (error) {
    return { isAuthenticated: false, error: error.response?.data };
  }
};

// Function to handle login and store token
export const handleLogin = async (credentials, type = 'HR') => {
  const endpoint = type === 'HR' ? '/api/auth/HR/login' : '/api/auth/employee/login';
  const response = await apiService.post(endpoint, credentials);
  
  if (response.data.token) {
    localStorage.setItem(type === 'HR' ? 'HRtoken' : 'EMtoken', response.data.token);
  }
  
  return response;
};

// Function to handle logout and clear token
export const handleLogout = async (type = 'HR') => {
  const endpoint = type === 'HR' ? '/api/auth/HR/logout' : '/api/auth/employee/logout';
  
  // Clear token before logout API call
  localStorage.removeItem(type === 'HR' ? 'HRtoken' : 'EMtoken');
  
  try {
    const response = await apiService.post(endpoint);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return { data: { success: true, message: 'Logged out locally' } };
  }
};

export { apiService };