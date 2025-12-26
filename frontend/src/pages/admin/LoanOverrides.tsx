import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loan } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, AlertTriangle, Check, X } from 'lucide-react';

export default function LoanOverrides() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [overrideAction, setOverrideAction] = useState<'APPROVED' | 'REJECTED' | 'DEFAULTED' | null>(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        let result = loans;
        if (search) {
            result = result.filter(l => l.user?.name.toLowerCase().includes(search.toLowerCase()) || l.id.includes(search));
        }
        if (statusFilter !== 'ALL') {
            result = result.filter(l => l.status === statusFilter);
        }
        setFilteredLoans(result);
    }, [loans, search, statusFilter]);

    const fetchLoans = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/loans', { headers });
            setLoans(data);
        } catch (error) { console.error(error); }
    };

    const confirmOverride = (loan: Loan, action: 'APPROVED' | 'REJECTED' | 'DEFAULTED') => {
        setSelectedLoan(loan);
        setOverrideAction(action);
    };

    const handleOverride = async () => {
        if (!selectedLoan || !overrideAction) return;
        try {
            await axios.post(`http://localhost:3000/api/admin/override-loan/${selectedLoan.id}`, { status: overrideAction }, { headers });
            fetchLoans();
            setSelectedLoan(null);
            setOverrideAction(null);
        } catch (error) {
            alert('Override failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Loan Management & Overrides</h2>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by user or loan ID..."
                        className="pl-8 bg-gray-900 border-gray-800 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 px-3 rounded-md bg-gray-900 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="APPLIED">Applied</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DEFAULTED">Defaulted</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Overrides</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredLoans.map(loan => (
                                    <tr key={loan.id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{loan.user?.name}</div>
                                            <div className="text-xs text-gray-500">Score: {loan.user?.profile?.creditScore || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">${loan.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${loan.status === 'APPROVED' || loan.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                    loan.status === 'REJECTED' || loan.status === 'DEFAULTED' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-blue-500/20 text-blue-400'}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <Button size="sm" variant="ghost" className="text-green-400 hover:bg-green-500/10" onClick={() => confirmOverride(loan, 'APPROVED')}><Check size={16} /></Button>
                                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => confirmOverride(loan, 'REJECTED')}><X size={16} /></Button>
                                            <Button size="sm" variant="ghost" className="text-orange-400 hover:bg-orange-500/10" onClick={() => confirmOverride(loan, 'DEFAULTED')}><AlertTriangle size={16} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            {selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg w-full max-w-sm shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Override</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to manually change the status of this loan to <span className="font-bold text-white">{overrideAction}</span>?
                            This action will be logged.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-white">Cancel</Button>
                            <Button onClick={handleOverride} className="bg-blue-600 hover:bg-blue-500">Confirm Override</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
