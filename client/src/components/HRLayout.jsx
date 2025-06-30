import React from 'react'
import ParticleBackground from '@/components/ParticleBackground.jsx'

/**
 * HRLayout provides a consistent background and container for HR pages
 */
const HRLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Background Effect */}
      <ParticleBackground />
      {/* Content Container */}
      <div className="relative z-10 flex justify-center items-center p-6 min-h-screen">
        {children}
      </div>
    </div>
  )
}

export default HRLayout
