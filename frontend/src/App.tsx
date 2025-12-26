import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
}

import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import SystemAnalytics from './pages/admin/SystemAnalytics';
import AuditLogViewer from './pages/admin/AuditLogViewer';
import LoanOverrides from './pages/admin/LoanOverrides';

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Loading...</div>;
    return user && user.role === 'ADMIN' ? <>{children}</> : <Navigate to="/login" />;
}

import LoanList from './pages/LoanList';
import LoanDetail from './pages/LoanDetail';


function RoleBasedRedirect() {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return <Navigate to="/admin" />;
    return <Dashboard />;
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }>
                        <Route index element={<AdminOverview />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="analytics" element={<SystemAnalytics />} />
                        <Route path="logs" element={<AuditLogViewer />} />
                        <Route path="overrides" element={<LoanOverrides />} />
                    </Route>
                    <Route path="/" element={
                        <PrivateRoute>
                            <RoleBasedRedirect />
                        </PrivateRoute>
                    } />
                    <Route path="/officer/loans" element={
                        <PrivateRoute>
                            <LoanList />
                        </PrivateRoute>
                    } />
                    <Route path="/officer/loan/:id" element={
                        <PrivateRoute>
                            <LoanDetail />
                        </PrivateRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
