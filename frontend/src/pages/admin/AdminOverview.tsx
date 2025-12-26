import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminOverview() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:3000/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
            } catch (error: any) {
                console.error("Failed to fetch stats", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-white">Loading dashboard...</div>;
    if (!stats) return <div className="text-white">Failed to load data.</div>;

    const barData = [
        { name: 'Approved', value: stats.breakdown.approved },
        { name: 'Rejected', value: stats.breakdown.rejected },
    ];

    const pieData = [
        { name: 'Active', value: stats.breakdown.active },
        { name: 'Defaulted', value: stats.breakdown.defaulted },
        { name: 'Closed', value: stats.totalLoans - stats.breakdown.active - stats.breakdown.defaulted - stats.breakdown.approved - stats.breakdown.rejected }, // Approximate
    ].filter(d => d.value > 0);

    const COLORS = ['#10B981', '#EF4444', '#6B7280', '#3B82F6'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Loans</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLoans}</div>
                        <p className="text-xs text-gray-400">Total applications processed</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Approval Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
                        <p className="text-xs text-gray-400">Of all applications</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Default Rate</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.defaultRate.toFixed(1)}%</div>
                        <p className="text-xs text-gray-400">Loans in default</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Avg Credit Score</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.avgCreditScore)}</div>
                        <p className="text-xs text-gray-400">Across all users</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle>Approvals vs Rejections</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle>Portfolio Health</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-400">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
