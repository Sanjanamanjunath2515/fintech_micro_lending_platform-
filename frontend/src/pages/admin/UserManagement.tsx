import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash, Edit, Lock, Unlock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog" // Assuming standard shadcn path or I can mock if missing
import { Label } from "@/components/ui/label"

// Minimal Dialog implementation if missing, but trying to use assumed imports
// If this fails, I'll stick to a simple conditional rendering for modals in a follow-up fix.

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'APPLICANT', status: 'ACTIVE' });

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users;
        if (search) {
            result = result.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
        }
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }
        setFilteredUsers(result);
    }, [users, search, roleFilter]);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/admin/users', { headers });
            setUsers(data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(`http://localhost:3000/api/admin/users/${editingUser.id}`, formData, { headers });
            } else {
                await axios.post('http://localhost:3000/api/admin/users', formData, { headers });
            }
            setIsDialogOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This user will be permanently deleted.')) return;
        try {
            await axios.delete(`http://localhost:3000/api/admin/users/${id}`, { headers });
            fetchUsers();
        } catch (error) { alert('Delete failed'); }
    };

    const toggleStatus = async (user: User) => {
        const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        if (!confirm(`Are you sure you want to ${newStatus === 'BLOCKED' ? 'BLOCK' : 'UNBLOCK'} this user?`)) return;
        try {
            await axios.put(`http://localhost:3000/api/admin/users/${user.id}`, { status: newStatus }, { headers });
            fetchUsers();
        } catch (error) { alert('Update failed'); }
    };

    const openCreate = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'APPLICANT', status: 'ACTIVE' });
        setIsDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role, status: user.status });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-white">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-4 w-4" /> Add User</Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8 bg-gray-900 border-gray-800 text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="h-10 px-3 rounded-md bg-gray-900 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="APPLICANT">Applicant</option>
                    <option value="LOAN_OFFICER">Loan Officer</option>
                    <option value="RISK_ANALYST">Risk Analyst</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Name / Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                                                    user.role === 'LOAN_OFFICER' ? 'bg-blue-500/20 text-blue-400' :
                                                        user.role === 'RISK_ANALYST' ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-gray-700 text-gray-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.status === 'BLOCKED' ?
                                                <span className="text-red-400 flex items-center gap-1"><Lock size={12} /> Blocked</span> :
                                                <span className="text-green-400 flex items-center gap-1"><CheckCircleIcon size={12} /> Active</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(user)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"><Edit size={16} /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => toggleStatus(user)} className={user.status === 'ACTIVE' ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10"}>
                                                {user.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash size={16} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit/Create Dialog - Custom implementation using fixed overlay if Radix Dialog isn't set up perfectly or just regular conditional */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-4">{editingUser ? 'Edit User' : 'Create User'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-400">Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="bg-gray-800 border-gray-700 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-400">Email</Label>
                                <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required type="email" className="bg-gray-800 border-gray-700 text-white" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">Role</Label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="APPLICANT">APPLICANT</option>
                                    <option value="LOAN_OFFICER">LOAN_OFFICER</option>
                                    <option value="RISK_ANALYST">RISK_ANALYST</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>

                            {!editingUser && (
                                <div className="space-y-2">
                                    <Label className="text-gray-400">Password</Label>
                                    <Input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required type="password" className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                            )}

                            {editingUser && (
                                <div className="space-y-2">
                                    <Label className="text-gray-400">New Password (leave blank to keep current)</Label>
                                    <Input value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} type="password" className="bg-gray-800 border-gray-700 text-white" />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white">Cancel</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">{editingUser ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckCircleIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    )
}
