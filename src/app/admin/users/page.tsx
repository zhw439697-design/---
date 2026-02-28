'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, User, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface UserData {
    id: number;
    user_id: string;
    username: string;
    nickname: string;
    role: string;
    avatar_url: string;
    email: string;
    created_at: string;
    verification_status?: string;
    verification_type?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) {
                if (res.status === 403) throw new Error('Unauthorized');
                throw new Error('Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (username: string) => {
        if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复，且会删除该用户的所有数据。`)) {
            return;
        }

        setDeleting(username);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            if (res.ok) {
                setUsers(users.filter(u => u.username !== username));
            } else {
                const text = await res.text();
                alert('删除失败: ' + text);
            }
        } catch (err) {
            console.error(err);
            alert('删除出错');
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.nickname && user.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.user_id && user.user_id.includes(searchTerm))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p>正在加载用户数据...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
                <p>加载失败: {error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 underline">重试</button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
                    <p className="text-slate-500 mt-1">查看和管理所有注册用户 (共 {users.length} 人)</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="搜索用户..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">用户</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">角色</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">联系方式</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">注册时间</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 leading-none mb-1">{user.nickname || user.username}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">@{user.username}</span>
                                                        {user.user_id && <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1 rounded uppercase">ID:{user.user_id}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                    <Shield size={12} className="mr-1" /> 管理员
                                                </span>
                                            )}
                                            {user.role === 'expert' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle size={12} className="mr-1" /> 认证专家
                                                </span>
                                            )}
                                            {user.role === 'user' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    普通用户
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {user.email || '未绑定邮箱'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                                                正常
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(user.username)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="删除用户"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        没有找到匹配的用户
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
