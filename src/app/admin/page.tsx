'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Users, FileText, ShieldCheck, Activity } from 'lucide-react';

interface Stats {
    totalApplications: number;
    pendingApplications: number;
    approvedExperts: number;
    rejectedApplications: number;
    totalUsers: number;
    todayActivity: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (!res.ok) {
                    if (res.status === 403) throw new Error('Unauthorized');
                    throw new Error('Failed to fetch data');
                }
                const data = await res.json();
                setStats(data.stats);

            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p>正在加载仪表盘...</p>
            </div>
        );
    }

    if (error === 'Unauthorized') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 text-center max-w-md">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">访问被拒绝</h1>
                    <p>您没有权限访问此页面。</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
                <p className="text-slate-500 mt-1">欢迎回来，管理员。这里是系统概览。</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm mb-1">待审核申请</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {stats?.pendingApplications || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <FileText size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm mb-1">已认证专家</p>
                        <p className="text-3xl font-bold text-emerald-600">
                            {stats?.approvedExperts || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm mb-1">总用户数</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {stats?.totalUsers || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm mb-1">今日活跃</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {stats?.todayActivity || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Activity size={24} />
                    </div>
                </div>
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">快捷入口</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/admin/experts" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex flex-col items-center justify-center text-center gap-2 border border-slate-100">
                            <ShieldCheck className="text-purple-600" size={24} />
                            <span className="font-medium text-slate-700">处理专家审核</span>
                        </Link>
                        <div className="p-4 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-center gap-2 border border-slate-100 opacity-60 cursor-not-allowed">
                            <Users className="text-slate-400" size={24} />
                            <span className="font-medium text-slate-400">管理用户 (开发中)</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">系统公告</h2>
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
                        后台管理系统 1.0 版本已上线。目前支持专家认证审核功能。
                    </div>
                </div>
            </div>
        </div>
    );
}
