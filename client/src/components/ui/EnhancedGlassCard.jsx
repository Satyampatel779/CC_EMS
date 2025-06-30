import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced Glassmorphic Card Component with beautiful effects
 */
export const EnhancedGlassCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  glow = false,
  hoverable = true,
  animateIn = false,
  delay = 0
}) => {
  const variants = {
    default: 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20',
    frosted: 'bg-white/15 dark:bg-gray-900/15 backdrop-blur-2xl border border-white/30 dark:border-gray-600/30',
    crystal: 'bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/20 dark:to-gray-900/5 backdrop-blur-3xl border border-white/40 dark:border-gray-500/40',
    aurora: 'bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-teal-500/10 backdrop-blur-2xl border border-white/30',
    neon: 'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/25'
  };

  const glowEffects = {
    default: 'shadow-lg hover:shadow-2xl',
    glow: 'shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40',
    aurora: 'shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/35',
    neon: 'shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40'
  };

  return (
    <div
      className={cn(
        'rounded-3xl transition-all duration-500 ease-out',
        variants[variant],
        glow ? glowEffects.glow : glowEffects.default,
        hoverable && 'hover:-translate-y-2 hover:scale-[1.02] cursor-pointer',
        animateIn && 'animate-in slide-in-from-bottom-4 fade-in duration-700',
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {glow && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * Floating Glass Panel for major sections
 */
export const GlassPanel = ({ children, className = '', ...props }) => (
  <EnhancedGlassCard
    variant="crystal"
    glow={true}
    className={cn('p-8', className)}
    {...props}
  >
    {children}
  </EnhancedGlassCard>
);

/**
 * Metric Card with glassmorphic design
 */
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'blue',
  delay = 0 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <EnhancedGlassCard
      variant="frosted"
      hoverable={true}
      animateIn={true}
      delay={delay}
      className="group p-6 relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <p className={`text-sm font-medium ${trendColor} flex items-center`}>
              {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
            </p>
          )}
        </div>
        
        {/* Icon */}
        <div className={`p-4 rounded-2xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </EnhancedGlassCard>
  );
};
