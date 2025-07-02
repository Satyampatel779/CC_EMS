import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageSquare,
  ArrowRight,
  Home,
  CheckCircle,
  Globe,
  Headphones,
  Calendar,
  Building,
  Star,
  Shield
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Me",
      description: "Get in touch via email",
      details: "Your email will be added here",
      action: "Send Email",
      available: "Response within 24 hours"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Project Inquiry",
      description: "Ask about the project",
      details: "Technical questions welcome",
      action: "Contact",
      available: "Available daily"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Schedule Discussion",
      description: "Discuss the project",
      details: "Virtual meeting available",
      action: "Schedule",
      available: "Flexible timing"
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Remote Work",
      description: "Working remotely",
      details: "No physical office location",
      action: "Online Only",
      available: "Digital communication"
    }
  ];

  const workInfo = {
    location: "Remote Developer",
    description: "Working remotely on this solo project",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    availability: "Open to project discussions and technical questions",
    timezone: "Available for virtual meetings"
  };

  const faqItems = [
    {
      question: "Is this a real working application?",
      answer: "Yes! This is a fully functional HR management system built over 2 months with modern web technologies including React, Node.js, and MongoDB."
    },
    {
      question: "Can I see the source code?",
      answer: "Feel free to reach out to discuss the technical implementation, architecture decisions, and code structure of this project."
    },
    {
      question: "What technologies were used?",
      answer: "The frontend is built with React, Vite, and Tailwind CSS. The backend uses Node.js, Express, and MongoDB with JWT authentication."
    },
    {
      question: "Is this project available for hire/consultation?",
      answer: "Yes, I'm open to discussing this project, my development process, and potential collaboration opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="text-purple-400 font-semibold">Contact</Link>
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
            Get in <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Interested in this project or have questions about the development process? 
            I'd love to hear from you and discuss EMS Pro and the technologies behind it.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Building className="w-4 h-4 text-purple-400 mr-2" />
              Solo Developer
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-purple-400 mr-2" />
              Remote Work
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-purple-400 mr-2" />
              Open Source Mindset
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 group">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {method.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-gray-300 mb-3">{method.description}</p>
                <p className="text-purple-400 font-semibold mb-2">{method.details}</p>
                <p className="text-sm text-gray-400 mb-4">{method.available}</p>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all duration-300 border border-white/20">
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Send a Message</h2>
            <p className="text-xl text-gray-300">Have a question or want to discuss this project? Drop me a line!</p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general" className="bg-slate-800">General Inquiry</option>
                    <option value="technical" className="bg-slate-800">Technical Discussion</option>
                    <option value="collaboration" className="bg-slate-800">Collaboration</option>
                    <option value="hiring" className="bg-slate-800">Job Opportunity</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block text-white text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Tell me about your inquiry, technical questions, or collaboration ideas..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </div>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Message Sent!</h3>
              <p className="text-xl text-gray-300 mb-8">
                Thank you for reaching out! I'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg transition-all duration-300"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Work Setup Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Remote Development Setup</h2>
            <p className="text-xl text-gray-300">Working remotely to build modern solutions</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-6">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{workInfo.location}</h3>
                  <p className="text-gray-300 mb-4">{workInfo.description}</p>
                  <p className="text-purple-400 mb-2">{workInfo.availability}</p>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {workInfo.timezone}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-white mb-4">Technologies Used</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {workInfo.technologies.map((tech, index) => (
                      <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-3 text-center">
                        <span className="text-purple-400 font-medium">{tech}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-white text-sm">
                      💡 <strong>Note:</strong> This is a solo project with no physical office location. 
                      All communication is done digitally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300">Common questions about this project</p>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Connect?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you have technical questions, collaboration ideas, or job opportunities, I'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/" className="border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center">
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                Back to Home
              </Link>
              <a href="#contact-form" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl transition-all duration-300 flex items-center">
                Send Message
                <Send className="w-5 h-5 ml-2" />
              </a>
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
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-white transition-colors">Home</Link>
                <Link to="/features" className="block text-gray-400 hover:text-white transition-colors">Features</Link>
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Authentication</h3>
              <div className="space-y-2">
                <Link to="/auth/employee/login" className="block text-gray-400 hover:text-white transition-colors">Employee Login</Link>
                <Link to="/auth/HR/login" className="block text-gray-400 hover:text-white transition-colors">HR Login</Link>
                <Link to="/auth/HR/signup" className="block text-gray-400 hover:text-white transition-colors">HR Signup</Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Developer</h3>
              <p className="text-gray-400 mb-2">Satyam Patel</p>
              <p className="text-gray-400 text-sm">Solo Full-Stack Developer</p>
              <p className="text-gray-400 text-sm">Built with ❤️ using modern web technologies</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 EMS Pro. Built by Satyam Patel as a portfolio project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
