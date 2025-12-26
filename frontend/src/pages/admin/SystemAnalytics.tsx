import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SystemAnalytics() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:3000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (!stats) return;

        const headers = ["Metric", "Value"];
        const rows = [
            ["Total Loans", stats.totalLoans],
            ["Approval Rate", stats.approvalRate.toFixed(2) + "%"],
            ["Rejection Rate", stats.rejectionRate.toFixed(2) + "%"],
            ["Default Rate", stats.defaultRate.toFixed(2) + "%"],
            ["Avg Credit Score", Math.round(stats.avgCreditScore)],
            ["Total Outstanding", stats.totalOutstanding],
            ["Recovery Rate", stats.recoveryRate.toFixed(2) + "%"],
            ["Active Loans", stats.breakdown.active],
            ["Approved Loans", stats.breakdown.approved],
            ["Rejected Loans", stats.breakdown.rejected],
            ["Defaulted Loans", stats.breakdown.defaulted]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "system_analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">System Analytics</h2>
                <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-500">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader><CardTitle className="text-gray-400 text-sm">Approval Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">{stats.approvalRate.toFixed(1)}%</div>
                        <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${stats.approvalRate}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader><CardTitle className="text-gray-400 text-sm">Default Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-500">{stats.defaultRate.toFixed(1)}%</div>
                        <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${stats.defaultRate}%` }} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800 text-white">
                    <CardHeader><CardTitle className="text-gray-400 text-sm">Recovery Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">{stats.recoveryRate.toFixed(1)}%</div>
                        <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${stats.recoveryRate}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Approval', value: stats.approvalRate },
                            { name: 'Default', value: stats.defaultRate },
                            { name: 'Recovery', value: stats.recoveryRate }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                            <Bar dataKey="value" fill="#60A5FA" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
