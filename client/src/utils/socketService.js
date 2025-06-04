import { io } from 'socket.io-client';

// Socket.io singleton service for managing authenticated connections
class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connectionAttempted = false;
    this.userType = null;
    this.autoConnect = false; // Default to not auto-connecting
    this.connectionRetries = 0;
    this.maxRetries = 3;
  }

  // Initialize socket connection with authentication
  connect(forceConnect = false) {
    // Only proceed if we're forcing a connection or haven't already attempted
    if (!forceConnect && (this.socket || this.connectionAttempted)) {
      return this.socket;
    }

    this.connectionAttempted = true;
    
    // Get authentication token from localStorage
    const hrToken = localStorage.getItem('HRtoken');
    const emToken = localStorage.getItem('EMtoken');
    const token = hrToken || emToken;
    
    // Don't connect if no authentication is available unless forced
    if (!token && !forceConnect) {
      console.log('Socket connection deferred - no auth token available');
      return null;
    }

    // Set user type based on available token
    this.userType = hrToken ? 'HR' : 'Employee';
    
    // Only try connecting if the document is fully loaded
    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      this._createSocketConnection(token);
    } else {
      // Wait for document to be ready
      window.addEventListener('load', () => {
        setTimeout(() => {
          this._createSocketConnection(token);
        }, 1000); // Small delay to ensure everything is initialized
      });
    }

    return this.socket;
  }

  // Create the actual socket connection
  _createSocketConnection(token) {
    try {
      // Connect to socket server with auth token
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        autoConnect: this.autoConnect, // Use our control flag
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        auth: {
          token: token
        },
        query: {
          token: token  // Redundant but provides fallback
        },
        // Add headers for non-browser environments or proxies that might strip auth
        extraHeaders: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });

      // Setup event handlers
      this._setupEventHandlers();
    } catch (error) {
      console.error('Error creating socket connection:', error);
    }
  }

  // Setup common event handlers
  _setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
      this.connectionRetries = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connected = false;
      this.connectionRetries++;
      
      // If connection fails due to auth, don't keep trying
      if (error.message === 'Authentication required' || this.connectionRetries >= this.maxRetries) {
        console.log('Socket connection deferred until user authenticates');
        if (this.socket) {
          this.socket.disconnect();
        }
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionAttempted = false;
    }
  }

  // Reconnect with new auth token (useful after login)
  reconnect() {
    this.disconnect();
    this.connectionAttempted = false;
    this.connectionRetries = 0;
    return this.connect(true); // Force connection
  }

  // Check if socket is currently connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Emit an event to the server
  emit(event, data, callback) {
    // Only try to connect if we have authentication
    const hasAuth = localStorage.getItem('HRtoken') || localStorage.getItem('EMtoken');
    
    if (hasAuth && !this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      this.socket.emit(event, data, callback);
    } else {
      console.warn('Cannot emit event - socket not connected and no auth available');
    }
  }

  // Listen for an event from the server
  on(event, handler) {
    // Only try to connect if we have authentication
    const hasAuth = localStorage.getItem('HRtoken') || localStorage.getItem('EMtoken');
    
    if (hasAuth && !this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      this.socket.on(event, handler);
    } else {
      console.warn(`Cannot listen for "${event}" - socket not connected and no auth available`);
    }
  }

  // Remove event listener
  off(event, handler) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  // Get the socket instance
  getSocket() {
    const hasAuth = localStorage.getItem('HRtoken') || localStorage.getItem('EMtoken');
    
    if (hasAuth && !this.socket) {
      return this.connect();
    }
    return this.socket;
  }
  
  // Get the current user type
  getUserType() {
    return this.userType;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Hook for React components to use socket
export const useSocket = () => {
  const hasAuth = localStorage.getItem('HRtoken') || localStorage.getItem('EMtoken');
  const socket = hasAuth ? socketService.getSocket() : null;
  
  return {
    socket,
    isConnected: socketService.isConnected(),
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
    reconnect: socketService.reconnect.bind(socketService),
    userType: socketService.getUserType()
  };
};

export default socketService;
