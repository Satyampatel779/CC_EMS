import { useState, useEffect } from 'react';
import { apiService } from '../../apis/apiService';
import { debugAuthState } from '../../utils/authDebug';

export const AuthTestPage = () => {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Check HR auth status
      const hrResponse = await apiService.get('/api/auth/HR/check-login');
      
      // Check Employee auth status  
      const empResponse = await apiService.get('/api/auth/employee/check-login');
      
      setAuthStatus({
        hr: hrResponse.data,
        employee: empResponse.data,
        cookies: document.cookie,
        localStorage: {
          hrToken: localStorage.getItem('hrToken'),
          empToken: localStorage.getItem('empToken'),
        }
      });
      
      // Debug auth state
      debugAuthState();
      
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus({
        error: error.message,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('hrToken');
    localStorage.removeItem('empToken');
    // Clear cookies by setting them to expire
    document.cookie = 'HRtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'EMtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    checkAuthStatus();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button 
              onClick={checkAuthStatus}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Auth Status'}
            </button>
            
            <button 
              onClick={clearAuth}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Auth
            </button>
          </div>
          
          {authStatus && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">HR Authentication</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(authStatus.hr, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Employee Authentication</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(authStatus.employee, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Storage</h3>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Cookies:</strong> {authStatus.cookies || 'None'}</p>
                  <p><strong>HR Token:</strong> {authStatus.localStorage?.hrToken ? authStatus.localStorage.hrToken.substring(0, 10) + '...' : 'None'}</p>
                  <p><strong>Employee Token:</strong> {authStatus.localStorage?.empToken ? authStatus.localStorage.empToken.substring(0, 10) + '...' : 'None'}</p>
                </div>
              </div>
              
              {authStatus.error && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
                  <pre className="bg-red-100 p-3 rounded text-sm">
                    {JSON.stringify(authStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Navigation</h2>
          <div className="space-x-4">
            <a href="/auth/HR/login" className="text-blue-500 hover:underline">HR Login</a>
            <a href="/auth/employee/login" className="text-blue-500 hover:underline">Employee Login</a>
            <a href="/HR/dashboard" className="text-blue-500 hover:underline">HR Dashboard</a>
            <a href="/auth/employee/dashboard" className="text-blue-500 hover:underline">Employee Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
};
