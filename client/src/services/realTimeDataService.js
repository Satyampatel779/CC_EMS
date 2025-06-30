import React from 'react';
import { io } from 'socket.io-client';

class RealTimeDataService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialize socket connection
   */
  connect(serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:8000') {
    try {
      this.socket = io(serverUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      return null;
    }
  }

  /**
   * Setup default socket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Real-time service connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Real-time service disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection:error', { error, maxAttemptsReached: true });
      }
    });

    // Dashboard-specific events
    this.socket.on('dashboard:update', (data) => {
      this.emit('dashboard:update', data);
    });

    this.socket.on('employee:update', (data) => {
      this.emit('employee:update', data);
    });

    this.socket.on('attendance:update', (data) => {
      this.emit('attendance:update', data);
    });

    this.socket.on('leave:update', (data) => {
      this.emit('leave:update', data);
    });

    this.socket.on('system:metrics', (data) => {
      this.emit('system:metrics', data);
    });

    // Activity feed updates
    this.socket.on('activity:new', (activity) => {
      this.emit('activity:new', activity);
    });
  }

  /**
   * Subscribe to real-time dashboard updates
   */
  subscribeToHRDashboard() {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribe:hr-dashboard');
      console.log('📊 Subscribed to HR dashboard updates');
    }
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribeFromHRDashboard() {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe:hr-dashboard');
      console.log('🔇 Unsubscribed from HR dashboard updates');
    }
  }

  /**
   * Request latest dashboard data
   */
  requestDashboardData() {
    if (this.socket && this.isConnected) {
      this.socket.emit('request:dashboard-data');
    }
  }

  /**
   * Request system metrics
   */
  requestSystemMetrics() {
    if (this.socket && this.isConnected) {
      this.socket.emit('request:system-metrics');
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('🔌 Disconnected from real-time service');
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Simulate real-time data for development
   */
  simulateRealTimeData() {
    if (!this.isConnected) return;

    const simulateMetrics = () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        serverLoad: Math.floor(Math.random() * 100),
        responseTime: Math.floor(Math.random() * 500) + 100,
        memoryUsage: Math.floor(Math.random() * 80) + 20,
        cpuUsage: Math.floor(Math.random() * 60) + 10
      };
      
      this.emit('system:metrics', metrics);
    };

    const simulateActivity = () => {
      const activities = [
        'New employee joined the team',
        'Leave request submitted',
        'Department meeting scheduled',
        'Performance review completed',
        'Training session scheduled',
        'Project milestone achieved'
      ];

      const activity = {
        id: Date.now(),
        action: activities[Math.floor(Math.random() * activities.length)],
        time: 'Just now',
        type: 'system',
        icon: '🔔'
      };

      this.emit('activity:new', activity);
    };

    // Simulate metrics every 5 seconds
    setInterval(simulateMetrics, 5000);
    
    // Simulate activities every 30 seconds
    setInterval(simulateActivity, 30000);

    // Initial data
    simulateMetrics();
  }
}

// Create singleton instance
const realTimeService = new RealTimeDataService();

export default realTimeService;

/**
 * React hook for using real-time data service
 */
export const useRealTimeData = () => {
  const [connectionStatus, setConnectionStatus] = React.useState({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });

  React.useEffect(() => {
    // Connect to real-time service
    realTimeService.connect();
    
    // Subscribe to connection status updates
    const handleConnectionStatus = (status) => {
      setConnectionStatus(prev => ({ ...prev, ...status }));
    };

    realTimeService.on('connection:status', handleConnectionStatus);

    // Start simulation for development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        realTimeService.simulateRealTimeData();
      }, 2000);
    }

    return () => {
      realTimeService.off('connection:status', handleConnectionStatus);
      realTimeService.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    service: realTimeService,
    subscribe: realTimeService.subscribeToHRDashboard.bind(realTimeService),
    unsubscribe: realTimeService.unsubscribeFromHRDashboard.bind(realTimeService),
    requestData: realTimeService.requestDashboardData.bind(realTimeService),
    requestMetrics: realTimeService.requestSystemMetrics.bind(realTimeService)
  };
};
