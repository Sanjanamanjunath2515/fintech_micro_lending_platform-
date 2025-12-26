import { useEffect, useState } from 'react';
import axios from 'axios';
import { AnalyticsData, Loan, User, AuditLog, Role } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

export default function AdminDashboard({ role: _role }: { role: string }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit'>('overview');
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchOverviewData();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab]);

    const fetchOverviewData = async () => {
        try {
            const [statsRes, loansRes] = await Promise.all([
                axios.get('http://localhost:3000/api/analytics', { headers }),
                axios.get('http://localhost:3000/api/loans', { headers })
            ]);
            setStats(statsRes.data);
            setLoans(loansRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/admin/users', { headers });
            setUsers(data);
        } catch (e) { console.error(e); }
    };

    const fetchAuditLogs = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/admin/audit-logs', { headers });
            setAuditLogs(data);
        } catch (e) { console.error(e); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await axios.put(`http://localhost:3000/api/loans/${id}/status`, { status }, { headers });
            fetchOverviewData();
        } catch (e) { alert('Update failed'); }
    };

    const handleRoleUpdate = async (userId: string, newRole: Role) => {
        try {
            await axios.put(`http://localhost:3000/api/admin/users/${userId}/role`, { role: newRole }, { headers });
            fetchUsers();
            alert('Role updated successfully');
        } catch (e) { alert('Role update failed'); }
    };

    const chartData = stats ? [
        { name: 'Approved', value: stats.breakdown.approved },
        { name: 'Rejected', value: stats.breakdown.rejected },
        { name: 'Active', value: stats.breakdown.active },
        { name: 'Defaulted', value: stats.breakdown.defaulted },
    ] : [];

    return (
        <div className="space-y-6 text-white">
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-4 py-2 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'audit' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    Audit Logs
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight text-blue-400">System Overview</h2>
                    {stats && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="bg-gray-800 border-gray-700 text-white"><CardHeader><CardTitle className="text-sm font-medium text-gray-400">Total Loans</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalLoans}</div></CardContent></Card>
                            <Card className="bg-gray-800 border-gray-700 text-white"><CardHeader><CardTitle className="text-sm font-medium text-gray-400">Approval Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div></CardContent></Card>
                            <Card className="bg-gray-800 border-gray-700 text-white"><CardHeader><CardTitle className="text-sm font-medium text-gray-400">Avg Credit Score</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(stats.avgCreditScore)}</div></CardContent></Card>
                            <Card className="bg-gray-800 border-gray-700 text-white"><CardHeader><CardTitle className="text-sm font-medium text-gray-400">Outstanding</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${stats.totalOutstanding.toLocaleString()}</div></CardContent></Card>
                        </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-gray-800 border-gray-700 text-white">
                            <CardHeader><CardTitle>Loan Status Distribution</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                                        <Bar dataKey="value" fill="#60A5FA" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-1 overflow-auto h-[400px] bg-gray-800 border-gray-700 text-white">
                            <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {loans.map(loan => (
                                        <div key={loan.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                                            <div>
                                                <p className="font-medium">{loan.user?.name} (${loan.amount})</p>
                                                <p className="text-sm text-gray-400">{loan.status} - Score: {loan.user?.profile?.creditScore || 'N/A'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {loan.status === 'APPLIED' || loan.status === 'UNDER_REVIEW' ? (
                                                    <>
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => handleStatusUpdate(loan.id, 'APPROVED')}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(loan.id, 'REJECTED')}>Reject</Button>
                                                    </>
                                                ) : (
                                                    <span className={`text-sm font-bold px-2 py-1 rounded ${loan.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : loan.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-gray-600'}`}>
                                                        {loan.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                                            <td className="px-4 py-3 font-medium">{user.name}</td>
                                            <td className="px-4 py-3 text-gray-400">{user.email}</td>
                                            <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">{user.role}</span></td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="border border-gray-600 rounded p-1 text-xs bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user.id, e.target.value as Role)}
                                                >
                                                    <option value="APPLICANT">APPLICANT</option>
                                                    <option value="LOAN_OFFICER">LOAN_OFFICER</option>
                                                    <option value="RISK_ANALYST">RISK_ANALYST</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'audit' && (
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Action</th>
                                        <th className="px-4 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750">
                                            <td className="px-4 py-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-4 py-3">{log.user?.name} <span className="text-xs text-gray-500">({log.user?.role})</span></td>
                                            <td className="px-4 py-3 font-medium text-blue-400">{log.action}</td>
                                            <td className="px-4 py-3 text-gray-400">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
