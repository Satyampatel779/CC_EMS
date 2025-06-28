import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import { useHRSignup } from '../../hooks/useHRAuth';
import ParticleBackground from "../../components/ParticleBackground.jsx"
import { Shield, Briefcase, Eye, EyeOff, ArrowLeft, Users, BarChart3, Lock, Building, Mail, Phone, User } from "lucide-react"
import { apiService } from "@/apis/apiService"

export const HRSignupPage = () => {
    const [signupform, set_signuform] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contactnumber: "",
        password: "",
        textpassword: "",
        name: "",
        description: "",
        OrganizationURL: "",
        OrganizationMail: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [hrStats, setHrStats] = useState({
        totalEmployees: 0,
        attendanceRate: 0,
        activeUsers: 0
    });

    const navigate = useNavigate();
    const loadingbar = useRef(null);

    // Fetch HR dashboard stats
    useEffect(() => {
        const fetchHRStats = async () => {
            try {
                console.log('🔄 Fetching HR signup stats...');
                
                // Fetch employee count
                const employeeResponse = await apiService.get('/api/v1/employee/public-all');
                if (employeeResponse.data.success) {
                    const employeeCount = employeeResponse.data.count || 0;
                    setHrStats(prev => ({ ...prev, totalEmployees: employeeCount, activeUsers: employeeCount }));
                }
                
                // Fetch attendance rate
                const attendanceResponse = await apiService.get('/api/v1/attendance/public-stats');
                if (attendanceResponse.data.success && attendanceResponse.data.data) {
                    const attendanceRate = attendanceResponse.data.data.attendanceRate || 0;
                    setHrStats(prev => ({ ...prev, attendanceRate }));
                }
                
                console.log('✅ HR signup stats fetched successfully');
            } catch (error) {
                console.log('⚠️ Error fetching HR signup stats, using fallback values');
                setHrStats({
                    totalEmployees: 156,
                    attendanceRate: 89,
                    activeUsers: 156
                });
            }
        };

        fetchHRStats();
    }, []);

    const handlesignupform = (event) => {
        set_signuform((prevForm) => ({
            ...prevForm,
            [event.target.name]: event.target.value
        }));
    };

    const { loading, error, success, handleSignup } = useHRSignup();

    const handlesubmitform = (event) => {
        event.preventDefault();
        
        if (signupform.textpassword !== signupform.password) {
            // Handle password mismatch
            return;
        }
        
        loadingbar.current.continuousStart();
        handleSignup(signupform);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
            <LoadingBar ref={loadingbar} />
            
            {/* Particle Background */}
            <ParticleBackground />
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Back to Home */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="flex items-center text-white/70 hover:text-white transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
                    <div className="max-w-md">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                                <Shield className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">EMS Pro</h1>
                                <p className="text-gray-300">HR Administration Portal</p>
                            </div>
                        </div>
                        
                        <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                            Start Managing Your
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Organization</span>
                        </h2>
                        
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                            Create your HR admin account and unlock powerful workforce management tools designed for modern organizations.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-4 mb-8">
                            {[
                                { icon: <Building className="w-5 h-5" />, text: "Complete Organization Setup" },
                                { icon: <Users className="w-5 h-5" />, text: "Employee Management System" },
                                { icon: <BarChart3 className="w-5 h-5" />, text: "Advanced Analytics Dashboard" },
                                { icon: <Lock className="w-5 h-5" />, text: "Enterprise Security" }
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center text-gray-300">
                                    <div className="text-blue-400 mr-3">{feature.icon}</div>
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Real-time Stats */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 text-center">Join Other Organizations</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{hrStats.totalEmployees}+</div>
                                    <div className="text-xs text-gray-400">Employees Managed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">{hrStats.attendanceRate}%</div>
                                    <div className="text-xs text-gray-400">Avg Attendance</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">EMS Pro</h1>
                                <p className="text-gray-300 text-sm">HR Administration</p>
                            </div>
                        </div>

                        {/* Signup Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Create HR Account</h3>
                                <p className="text-gray-300">Set up your organization's HR portal</p>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm">{error?.message || "An error occurred during signup"}</p>
                                </div>
                            )}

                            {/* Success Display */}
                            {success && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <p className="text-green-400 text-sm">Account created successfully!</p>
                                </div>
                            )}

                            {/* Signup Form */}
                            <form onSubmit={handlesubmitform} className="space-y-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium text-sm uppercase tracking-wide">Personal Information</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstname" className="text-white font-medium">First Name</Label>
                                            <Input
                                                id="firstname"
                                                name="firstname"
                                                type="text"
                                                value={signupform.firstname}
                                                onChange={handlesignupform}
                                                required
                                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastname" className="text-white font-medium">Last Name</Label>
                                            <Input
                                                id="lastname"
                                                name="lastname"
                                                type="text"
                                                value={signupform.lastname}
                                                onChange={handlesignupform}
                                                required
                                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={signupform.email}
                                            onChange={handlesignupform}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactnumber" className="text-white font-medium">Contact Number</Label>
                                        <Input
                                            id="contactnumber"
                                            name="contactnumber"
                                            type="tel"
                                            value={signupform.contactnumber}
                                            onChange={handlesignupform}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>

                                {/* Organization Information */}
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium text-sm uppercase tracking-wide">Organization Details</h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-white font-medium">Organization Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={signupform.name}
                                            onChange={handlesignupform}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                            placeholder="Acme Corporation"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="OrganizationMail" className="text-white font-medium">Organization Email</Label>
                                        <Input
                                            id="OrganizationMail"
                                            name="OrganizationMail"
                                            type="email"
                                            value={signupform.OrganizationMail}
                                            onChange={handlesignupform}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                            placeholder="contact@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="OrganizationURL" className="text-white font-medium">Organization Website</Label>
                                        <Input
                                            id="OrganizationURL"
                                            name="OrganizationURL"
                                            type="url"
                                            value={signupform.OrganizationURL}
                                            onChange={handlesignupform}
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                            placeholder="https://company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-white font-medium">Organization Description</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={signupform.description}
                                            onChange={handlesignupform}
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg p-3 resize-none"
                                            placeholder="Brief description of your organization..."
                                        />
                                    </div>
                                </div>

                                {/* Password Information */}
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium text-sm uppercase tracking-wide">Security</h4>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-white font-medium">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={signupform.password}
                                                onChange={handlesignupform}
                                                required
                                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 pr-12"
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="textpassword" className="text-white font-medium">Confirm Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="textpassword"
                                                name="textpassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={signupform.textpassword}
                                                onChange={handlesignupform}
                                                required
                                                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 pr-12"
                                                placeholder="Confirm your password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Mismatch Warning */}
                                    {signupform.password && signupform.textpassword && signupform.password !== signupform.textpassword && (
                                        <div className="text-red-400 text-sm">Passwords do not match</div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || signupform.password !== signupform.textpassword}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Creating Account...
                                        </div>
                                    ) : (
                                        'Create HR Account'
                                    )}
                                </Button>
                            </form>

                            {/* Login Link */}
                            <div className="text-center mt-6 pt-6 border-t border-white/10">
                                <p className="text-gray-300 text-sm">
                                    Already have an account?{' '}
                                    <Link to="/auth/HR/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};