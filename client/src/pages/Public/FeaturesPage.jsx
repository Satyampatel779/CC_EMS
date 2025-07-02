import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Calendar,
  FileText,
  Settings,
  Smartphone,
  Cloud,
  Star,
  CheckCircle,
  ArrowRight,
  Home,
  Phone,
  Mail,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import ParticleBackground from "../../components/ParticleBackground";

const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Employee Management",
      description: "Comprehensive employee profiles with role-based access control and department organization.",
      details: [
        "Complete employee profiles and records",
        "Role-based access control",
        "Department and team organization",
        "Employee onboarding workflows",
        "Performance tracking and reviews"
      ]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time & Attendance",
      description: "Real-time attendance tracking with automated timesheets and comprehensive reporting.",
      details: [
        "Real-time clock in/out system",
        "Automated timesheet generation",
        "Attendance analytics and reports",
        "Break time tracking",
        "Overtime calculations"
      ]
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Automated Payroll",
      description: "Streamlined payroll processing with tax calculations, compliance management, and direct deposit integration.",
      details: [
        "Automated salary calculations",
        "Tax and deduction management",
        "Direct deposit integration",
        "Payslip generation and distribution",
        "Compliance with local regulations"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive reporting and analytics to make data-driven decisions about your workforce.",
      details: [
        "Real-time dashboard analytics",
        "Custom report generation",
        "Performance metrics tracking",
        "Attendance and productivity insights",
        "Exportable charts and graphs"
      ]
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Leave Management",
      description: "Efficient leave request and approval workflow with automated balance calculations and calendar integration.",
      details: [
        "Online leave request submission",
        "Multi-level approval workflow",
        "Automated leave balance calculations",
        "Calendar integration and notifications",
        "Holiday and policy management"
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Management",
      description: "Centralized document storage with version control, digital signatures, and secure access.",
      details: [
        "Centralized document repository",
        "Version control and history tracking",
        "Digital signature integration",
        "Secure file sharing and access",
        "Automated document workflows"
      ]
    }
  ];

  const additionalFeatures = [
    { icon: <Shield />, title: "Security & Compliance", description: "Enterprise-grade security with role-based access control" },
    { icon: <Smartphone />, title: "Mobile App", description: "Native mobile applications for iOS and Android" },
    { icon: <Cloud />, title: "Cloud-Based", description: "Secure cloud infrastructure with 99.9% uptime guarantee" },
    { icon: <Settings />, title: "Customizable", description: "Flexible configuration to match your business needs" },
    { icon: <Zap />, title: "API Integration", description: "RESTful APIs for seamless third-party integrations" },
    { icon: <Globe />, title: "Multi-Language", description: "Support for multiple languages and currencies" }
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
              <Link to="/features" className="text-purple-400 font-semibold">Features</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
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
            Powerful <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Features</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover comprehensive tools designed to streamline your HR operations and boost workforce productivity
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Modern Technology
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Secure & Reliable
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              Easy to Use
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white/10 border-purple-500/50 backdrop-blur-xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-xl'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${
                      activeFeature === index
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/10'
                    }`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sticky top-32">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                  <div className="text-white">
                    {features[activeFeature].icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white">{features[activeFeature].title}</h3>
              </div>
              <p className="text-gray-300 mb-6">{features[activeFeature].description}</p>
              <ul className="space-y-3">
                {features[activeFeature].details.map((detail, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">More Amazing Features</h2>
            <p className="text-xl text-gray-300">Everything you need for modern HR management</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your HR?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Experience the power of modern HR management. Start your journey with EMS Pro today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/auth/HR/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/contact" className="border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center">
                Learn More
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

export default FeaturesPage;
