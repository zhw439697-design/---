'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuroraBackground } from '@/components/AuroraBackground';
import { ArrowLeft, Check, X, Loader2, ShieldCheck, Mail, Phone, Briefcase, User, Trash2 } from 'lucide-react';

interface Application {
    id: number;
    username: string;
    name: string;
    field: string;
    contact: string;
    reason: string;
    type: string;
    status: 'pending' | 'reviewing' | 'approved' | 'rejected';
    created_at: string;
}

export default function ExpertsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/expert-applications');
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Fetch error:', res.status, errorText);
                if (res.status === 403) throw new Error('Unauthorized');
                throw new Error(`Failed to fetch applications: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            console.log('Fetched data:', data);
            setApplications(data.applications || []);
        } catch (err: any) {
            console.error('Fetch error caught:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/expert-applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });

            if (res.ok) {
                // Refresh list
                await fetchApplications();
            } else {
                alert('操作失败');
            }
        } catch (err) {
            console.error(err);
            alert('操作失败');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这条申请记录吗？')) return;

        try {
            const res = await fetch('/api/admin/expert-applications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                await fetchApplications();
            } else {
                alert('删除失败');
            }
        } catch (err) {
            console.error(err);
            alert('删除出错');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p>正在加载专家数据...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center max-w-md">
                    <X className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">加载失败</h1>
                    <p>{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); fetchApplications(); }}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">专家审核</h1>
                    <p className="text-slate-500 mt-1">管理和审批专家认证申请</p>
                </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">申请人</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">认证类型/领域</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">联系方式</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">申请理由</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <tr key={app.id || Math.random()} className="hover:bg-purple-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                    {(app.name && app.name[0]) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{app.name || '未知用户'}</div>
                                                    <div className="text-xs text-slate-500">@{app.username || 'unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium w-fit border border-purple-100">
                                                    {app.type === 'individual' && '个人专家'}
                                                    {app.type === 'enterprise' && '企业认证'}
                                                    {app.type === 'organization' && '机构认证'}
                                                    {!['individual', 'enterprise', 'organization'].includes(app.type || '') && (app.type || '未分类')}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {app.field || '未填写'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {app.contact || '无联系方式'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 max-w-xs break-words" title={app.reason}>
                                                {app.reason || '无申请理由'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">待审核</span>}
                                            {app.status === 'reviewing' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">审核中</span>}
                                            {app.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">已通过</span>}
                                            {app.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">已驳回</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {app.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => updateStatus(app.id, 'approved')}
                                                        disabled={processingId === app.id}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                                        title="通过"
                                                    >
                                                        {processingId === app.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(app.id, 'rejected')}
                                                        disabled={processingId === app.id}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        title="驳回"
                                                    >
                                                        {processingId === app.id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="删除"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            {app.status !== 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs text-slate-400 mr-2">已处理</span>
                                                    <button
                                                        onClick={() => handleDelete(app.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="删除记录"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        暂无申请记录
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
