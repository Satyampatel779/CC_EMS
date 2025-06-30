import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { EnhancedGlassCard } from './EnhancedGlassCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Real-time Analytics Chart Component
 */
export const RealTimeChart = ({ 
  type = 'line', 
  data, 
  title, 
  height = '300px',
  className = '',
  gradient = true,
  animated = true 
}) => {
  const [chartData, setChartData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  // Chart options with glassmorphic styling
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      }
    },
    animation: animated ? {
      duration: 1000,
      easing: 'easeInOutQuart'
    } : false
  };

  // Enhanced gradient colors for different chart types
  const createGradient = (ctx, chartArea, colorStart, colorEnd) => {
    if (!chartArea) return null;
    
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={baseOptions} />;
      case 'bar':
        return <Bar data={chartData} options={baseOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={{
          ...baseOptions,
          cutout: '70%',
          scales: {}
        }} />;
      case 'area':
        return <Line data={{
          ...chartData,
          datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }))
        }} options={baseOptions} />;
      default:
        return <Line data={chartData} options={baseOptions} />;
    }
  };

  return (
    <EnhancedGlassCard variant="crystal" className={`p-6 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div style={{ height }}>
          {renderChart()}
        </div>
      )}
    </EnhancedGlassCard>
  );
};

/**
 * Real-time Metrics Grid
 */
export const RealTimeMetrics = ({ metrics = [], updateInterval = 5000 }) => {
  const [currentMetrics, setCurrentMetrics] = useState(metrics);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setCurrentMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10 - 5),
        change: (Math.random() * 20 - 10).toFixed(1) + '%'
      })));
      setLastUpdate(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Live Metrics</h3>
        <div className="flex items-center space-x-2 text-green-400 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live • {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {currentMetrics.map((metric, index) => (
          <EnhancedGlassCard 
            key={index} 
            variant="frosted" 
            className="p-4"
            animateIn={true}
            delay={index * 100}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {metric.label}
              </div>
              <div className={`text-xs font-medium ${
                metric.change?.startsWith('+') ? 'text-green-400' : 
                metric.change?.startsWith('-') ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.change}
              </div>
            </div>
          </EnhancedGlassCard>
        ))}
      </div>
    </div>
  );
};

/**
 * Activity Feed Component
 */
export const ActivityFeed = ({ activities = [], realTime = true }) => {
  const [currentActivities, setCurrentActivities] = useState(activities);

  useEffect(() => {
    if (!realTime) return;

    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ['employee', 'leave', 'request', 'department'][Math.floor(Math.random() * 4)],
        action: 'New activity detected',
        time: 'Just now',
        icon: '🔔'
      };

      setCurrentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 30000); // Add new activity every 30 seconds

    return () => clearInterval(interval);
  }, [realTime]);

  return (
    <EnhancedGlassCard variant="crystal" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Activity Feed</h3>
        {realTime && (
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {currentActivities.map((activity, index) => (
          <div 
            key={activity.id || index}
            className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-in slide-in-from-right"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
              {activity.icon || '📊'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{activity.action}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </EnhancedGlassCard>
  );
};
