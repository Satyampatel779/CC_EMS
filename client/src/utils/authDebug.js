/**
 * Authentication debugging utility
 * Helps troubleshoot token storage and retrieval issues
 */

// Check and log all authentication-related storage
export const debugAuthState = () => {
  // Check localStorage tokens
  const hrToken = localStorage.getItem('HRtoken');
  const emToken = localStorage.getItem('EMtoken');
  
  // Check cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const hrCookie = cookies.find(c => c.startsWith('HRtoken='));
  const emCookie = cookies.find(c => c.startsWith('EMtoken='));
  
  console.group('Auth Debug Info');
  console.log('HR token in localStorage:', hrToken ? `${hrToken.substring(0, 15)}...` : 'None');
  console.log('EM token in localStorage:', emToken ? `${emToken.substring(0, 15)}...` : 'None');
  console.log('HR token in cookies:', hrCookie ? 'Present' : 'None');
  console.log('EM token in cookies:', emCookie ? 'Present' : 'None');
  console.log('All cookies:', cookies);
  console.groupEnd();
  
  return {
    localStorage: { hrToken: !!hrToken, emToken: !!emToken },
    cookies: { hrToken: !!hrCookie, emToken: !!emCookie }
  };
};

// Helper to fix login state management
export const handleAuthResponse = (response, type = 'HR') => {
  if (response?.data?.token) {
    // Store in localStorage
    localStorage.setItem(type === 'HR' ? 'HRtoken' : 'EMtoken', response.data.token);
    console.log(`${type} token saved to localStorage:`, response.data.token.substring(0, 15) + '...');
    return true;
  } else {
    console.warn(`No token found in ${type} login response:`, response?.data);
    return false;
  }
};

// Clear all authentication tokens
export const clearAllAuthTokens = () => {
  console.log('Clearing all authentication tokens...');
  
  // Clear localStorage
  localStorage.removeItem('HRtoken');
  localStorage.removeItem('EMtoken');
  
  // Clear cookies
  document.cookie = "HRtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "EMtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  console.log('All tokens cleared');
};

// Check if user is authenticated
export const isAuthenticated = (userType = 'HR') => {
  const tokenKey = userType === 'HR' ? 'HRtoken' : 'EMtoken';
  const hasLocalStorageToken = !!localStorage.getItem(tokenKey);
  const hasCookie = document.cookie.includes(`${tokenKey}=`);
  
  return hasLocalStorageToken || hasCookie;
};
