import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, FileText, LogOut, Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
        { path: '/admin/overrides', icon: <Shield size={20} />, label: 'Overrides' },
        { path: '/admin/analytics', icon: <Activity size={20} />, label: 'System Analytics' },
        { path: '/admin/logs', icon: <FileText size={20} />, label: 'Audit Logs' },
    ];

    return (
        <div className="flex h-screen bg-gray-950 text-white font-sans">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col fixed h-full z-10 hidden md:flex`}>
                <div className="p-4 flex items-center justify-between border-b border-gray-800 h-16">
                    {sidebarOpen ? (
                        <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">FinTech Admin</h1>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">FA</div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <div className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}>
                                    {item.icon}
                                </div>
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${!sidebarOpen && 'px-2'}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && "Logout"}
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-20">
                <h1 className="font-bold text-lg text-white">FinTech Admin</h1>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu /></Button>
            </div>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto bg-gray-950 p-6 md:p-8 pt-20 md:pt-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
