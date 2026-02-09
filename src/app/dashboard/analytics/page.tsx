"use client";

import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ScatterChart, Scatter, ZAxis, ComposedChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from "recharts";
import { Download, Calendar, Filter, Zap, Activity, Recycle, Leaf, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Mock Data (In a real app, this would come from an API or the mockData.ts file)
const lcaData = [
    { stage: "原材料获取", co2: 450, color: "#94a3b8" },
    { stage: "电池制造", co2: 320, color: "#3b82f6" },
    { stage: "使用阶段", co2: 50, color: "#10b981" },
    { stage: "运输物流", co2: 80, color: "#f59e0b" },
    { stage: "回收处理", co2: -200, color: "#8b5cf6" },
];

const sohData = Array.from({ length: 20 }, (_, i) => ({
    cycle: (i + 1) * 100,
    lfp: 100 - (i * 0.8) - (Math.random() * 2),
    nmc: 100 - (i * 1.2) - (Math.random() * 2),
}));

// Historical Recycling Data (China Market 2019-2024)
const recyclingEfficiencyData = [
    { year: "2019", volume: 9.3, rate: 45 }, // unit: 10k tons
    { year: "2020", volume: 12.8, rate: 52 },
    { year: "2021", volume: 18.5, rate: 61 },
    { year: "2022", volume: 26.0, rate: 70 },
    { year: "2023", volume: 34.5, rate: 78 },
    { year: "2024", volume: 45.0, rate: 82 },
];

const recyclingRadarData = [
    { subject: '碳减排', A: 120, B: 110, fullMark: 150 },
    { subject: '经济效益', A: 98, B: 130, fullMark: 150 },
    { subject: '回收率', A: 86, B: 130, fullMark: 150 },
    { subject: '能耗', A: 99, B: 100, fullMark: 150 },
    { subject: '安全性', A: 85, B: 90, fullMark: 150 },
    { subject: '扩展性', A: 65, B: 85, fullMark: 150 },
];


export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState("lca"); // lca, soh, recycling

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">数据分析中心 (Analytics Center)</h1>
                    <p className="text-slate-400">深入挖掘电池全生命周期数据，支持多维度性能评估与决策优化</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors">
                        <Calendar size={14} />
                        <span>最近 12 个月</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors">
                        <Filter size={14} />
                        <span>筛选</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-lg shadow-emerald-900/20">
                        <Download size={14} />
                        <span>导出报告</span>
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-700">
                <TabButton
                    id="lca"
                    label="生命周期评价 (LCA)"
                    icon={<Leaf size={16} />}
                    active={activeTab === "lca"}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="soh"
                    label="电池健康度 (SOH)"
                    icon={<Activity size={16} />}
                    active={activeTab === "soh"}
                    onClick={setActiveTab}
                />
                <TabButton
                    id="recycling"
                    label="回收效益 (Recycling)"
                    icon={<Recycle size={16} />}
                    active={activeTab === "recycling"}
                    onClick={setActiveTab}
                />
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === "lca" && <LcaView />}
                {activeTab === "soh" && <SohView />}
                {activeTab === "recycling" && <RecyclingView />}
            </div>
        </div>
    );
}

function TabButton({ id, label, icon, active, onClick }: any) {
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${active
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

// --- View Components ---

function LcaView() {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="碳足迹总量" value="700" unit="kg CO₂e/kWh" sub="基于 Cradle-to-Grave 边界" icon={<Leaf className="text-emerald-400" />} />
                <StatCard title="制造阶段占比" value="45.7" unit="%" sub="主要来自正极材料生产" icon={<FactoryIcon className="text-blue-400" />} />
                <StatCard title="回收减排贡献" value="-28.5" unit="%" trend="+5.2%" sub="再生材料替代原生材料" icon={<ArrowDownRight className="text-emerald-400" />} isPositive />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Chart: Waterfall Breakdown */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">全生命周期碳排放结构分析</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lcaData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="co2" fill="#10b981" radius={[4, 4, 0, 0]}>
                                    {lcaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insight Panel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-amber-400" />
                        AI 洞察 (Insights)
                    </h3>
                    <div className="space-y-4 text-sm text-slate-400">
                        <p className="leading-relaxed">
                            <strong className="text-white block mb-1">关键热点:</strong>
                            正极材料生产（尤其是 NCM 前驱体）是碳足迹最大的单一环节，占制造阶段的 40% 以上。
                        </p>
                        <p className="leading-relaxed">
                            <strong className="text-emerald-400 block mb-1">优化建议:</strong>
                            建议提升工厂绿电比例至 60% 以上，可使制造阶段碳排降低约 150 kg CO₂e/kWh。
                        </p>
                        <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-emerald-300">绿电替代潜力</span>
                                <span className="text-xs font-bold text-emerald-400">High</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[85%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SohView() {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="平均 SOH" value="82.4" unit="%" sub="当前在役电池平均健康度" icon={<Activity className="text-blue-400" />} />
                <StatCard title="预测剩余寿命" value="850" unit="Cycles" sub="基于 LSTM 模型预测" icon={<Calendar className="text-purple-400" />} />
                <StatCard title="梯次利用潜力" value="High" unit="" sub="适合储能场景二次利用" icon={<Recycle className="text-emerald-400" />} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-6">容量衰减趋势对比 (LFP vs NMC)</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sohData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="cycle" stroke="#64748b" label={{ value: '循环次数 (Cycles)', position: 'insideBottom', offset: -5 }} />
                            <YAxis stroke="#64748b" domain={[70, 100]} label={{ value: 'SOH (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Legend />
                            <Line type="monotone" dataKey="lfp" name="LFP (磷酸铁锂)" stroke="#10b981" strokeWidth={3} dot={false} />
                            <Line type="monotone" dataKey="nmc" name="NMC (三元锂)" stroke="#3b82f6" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function RecyclingView() {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Composed Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">回收量与效率趋势</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={recyclingEfficiencyData}>
                                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                                <XAxis dataKey="year" stroke="#64748b" />
                                <YAxis yAxisId="left" stroke="#64748b" label={{ value: '回收量 (万吨)', angle: -90, position: 'insideLeft', offset: 10 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 100]} label={{ value: '综合回收率 (%)', angle: 90, position: 'insideRight', offset: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="volume" name="回收量 (万吨)" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="rate" name="综合回收率 (%)" stroke="#10b981" strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-6">不同工艺综合效益对比</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={recyclingRadarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="湿法回收 (Hydrometallurgy)" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Radar name="火法回收 (Pyrometallurgy)" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ title, value, unit, sub, icon, trend, isPositive }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="mb-2">
                <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{value}</span>
                    <span className="text-sm text-slate-500">{unit}</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 border-t border-slate-800 pt-3 mt-3">{sub}</p>
        </div>
    );
}

function FactoryIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M17 18h1" />
            <path d="M12 18h1" />
            <path d="M7 18h1" />
        </svg>
    )
}
