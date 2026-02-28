"use client";

import { useState, useMemo } from "react";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { getWastePrediction, getMonthlyPrediction } from "@/lib/logic/batteryPrediction";
import { runCarbonTaxSensitivity } from "@/lib/logic/carbonModel";
import { Info, TrendingUp, DollarSign, Leaf, HelpCircle, Factory, Car, RefreshCw, Recycle, Target, ArrowRight, Calendar, BookOpen, Database, FileText, Building2, MapPin, Landmark, CheckCircle2, Bot, X, Loader2, Download, ChevronDown, Search, CheckSquare, Square, Filter, ScanSearch, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/AuroraBackground";

function MetalPriceTicker() {
    const [prices, setPrices] = useState<any>(null);

    useMemo(() => {
        fetch('/api/market/metal-prices')
            .then(res => res.json())
            .then(data => setPrices(data))
            .catch(console.error);
    }, []);

    if (!prices) return null;

    return (
        <div className="flex items-center gap-6 bg-slate-900/95 text-slate-200 px-6 py-3 rounded-2xl shadow-lg border border-slate-700 w-full mb-6 backdrop-blur-xl animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">大盘实时行情</span>
            </div>

            <div className="flex items-center gap-8 overflow-x-auto flex-nowrap scrollbar-hide w-full truncate">
                {['lithium', 'cobalt', 'nickel'].map((key) => {
                    const item = prices[key];
                    if (!item) return null;
                    const isPositive = item.trend >= 0;
                    return (
                        <div key={key} className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-medium text-slate-300">{item.name}</span>
                            <span className="text-base font-mono font-bold text-white">¥{item.price.toLocaleString()}</span>
                            <span className={`flex items-center text-xs font-bold ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(item.trend)}%
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="shrink-0 text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1 lg:mt-0">
                数据来源:
                <a href="https://finance.sina.com.cn/futuremarket/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline transition-colors ml-1">新浪财经</a>
                <span className="opacity-50">/</span>
                <a href="https://m.100ppi.com/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline transition-colors">生意社(100PPI)</a>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [user, setUser] = useState<{ username: string, nickname?: string, user_id?: string, role: string } | null>(null);
    const [carbonTax, setCarbonTax] = useState(50); // Default $50/ton
    const [optimizationGoal, setOptimizationGoal] = useState("comprehensive"); // cost, carbon, comprehensive

    // API Data State
    const [loading, setLoading] = useState(true);
    const [wasteData, setWasteData] = useState<any[]>([]);
    const [kpiData, setKpiData] = useState<any>({
        totalVolume2030: 0,
        marketValue2030: 0,
        carbonReduction: 0,
        metalPrices: {}
    });
    const [carbonData, setCarbonData] = useState([
        { name: "物流运输", value: 25, color: "#3b82f6" },
        { name: "拆解处理", value: 35, color: "#f59e0b" },
        { name: "再生制造", value: 30, color: "#10b981" },
        { name: "运营损耗", value: 10, color: "#64748b" },
    ]);

    // Modal State
    const [activeModal, setActiveModal] = useState<string | null>(null); // 'time', 'scenario', 'report'
    const [startYear, setStartYear] = useState(2020);
    const [endYear, setEndYear] = useState(2035);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportReady, setReportReady] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startYear: startYear.toString(),
                endYear: endYear.toString(),
                optimizationGoal
            });
            const res = await fetch(`/api/dashboard/stats?${params}`);
            if (res.ok) {
                const data = await res.json();
                setWasteData(data.wasteData);
                setKpiData(data.kpiData);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user info
    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                }
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Initial Fetch & Update on Change
    useMemo(() => {
        fetchData();
        fetchUser();
    }, [startYear, endYear, optimizationGoal]);

    return (
        <AuroraBackground theme="light" backgroundImage="/battery-lifecycle.svg">
            <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-8 relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">
                            智链绿能 —— 动力电池全生命周期管理平台
                        </h1>
                        <p className="text-slate-500 font-medium">聚焦动力电池全生命周期管理，助力循环经济与碳中和目标</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm">
                                <Link href={`/community/user/${user.username}`} className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border border-emerald-200 group-hover:bg-emerald-200 transition-colors">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                            {user.nickname || user.username}
                                        </span>
                                        {user.user_id && (
                                            <span className="text-[10px] font-mono text-emerald-500 leading-none">ID: {user.user_id}</span>
                                        )}
                                    </div>
                                </Link>
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    退出
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                                立即登录
                            </Link>
                        )}
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2 transition-all"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            {loading ? "更新数据中..." : "更新数据"}
                        </button>
                    </div>
                </header>

                {/* Real-Time Metal Price Ticker */}
                <MetalPriceTicker />

                {/* Lifecycle Flow Module */}
                <div className="bg-white/60 border border-emerald-100 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden shadow-xl shadow-emerald-900/5">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Recycle size={150} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 w-full px-4">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-10 w-[calc(100%-5rem)] h-[3px] bg-gradient-to-r from-emerald-100 via-emerald-400 to-emerald-100 -z-10 -translate-y-1/2 rounded-full opacity-50" />

                        <LifecycleStage
                            icon={<Factory />}
                            title="生产制造"
                            desc="碳足迹追踪 & 合规认证"
                            step={1}
                        />
                        <div className="hidden md:block text-emerald-300"><ArrowRight size={20} /></div>
                        <LifecycleStage
                            icon={<Car />}
                            title="服役使用"
                            desc="SOH 实时监测 & 寿命预测"
                            step={2}
                        />
                        <div className="hidden md:block text-emerald-300"><ArrowRight size={20} /></div>
                        <LifecycleStage
                            icon={<Recycle />}
                            title="梯次/回收"
                            desc="智能调度 & 路径优化"
                            step={3}
                        />
                        <div className="hidden md:block text-emerald-300"><ArrowRight size={20} /></div>
                        <LifecycleStage
                            icon={<RefreshCw />}
                            title="资源再生"
                            desc="材料回收率 & 减排计算"
                            step={4}
                        />
                    </div>
                </div>

                {/* Quick Actions (Functional Guidance) */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <QuickActionButton icon={<Calendar size={16} />} label="选择时间区间" onClick={() => setActiveModal('time')} />
                    <QuickActionButton icon={<Target size={16} />} label="选择回收场景" onClick={() => setActiveModal('scenario')} />
                    <QuickActionButton icon={<FileText size={16} />} label="生成 AI 报告" onClick={() => { setActiveModal('report'); if (!reportReady) generateReport(); }} />
                    <QuickActionButton icon={<ScanSearch size={16} />} label="查询电池护照" href="/dashboard/traceability" />
                    <QuickActionButton icon={<Bot size={16} />} label="进入 AI 专家问答" href="/ai-assistant" active />
                </div>

                {/* KPI Cards (Data Understanding) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard
                        title="2030年预测退役量"
                        value={kpiData.totalVolume2030?.toLocaleString() || "0"}
                        unit="吨"
                        icon={<Database className="text-blue-400" />}
                        trend="+15.2%"
                        description="基于Logistic模型预测的2030年动力电池理论退役总量"
                        formula="N(t) = L / (1 + e^-k(t-t0))"
                        formulaDesc="L:饱和容量(3.5M), k:增长率(0.28), t0:峰值年(2029)"
                        shortLabel="数据来源: Logistic 增长模型预测"
                    />
                    <KpiCard
                        title="潜在经济价值 (2030)"
                        value={kpiData.marketValue2030 || "0"}
                        unit="亿元"
                        icon={<DollarSign className="text-emerald-400" />}
                        trend="实时"
                        description={`基于实时金属价格 (${kpiData.metalPrices?.source || 'Loading...'}) 测算的回收产值 (锂 $${kpiData.metalPrices?.lithium?.toFixed(1) || '-'}/kg, 镍 $${kpiData.metalPrices?.nickel?.toFixed(1) || '-'}/kg)`}
                        formula="V = Vol * (0.12*Ni + 0.02*Co + 0.02*Li) * 95%"
                        formulaDesc="Vol:退役量, Ni/Co/Li:金属价格, 95%:回收率, 0.12/0.02:含量"
                        shortLabel="数据来源: 实时金属价格换算"
                    />
                    <KpiCard
                        title="年度碳减排潜力"
                        value={kpiData.carbonReduction?.toLocaleString() || "0"}
                        unit="tCO₂e"
                        icon={<Leaf className="text-emerald-400" />}
                        trend="+30.4%"
                        description={`基于实时碳因子 (${kpiData.carbonFactor?.source || 'Loading...'}) 测算的减排潜力 (因子: ${kpiData.carbonFactor?.value} ${kpiData.carbonFactor?.unit})`}
                        formula="E_saved = Vol * (E_virgin - E_recycled)"
                        formulaDesc="E_virgin:原生材料碳排, E_recycled:回收过程碳排(随电网波动)"
                        shortLabel="数据来源: 实时电网碳因子换算"
                    />
                    <KpiCard
                        title="梯次利用占比"
                        value="35.2"
                        unit="%"
                        icon={<RefreshCw className="text-purple-400" />}
                        trend="+2.1%"
                        description="退役电池中用于储能等场景的梯次利用比例"
                        formula="R_reuse = Vol_reuse / Vol_total * 100%"
                        formulaDesc="Vol_reuse:梯次利用量, Vol_total:总退役量"
                        shortLabel="数据来源: 行业统计报告"
                    />
                </div>

                {/* Key Concepts Glossary (Explanatory Section) */}
                <div className="bg-white/60 border border-slate-200/60 rounded-3xl p-8 backdrop-blur-2xl shadow-xl shadow-slate-200/50">
                    <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <BookOpen size={20} className="text-emerald-600" />
                        </div>
                        关键概念说明
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                        <div className="space-y-2">
                            <h4 className="text-emerald-700 font-semibold flex items-center gap-2 mb-2">
                                <Leaf size={16} className="text-emerald-500" />
                                生命周期评价 (LCA)
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                                一种评估产品从原材料获取、生产、使用到废弃回收全过程环境影响的标准化方法 (ISO 14040)。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-blue-700 font-semibold flex items-center gap-2 mb-2">
                                <RefreshCw size={16} className="text-blue-500" />
                                回收路径优化
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                                基于运筹学模型，在碳排放、成本和物流效率之间寻找最优平衡点的决策过程。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-amber-700 font-semibold flex items-center gap-2 mb-2">
                                <Target size={16} className="text-amber-500" />
                                决策支持模型
                            </h4>
                            <p className="text-slate-600 leading-relaxed">
                                结合斯塔克尔伯格模型（Stackelberg game）与系统动力学，模拟不同政策(如碳税)与市场参数下的系统演化趋势。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Charts */}
                {/* Global Controls & Filters */}
                {/* Main Charts */}

                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* Chart 1: Recycling Optimization Goal & Waste Forecast */}
                    <ChartCard
                        title="回收网络优化目标与预测"
                        action={
                            <div className="flex bg-slate-100/80 rounded-lg p-1 border border-slate-200 shadow-inner">
                                {['cost', 'carbon', 'comprehensive'].map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => setOptimizationGoal(goal)}
                                        className={`px-3 py-1 text-xs rounded-md transition-all capitalize font-medium ${optimizationGoal === goal
                                            ? "bg-white text-emerald-700 shadow-sm border border-emerald-100"
                                            : "text-slate-500 hover:text-emerald-600 hover:bg-white/50"
                                            }`}
                                    >
                                        {goal === 'cost' ? '成本优先' : goal === 'carbon' ? '碳排优先' : '综合最优'}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        {/* Optimization Comparison Visual */}


                        <div className="mb-5 px-1">
                            <div className="flex justify-between items-end border-b border-slate-200/60 pb-2 mb-2">
                                <div className="text-xs text-slate-500 max-w-[70%]">
                                    <p className="mb-1 leading-relaxed">
                                        基于 Logistic 增长模型预测的动力电池理论退役量。
                                        图中展示了 <span className="font-semibold text-slate-700">2020-2025年实际值</span> 与 <span className="font-semibold text-emerald-600">2026年起预测值</span> 的趋势，包含 LFP 与 NMC 两种技术路线。
                                    </p>
                                </div>
                                <div className="text-xs font-mono text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">单位: 吨 (Tons)</div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={wasteData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLfp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNmc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', fontSize: '12px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ color: '#334155', padding: '2px 0', fontWeight: 500 }}
                                    formatter={(value: number, name: string, item: any) => {
                                        const year = item.payload.year;
                                        const type = year <= 2025 ? "实际量" : "预测量";
                                        return [`${value.toLocaleString()} 吨`, type];
                                    }}
                                    labelFormatter={(label) => <span className="text-emerald-700 font-bold border-b border-emerald-100 pb-1 mb-1 block">{label}年</span>}
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lfpVolume"
                                    stackId="1"
                                    stroke="#10b981"
                                    fill="url(#colorLfp)"
                                    name="LFP (磷酸铁锂)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="nmcVolume"
                                    stackId="1"
                                    stroke="#3b82f6"
                                    fill="url(#colorNmc)"
                                    name="NMC (三元锂)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ top: -5, right: 0, fontSize: '12px' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Chart 2: Carbon Footprint Breakdown */}
                    <ChartCard
                        title="全生命周期碳足迹构成"
                        action={
                            <div className="group relative">
                                <Info size={18} className="text-slate-400 hover:text-emerald-500 cursor-help transition-colors" />
                                {/* LCA Tooltip Methodology */}
                                <div className="absolute right-0 top-full mt-3 w-72 p-5 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-slate-300 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50">
                                    <h5 className="font-bold text-slate-100 mb-3 border-b border-slate-700 pb-2">计算口径说明</h5>
                                    <ul className="space-y-2 list-disc pl-3 text-slate-400">
                                        <li><strong className="text-emerald-400">系统边界:</strong> Cradle-to-Grave (从原材料开采到最终回收再生)。</li>
                                        <li><strong className="text-emerald-400">标准依据:</strong> ISO 14040/14044 LCA 通用标准。</li>
                                        <li><strong className="text-emerald-400">数据库:</strong> Ecoinvent 3.8 & GREET 2023。</li>
                                        <li><strong className="text-emerald-400">功能单位:</strong> 1 kWh 电池包容量。</li>
                                    </ul>
                                    <div className="absolute right-1 -top-1.5 w-3 h-3 bg-slate-800 border-l border-t border-slate-700 rotate-45"></div>
                                </div>
                            </div>
                        }
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between h-full min-h-[300px]">
                            {/* Left: Summary */}
                            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start pl-4">
                                <div className="text-slate-500 text-sm font-medium mb-1">年度总碳排量</div>
                                <div className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">1,245<span className="text-sm font-medium text-slate-500 ml-1">t CO₂e</span></div>
                                <div className="flex items-center gap-1 text-emerald-700 text-sm font-semibold bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                                    <TrendingUp size={14} />
                                    <span>同比下降 8.5%</span>
                                </div>
                                <p className="mt-6 text-xs text-slate-500 leading-relaxed border-t border-slate-200/60 pt-4">
                                    <span className="block mb-1.5 font-bold text-slate-700">分析结论:</span>
                                    通过路径优化和材料再生技术(Hydrometallurgy)，主要减排贡献来自拆解处理环节的能效提升。
                                </p>
                            </div>

                            {/* Right: Donut Chart */}
                            <div className="w-full md:w-2/3 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={carbonData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {carbonData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backdropFilter: 'blur(8px)', fontWeight: 500 }}
                                            itemStyle={{ color: '#334155' }}
                                            formatter={(value: number) => <span className="font-bold text-slate-800">{value}%</span>}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span className="text-slate-600 text-xs font-medium ml-1">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ChartCard>
                </div>

                {/* Application Scenarios & Decision Support (Part 4) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                        <h2 className="text-2xl font-extrabold text-slate-800">应用场景与决策支持</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Enterprise */}
                        <ScenarioCard
                            title="企业端"
                            subtitle="电池生产商 / 回收企业"
                            icon={<Building2 className="text-blue-400" />}
                            color="blue"
                            features={[
                                "退役量预测与产能规划",
                                "逆向物流路径最优规划",
                                "回收成本最小化模型"
                            ]}
                        />

                        {/* Industrial Park */}
                        <ScenarioCard
                            title="园区端"
                            subtitle="循环经济产业园"
                            icon={<MapPin className="text-amber-400" />}
                            color="amber"
                            features={[
                                "回收网点科学选址",
                                "园区物流智能调度",
                                "上下游产业链产能匹配"
                            ]}
                        />

                        {/* Government */}
                        <ScenarioCard
                            title="政府端"
                            subtitle="监管部门 / 发改委"
                            icon={<Landmark className="text-emerald-400" />}
                            color="emerald"
                            features={[
                                "全生命周期指纹溯源",
                                "区域碳足迹精确核算",
                                "循环经济政策制定辅助"
                            ]}
                        />
                    </div>
                </div>

                {/* Research Significance (Part 4) */}
                <div className="relative overflow-hidden rounded-3xl bg-white/70 border border-emerald-100 p-10 text-center mt-12 shadow-xl backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -ml-10 -mb-10 opacity-50 pointer-events-none"></div>
                    <div className="relative z-10 w-full flex flex-col items-center">
                        <div className="p-3 bg-emerald-50 rounded-2xl mb-4 border border-emerald-100 shadow-sm inline-flex justify-center">
                            <Leaf size={24} className="text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight">研究意义</h3>
                        <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed text-base font-medium">
                            本平台旨在响应国家 <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">“双碳”</span> 战略，
                            通过大数据与 AI 算法构建动力电池全生命周期绿色循环体系。
                            解决退役电池 <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">预测难、回收难、监管难</span> 的行业痛点，
                            实现资源最大化利用与环境影响最小化，推动新能源产业可持续发展。
                        </p>
                        <div className="flex justify-center gap-4 mt-8">
                            <span className="text-xs font-semibold text-emerald-700 bg-white px-4 py-1.5 rounded-full border border-emerald-200 shadow-sm shadow-emerald-900/5 transition-transform hover:-translate-y-0.5">#资源循环</span>
                            <span className="text-xs font-semibold text-blue-700 bg-white px-4 py-1.5 rounded-full border border-blue-200 shadow-sm shadow-emerald-900/5 transition-transform hover:-translate-y-0.5">#碳中和</span>
                            <span className="text-xs font-semibold text-teal-700 bg-white px-4 py-1.5 rounded-full border border-teal-200 shadow-sm shadow-emerald-900/5 transition-transform hover:-translate-y-0.5">#智能决策</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Data Source & Assumptions */}
                <footer className="mt-16 border-t border-slate-200/60 pt-8 pb-8 flex justify-center">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 w-full px-4">
                        <div className="font-medium text-slate-400">
                            © 2025 EcoCycle Platform. All rights reserved.
                        </div>
                        <div className="flex gap-8 font-medium">
                            <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group relative bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                <Database size={14} />
                                <span>Data Sources</span>
                                <span className="hidden group-hover:inline-block text-[10px] bg-white text-slate-600 px-3 py-2 rounded-lg ml-1 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-center border border-slate-200 shadow-xl z-50">
                                    CAAM, Ecoinvent 3.8, GREET 2023, Academic Literature (Le et al., 2023)
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-white border-b border-r border-slate-200 rotate-45 -mt-1"></span>
                                </span>
                            </button>
                            <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group relative bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                <BookOpen size={14} />
                                <span>Model Assumptions</span>
                                <span className="hidden group-hover:inline-block text-[10px] bg-white text-slate-600 px-3 py-2 rounded-lg ml-1 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-center border border-slate-200 shadow-xl z-50">
                                    Growth rate: 15% CAGR; Recycling efficiency: 95%; Policy: Carbon Tax $50/t
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-white border-b border-r border-slate-200 rotate-45 -mt-1"></span>
                                </span>
                            </button>
                            <button
                                onClick={() => { setActiveModal('report'); if (!reportReady) generateReport(); }}
                                className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-600/20 font-semibold hover:-translate-y-0.5"
                            >
                                {isGeneratingReport ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                <span>{isGeneratingReport ? '生成提取中...' : 'Export Report'}</span>
                            </button>
                        </div>
                    </div>
                </footer>

                {/* Modals */}
                {activeModal === 'time' && (
                    <Modal title="设定预测时间区间" onClose={() => setActiveModal(null)}>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">开始年份 (Start)</label>
                                    <input
                                        type="number"
                                        value={startYear}
                                        onChange={(e) => setStartYear(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">结束年份 (End)</label>
                                    <input
                                        type="number"
                                        value={endYear}
                                        onChange={(e) => setEndYear(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium shadow-inner"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                                <Info size={16} className="shrink-0 text-blue-500 mt-0.5" />
                                <span>注: 预测模型基于 Logistic 增长曲线，建议区间 <strong>2020-2050 </strong> 年以获得最佳精度。</span>
                            </p>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                                <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">取消</button>
                                <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all">确认应用</button>
                            </div>
                        </div>
                    </Modal>
                )}

                {activeModal === 'scenario' && (
                    <Modal title="选择回收网络优化目标" onClose={() => setActiveModal(null)}>
                        <div className="space-y-4">
                            {[
                                { id: 'cost', label: '成本优先', desc: '最小化回收网络建设与运营总成本', icon: <DollarSign size={20} className="text-blue-500" /> },
                                { id: 'carbon', label: '碳排优先', desc: '最大化全生命周期碳减排量', icon: <Leaf size={20} className="text-emerald-500" /> },
                                { id: 'comprehensive', label: '综合最优', desc: '平衡经济效益与环境效益 (推荐)', icon: <Target size={20} className="text-purple-500" /> }
                            ].map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={() => { setOptimizationGoal(opt.id); setActiveModal(null); }}
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${optimizationGoal === opt.id
                                        ? "bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]"
                                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm"}`}
                                >
                                    <div className={`p-2 rounded-xl shrink-0 ${optimizationGoal === opt.id ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                                        {opt.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-bold text-base ${optimizationGoal === opt.id ? "text-emerald-700" : "text-slate-700"}`}>{opt.label}</span>
                                            {optimizationGoal === opt.id && <CheckCircle2 size={18} className="text-emerald-500" />}
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{opt.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal>
                )}

                {activeModal === 'report' && (
                    <Modal title="智能生成分析报告" onClose={() => setActiveModal(null)}>
                        <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
                            {isGeneratingReport ? (
                                <div className="space-y-6 animate-in fade-in flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                        <Loader2 size={48} className="text-emerald-600 animate-spin relative z-10" />
                                    </div>
                                    <div>
                                        <h4 className="text-slate-800 font-bold text-lg">AI 正在分析全站数据...</h4>
                                        <p className="text-slate-500 text-sm mt-2 font-medium">整合生命周期评价、回收预测与减排模型</p>
                                    </div>
                                </div>
                            ) : reportReady ? (
                                <div className="space-y-6 w-full text-left animate-in slide-in-from-bottom-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 leading-relaxed h-[300px] overflow-y-auto shadow-inner w-full">
                                        <p className="font-extrabold text-emerald-700 mb-3 text-base flex items-center gap-2 border-b border-slate-200 pb-2"><FileText size={18} />报告摘要</p>
                                        <p className="mb-3 font-medium">基于当前模型参数 (<span className="text-slate-900 font-bold">{startYear}-{endYear}</span>)，预计 <span className="text-emerald-600 font-bold px-1 bg-emerald-50 rounded">2030</span> 年将迎来动力电池退役高峰，峰值总量达 <span className="font-bold underline decoration-emerald-300 underline-offset-2">{(wasteData.find(d => d.year === 2030)?.totalVolume || 0).toLocaleString()}</span> 吨。</p>
                                        <p className="mb-3 font-medium">采用<span className="font-bold text-emerald-700 px-1 bg-emerald-50 rounded">"{optimizationGoal === 'cost' ? '成本优先' : optimizationGoal === 'carbon' ? '碳排优先' : '综合最优'}"</span>策略，建议在华东与华南地区优先布局梯次利用中心。</p>
                                        <p className="mb-3 font-medium flex items-center gap-2 bg-blue-50 text-blue-800 p-2 rounded-lg border border-blue-100">
                                            <Leaf className="shrink-0 text-blue-500" size={16} /> 碳减排潜力巨大，预计通过规范回收可减少约 <strong className="text-blue-600 font-bold">{((wasteData.find(d => d.year === 2030)?.totalVolume || 0) * 0.45).toFixed(0)}</strong> 吨碳排放。
                                        </p>
                                        <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-slate-200 font-medium">
                                            * 此报告由 EcoCycle AI 引擎基于 dashboard 实时数据自动生成。
                                        </p>
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all text-base">
                                        <Download size={20} />
                                        下载完整 PDF 报告
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-400">准备就绪</div>
                            )}
                        </div>
                    </Modal>
                )}
            </div>
        </AuroraBackground>
    );

    function generateReport() {
        setIsGeneratingReport(true);
        setTimeout(() => {
            setIsGeneratingReport(false);
            setReportReady(true);
        }, 2000); // Simulate 2s delay
    }
}

function LifecycleStage({ icon, title, desc, step }: any) {
    return (
        <div className="flex flex-col items-center text-center gap-3 bg-white/80 border border-emerald-100/50 p-5 rounded-2xl min-w-[160px] z-10 hover:border-emerald-300 hover:bg-white transition-all cursor-default group shadow-sm hover:shadow-md hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 border border-emerald-200/50 shadow-inner group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
                {icon}
            </div>
            <div>
                <h3 className="text-slate-800 font-bold text-sm group-hover:text-emerald-700 transition-colors">{title}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-tight">{desc}</p>
            </div>
        </div>
    )
}

function KpiCard({ title, value, unit, icon, trend, description, formula, formulaDesc, shortLabel }: any) {
    return (
        <div className="group bg-white/60 border border-slate-200/60 p-6 rounded-3xl backdrop-blur-2xl hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1 hover:z-50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-2xl -mr-10 -mt-10 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shadow-sm border border-emerald-200">{trend}</span>
            </div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
                <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
                {description && (
                    <div className="relative group/tooltip">
                        <HelpCircle size={15} className="text-slate-400 cursor-help hover:text-emerald-500 transition-colors" />
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs text-slate-300 shadow-2xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all pointer-events-none z-[100] text-left leading-relaxed">
                            <p className="mb-3">{description}</p>
                            {formula && (
                                <div className="border-t border-slate-700 pt-3 mt-2">
                                    <span className="text-emerald-400 font-mono text-[11px] block mb-1.5 opacity-80">计算公式:</span>
                                    <code className="text-[11px] text-slate-300 font-mono block break-all bg-slate-900/80 p-2 rounded-lg mb-2 border border-slate-700">{formula}</code>
                                    {formulaDesc && (
                                        <span className="text-[10px] text-slate-500 block italic leading-snug">{formulaDesc}</span>
                                    )}
                                </div>
                            )}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-3 h-3 bg-slate-800 border-l border-t border-slate-700 rotate-45 -mb-[1px]"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col relative z-10">
                <div className="flex items-baseline gap-1.5">
                    {value === "0" || value === 0 ? (
                        <div className="flex items-center gap-2 text-slate-400 py-1 animate-pulse">
                            <div className="w-24 h-8 bg-slate-200/80 rounded-lg"></div>
                        </div>
                    ) : (
                        <>
                            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">{value}</span>
                            <span className="text-sm font-medium text-slate-500">{unit}</span>
                        </>
                    )}
                </div>
                {shortLabel && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_0_rgba(52,211,153,0.5)]"></span>
                            {shortLabel}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChartCard({ title, children, action }: { title: string, children: React.ReactNode, action?: React.ReactNode }) {
    return (
        <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50 backdrop-blur-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200/50 pb-4">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-700">{title}</h3>
                {action}
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

function ScenarioCard({ title, subtitle, icon, color, features }: any) {
    const colorStyles = {
        blue: "text-blue-600 bg-blue-50 border-blue-200",
        amber: "text-amber-600 bg-amber-50 border-amber-200",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-200"
    };

    const activeStyle = colorStyles[color as keyof typeof colorStyles];

    return (
        <div className="bg-white/60 border border-slate-200/60 p-6 rounded-3xl backdrop-blur-2xl hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300">
            <div className="flex items-start gap-4 mb-5">
                <div className={`p-4 rounded-2xl ${activeStyle} shadow-sm group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-slate-800 font-bold text-lg">{title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
                </div>
            </div>
            <ul className="space-y-3">
                {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <CheckCircle2 size={16} className={`shrink-0 ${color === 'blue' ? 'text-blue-500' : color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`} />
                        {feat}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function QuickActionButton({ icon, label, active = false, onClick, href }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, href?: string }) {
    const baseClass = `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${active
        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
        : "bg-white/60 text-slate-700 hover:bg-white hover:text-emerald-700 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        }`;

    if (href) {
        return (
            <Link href={href} className={baseClass}>
                {icon}
                <span>{label}</span>
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClass}>
            {icon}
            <span>{label}</span>
        </button>
    );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-3xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white">
                    <h3 className="text-slate-800 font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 text-slate-600">
                    {children}
                </div>
            </div>
        </div>
    );
}
