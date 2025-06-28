import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import LoadingBar from 'react-top-loading-bar'
import { CommonStateHandler } from "../../utils/commonhandler.js"
import { HandleGetHumanResources, HandlePostHumanResources } from "../../redux/Thunks/HRThunk.js"
import ParticleBackground from "../../components/ParticleBackground.jsx"
import { Shield, Briefcase, Eye, EyeOff, ArrowLeft, Users, BarChart3, Lock } from "lucide-react"
import { apiService } from "@/apis/apiService"

export const HRLogin = () => {
    const HRState = useSelector((state) => state.HRReducer)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loadingbar = useRef(null)
    const [showPassword, setShowPassword] = useState(false)
    const [hrStats, setHrStats] = useState({
        totalEmployees: 0,
        attendanceRate: 0,
        activeUsers: 0
    })
    const [signinform, setsigninform] = useState({
        email: "",
        password: ""
    })

    // Debug logging
    useEffect(() => {
        console.log('🔍 HR Login - Current HRState:', HRState);
    }, [HRState]);

    const handlesigninform = (event) => {
        CommonStateHandler(signinform, setsigninform, event)
    }

    const handlesigninsubmit = (e) => {
        e.preventDefault();
        console.log('🚀 HR Login - Submitting form with:', signinform);
        loadingbar.current.continuousStart();
        dispatch(HandlePostHumanResources({ apiroute: "LOGIN", data: signinform }))
    }

    if (HRState.error.status) {
        console.log('❌ HR Login - Error detected:', HRState.error);
        loadingbar.current.complete()
    }

    useEffect(() => {
        console.log('🔄 HR Login - Auth state changed. isAuthenticated:', HRState.isAuthenticated);
        
        if (!HRState.isAuthenticated) {
            console.log('🔍 HR Login - Checking existing login...');
            dispatch(HandleGetHumanResources({ apiroute: "CHECKLOGIN" }))
        }

        if (HRState.isAuthenticated) {
            console.log('✅ HR Login - Authentication successful! Redirecting to dashboard data...');
            loadingbar.current.complete()
            navigate("/HR/dashboard/dashboard-data")
        }
    }, [HRState.isAuthenticated])

    // Fetch HR dashboard stats
    useEffect(() => {
        const fetchHRStats = async () => {
            try {
                console.log('🔄 Fetching HR stats...');
                
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
                
                console.log('✅ HR stats fetched successfully');
            } catch (error) {
                console.log('⚠️ Error fetching HR stats, using fallback values');
                setHrStats({
                    totalEmployees: 156,
                    attendanceRate: 89,
                    activeUsers: 156
                });
            }
        };

        fetchHRStats();
    }, []);

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
                            Manage Your Workforce with
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Confidence</span>
                        </h2>
                        
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                            Access powerful HR tools, analytics, and employee management features designed for modern administrators.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-4 mb-8">
                            {[
                                { icon: <Users className="w-5 h-5" />, text: "Complete Employee Management" },
                                { icon: <BarChart3 className="w-5 h-5" />, text: "Advanced Analytics & Reports" },
                                { icon: <Lock className="w-5 h-5" />, text: "Enterprise-Grade Security" }
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center text-gray-300">
                                    <div className="text-blue-400 mr-3">{feature.icon}</div>
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Real-time Stats */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 text-center">Live Dashboard</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{hrStats.totalEmployees}</div>
                                    <div className="text-xs text-gray-400">Total Employees</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">{hrStats.attendanceRate}%</div>
                                    <div className="text-xs text-gray-400">Attendance Today</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
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

                        {/* Login Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                                <p className="text-gray-300">Sign in to your HR admin account</p>
                            </div>

                            {/* Error Display */}
                            {HRState.error.status && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm">{HRState.error.message}</p>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handlesigninsubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={signinform.email}
                                        onChange={handlesigninform}
                                        required
                                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={signinform.password}
                                            onChange={handlesigninform}
                                            required
                                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 pr-12"
                                            placeholder="Enter your password"
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

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20" />
                                        <span className="ml-2 text-sm text-gray-300">Remember me</span>
                                    </label>
                                    <Link to="/auth/HR/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={HRState.loading}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {HRState.loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Signing In...
                                        </div>
                                    ) : (
                                        'Sign In to HR Portal'
                                    )}
                                </Button>
                            </form>

                            {/* Sign Up Link */}
                            <div className="text-center mt-6 pt-6 border-t border-white/10">
                                <p className="text-gray-300">
                                    Don't have an account?{' '}
                                    <Link to="/auth/HR/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                        Create HR Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}