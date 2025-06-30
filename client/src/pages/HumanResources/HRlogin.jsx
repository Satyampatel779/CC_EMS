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
import HRLayout from "@/components/HRLayout.jsx"

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
        <HRLayout>
            <LoadingBar ref={loadingbar} />
            {/* Back to Home */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="flex items-center text-white/70 hover:text-white transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>
            {/* Login Card */}
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
                    {/* Form */}
                    <form onSubmit={handlesigninsubmit} className="space-y-4">
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
        </HRLayout>
    )
}