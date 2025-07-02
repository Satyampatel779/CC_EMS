import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Award, 
  Heart,
  ArrowRight,
  Home,
  Phone,
  Mail,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  Clock,
  Building
} from 'lucide-react';
import ParticleBackground from "../../components/ParticleBackground";

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { number: '2', label: 'Months of Development', icon: <Calendar className="w-6 h-6" /> },
    { number: '1', label: 'Dedicated Developer', icon: <Users className="w-6 h-6" /> },
    { number: '100%', label: 'Built from Scratch', icon: <Building className="w-6 h-6" /> },
    { number: '2025', label: 'Project Completion', icon: <Star className="w-6 h-6" /> }
  ];

  const teamMembers = [
    {
      name: "Satyam Patel",
      role: "Creator & Full-Stack Developer",
      image: "/api/placeholder/300/300",
      bio: "Solo developer passionate about creating efficient HR management solutions. Built EMS Pro from concept to completion over 2 months."
    }
  ];

  const milestones = [
    { year: 'Nov 2024', title: 'Project Started', description: 'Began development of EMS Pro as a solo project with a vision for modern HR management' },
    { year: 'Dec 2024', title: 'Core Features', description: 'Implemented employee management, attendance tracking, and authentication systems' },
    { year: 'Jan 2025', title: 'Advanced Features', description: 'Added payroll management, leave tracking, and comprehensive dashboard analytics' },
    { year: 'Jul 2025', title: 'Project Completion', description: 'Finalized all features with modern UI, real-time data, and production-ready deployment' }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "User-Centric Design",
      description: "Every feature is designed with the end user in mind, ensuring intuitive interfaces and seamless user experience across all modules."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Robust Security",
      description: "Implemented comprehensive authentication, authorization, and data protection measures to ensure sensitive HR data remains secure."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Modern Technology",
      description: "Built using cutting-edge technologies including React, Node.js, MongoDB, and modern UI frameworks for optimal performance and scalability."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Code Quality",
      description: "Commitment to clean, maintainable code with proper architecture, error handling, and best practices throughout the development process."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EMS Pro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                <Home className="w-5 h-5 inline mr-2" />
                Home
              </Link>
              <Link to="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link to="/about" className="text-purple-400 font-semibold">About</Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/employee/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/auth/HR/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">EMS Pro</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A passion project born from the vision of creating an efficient, modern HR management system. 
            Built entirely by one developer over 2 months, EMS Pro represents dedication to solving real-world HR challenges.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-purple-400 mr-2" />
              Started Nov 2024
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-purple-400 mr-2" />
              Solo Developer
            </div>
            <div className="flex items-center">
              <Building className="w-4 h-4 text-purple-400 mr-2" />
              Full-Stack Project
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-4">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission/Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'mission'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mission
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'vision'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'values'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Values
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-white mb-6">Project Mission</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  To create a comprehensive, modern HR management system that simplifies employee management, attendance tracking, 
                  and payroll processing. Built as a solo project to demonstrate full-stack development skills and solve real-world 
                  HR challenges with clean, intuitive design and robust functionality.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
                <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-white mb-6">Development Vision</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  To showcase the power of modern web technologies in creating enterprise-level applications. This project represents 
                  a complete journey from concept to deployment, incorporating best practices in React, Node.js, MongoDB, and modern UI/UX design 
                  to deliver a production-ready HR management solution.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-6">
                      <div className="text-white">
                        {value.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Development Timeline</h2>
            <p className="text-xl text-gray-300">Key milestones in the project development journey</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                      <div className="text-2xl font-bold text-purple-400 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-slate-900"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">The Developer</h2>
            <p className="text-xl text-gray-300">Meet the creator behind EMS Pro</p>
          </div>

          <div className="flex justify-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300 max-w-md">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-purple-400 mb-4 text-lg">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Experience EMS Pro</h2>
            <p className="text-xl text-gray-300 mb-8">
              Ready to explore a modern HR management solution? Try out the demo or get in touch to learn more about this project.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/auth/HR/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center">
                Try Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/contact" className="border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center">
                Get in Touch
                <Mail className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">EMS Pro</span>
              </div>
              <p className="text-gray-400">Modern employee management solutions for the digital workplace.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Access</h3>
              <ul className="space-y-2">
                <li><Link to="/auth/employee/login" className="text-gray-400 hover:text-white transition-colors">Employee Login</Link></li>
                <li><Link to="/auth/HR/login" className="text-gray-400 hover:text-white transition-colors">HR Login</Link></li>
                <li><Link to="/auth/HR/signup" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Built With</h3>
              <ul className="space-y-2 text-gray-400">
                <li>React & Node.js</li>
                <li>MongoDB & Express</li>
                <li>Tailwind CSS</li>
                <li>Modern Technologies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 EMS Pro. Built by Satyam Patel</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
