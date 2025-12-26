import { useEffect, useState } from 'react';
import axios from 'axios';
import { AuditLog } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AuditLogViewer() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:3000/api/admin/audit-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(data);
        } catch (error) { console.error(error); }
    };

    const filteredLogs = logs.filter(log =>
        log.user?.name.toLowerCase().includes(filter.toLowerCase()) ||
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.details.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">System Audit Logs</h2>

            <div className="max-w-md">
                <Input
                    placeholder="Search logs..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-900 border-gray-800 text-white"
                />
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Actor</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{log.user?.name}</div>
                                            <div className="text-xs text-gray-500">{log.user?.role}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-blue-400">{log.action}</td>
                                        <td className="px-6 py-4 text-gray-300">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredLogs.length === 0 && <div className="p-4 text-center text-gray-500">No logs found</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
