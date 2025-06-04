import { useState } from 'react';
import { apiService } from '../../apis/apiService';
import { debugAuthState, handleAuthResponse } from '../../utils/authDebug';

export const SimplifiedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const handleHRLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await apiService.post('/api/auth/HR/login', { email, password });
      console.log('HR Login response:', response.data);
      
      // Store token in localStorage
      handleAuthResponse(response, 'HR');
      
      // Debug current auth state
      debugAuthState();
      
      setResult({
        success: true,
        message: 'Login successful',
        token: response.data.token ? response.data.token.substring(0, 10) + '...' : 'No token received'
      });
      
      // Test an authenticated request
      setTimeout(async () => {
        try {
          const checkResponse = await apiService.get('/api/auth/HR/check-login');
          console.log('Auth check response:', checkResponse.data);
          setResult(prev => ({
            ...prev,
            checkResult: 'Auth check successful'
          }));
        } catch (checkError) {
          console.error('Auth check failed:', checkError);
          setResult(prev => ({
            ...prev,
            checkResult: 'Auth check failed: ' + (checkError.response?.data?.message || checkError.message)
          }));
        }
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data || { message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };
  
  const clearTokens = () => {
    localStorage.removeItem('HRtoken');
    localStorage.removeItem('EMtoken');
    document.cookie = "HRtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "EMtoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    debugAuthState();
    setResult({ message: 'All tokens cleared' });
  };
  
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Simplified Login Test</h1>
      
      <form onSubmit={handleHRLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Logging in...' : 'Login as HR'}
        </button>
      </form>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={clearTokens}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#f44336', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px'
          }}
        >
          Clear All Tokens
        </button>
      </div>
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#FFEBEE', color: '#B71C1C', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
      
      {result && (
        <div style={{ padding: '10px', backgroundColor: '#E8F5E9', color: '#1B5E20', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
          <strong>Result:</strong> 
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
