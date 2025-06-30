import { SidebarProvider } from "@/components/ui/sidebar"
import { HRdashboardSidebar } from "../../components/ui/HRsidebar.jsx"
import { Outlet } from "react-router-dom"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import ParticleBackground from "../../components/ParticleBackground.jsx"

export const HRDashbaord = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const pathArray = location.pathname.split("/")

    useEffect(() => {
        // If on the base dashboard route, redirect to dashboard-data
        if (location.pathname === "/HR/dashboard") {
            navigate("/HR/dashboard/dashboard-data");
        }
    }, [location.pathname, navigate])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Beautiful Background with enhanced effects */}
            <ParticleBackground />
            
            {/* Enhanced Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary Aurora Effect */}
                <div className="absolute inset-0 aurora-bg opacity-30"></div>
                
                {/* Floating Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse float-animation"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000 float-animation"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-pulse delay-2000 float-animation"></div>
                <div className="absolute top-3/4 left-1/6 w-64 h-64 bg-pink-500/12 rounded-full blur-2xl animate-pulse delay-3000 float-animation"></div>
                <div className="absolute top-1/6 right-1/6 w-64 h-64 bg-green-500/12 rounded-full blur-2xl animate-pulse delay-4000 float-animation"></div>
                
                {/* Additional smaller orbs for depth */}
                <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-yellow-500/8 rounded-full blur-xl animate-pulse delay-5000 float-animation"></div>
                <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-6000 float-animation"></div>
            </div>

            {/* Floating Particles with enhanced effect */}
            <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-white/20 to-blue-400/20 animate-pulse"
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${2 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Enhanced Sidebar with glassmorphic effect */}
                <div className="hr-dashboard-sidebar">
                    <SidebarProvider>
                        <HRdashboardSidebar />
                    </SidebarProvider>
                </div>
                
                {/* Main Content with enhanced glassmorphic container */}
                <div className="flex-1 min-h-screen">
                    <div className="hr-dashboard-content h-full w-full p-4 md:p-6">
                        <div className="h-full glass-effect-strong rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-500">
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
                            
                            {/* Content container */}
                            <div className="relative z-10 h-full">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}