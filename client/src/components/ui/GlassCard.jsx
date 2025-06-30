import React from 'react';

/**
 * A reusable glassmorphic card component for consistent design.
 */
export const GlassCard = ({ children, className = '' }) => (
  <div
    className={`bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </div>
);
