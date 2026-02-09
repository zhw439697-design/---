"use client";

import { useState, useMemo } from "react";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { getWastePrediction, getMonthlyPrediction } from "@/lib/logic/batteryPrediction";
import { runCarbonTaxSensitivity } from "@/lib/logic/carbonModel";
import { Info, TrendingUp, DollarSign, Leaf, HelpCircle, Factory, Car, RefreshCw, Recycle, Target, ArrowRight, Calendar, BookOpen, Database, FileText, Building2, MapPin, Landmark, CheckCircle2, Bot, X, Loader2, Download, ChevronDown, Search, CheckSquare, Square, Filter, ScanSearch } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    // State
    const [carbonTax, setCarbonTax] = useState(50); // Default $50/ton
    const [optimizationGoal, setOptimizationGoal] = useState("comprehensive"); // cost, carbon, comprehensive


    // Modal State
    const [activeModal, setActiveModal] = useState<string | null>(null); // 'time', 'scenario', 'report'
    const [startYear, setStartYear] = useState(2020);
    const [endYear, setEndYear] = useState(2035);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportReady, setReportReady] = useState(false);

    // Derived Data
    // Derived Data
    const wasteData = useMemo(() => {
        return getWastePrediction(startYear, endYear, optimizationGoal);
    }, [startYear, endYear, optimizationGoal]);

    // Mock Carbon Composition Data
    const carbonData = [
        { name: "物流运输", value: 25, color: "#3b82f6" }, // Blue
        { name: "拆解处理", value: 35, color: "#f59e0b" }, // Amber
        { name: "再生制造", value: 30, color: "#10b981" }, // Emerald
        { name: "运营损耗", value: 10, color: "#64748b" }, // Slate
    ];

    // Dynamic KPIs based on 2030 projection
    const targetYear = wasteData.find((d: any) => d.year === 2030 || d.month === 'Dec'); // Safe check
    const totalVolume = targetYear?.totalVolume || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">智链绿能 —— 动力电池全生命周期管理平台</h1>
                    <p className="text-slate-400">聚焦动力电池全生命周期管理，助力循环经济与碳中和目标</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-mono border border-emerald-500/20 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Active
                    </span>
                </div>
            </header>

            {/* Lifecycle Flow Module */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Recycle size={120} className="text-emerald-500" />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-slate-800 via-emerald-900/50 to-slate-800 -z-10 -translate-y-1/2" />

                    <LifecycleStage
                        icon={<Factory />}
                        title="生产制造"
                        desc="碳足迹追踪 & 合规认证"
                        step={1}
                    />
                    <div className="hidden md:block text-slate-600"><ArrowRight size={20} /></div>
                    <LifecycleStage
                        icon={<Car />}
                        title="服役使用"
                        desc="SOH 实时监测 & 寿命预测"
                        step={2}
                    />
                    <div className="hidden md:block text-slate-600"><ArrowRight size={20} /></div>
                    <LifecycleStage
                        icon={<Recycle />}
                        title="梯次/回收"
                        desc="智能调度 & 路径优化"
                        step={3}
                    />
                    <div className="hidden md:block text-slate-600"><ArrowRight size={20} /></div>
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
                    title="年度电池退役量 (2024)"
                    value="450,000"
                    unit="吨"
                    icon={<Database className="text-blue-400" />}
                    trend="+30.4%"
                    description="2024年中国市场动力电池理论退役总量 (数据来源: 行业年度统计)"
                />
                <KpiCard
                    title="年度碳减排潜力"
                    value="202,500"
                    unit="tCO₂e"
                    icon={<Leaf className="text-emerald-400" />}
                    trend="+30.4%"
                    description="基于目前回收量测算的二氧化碳减排总潜力 (因子: 0.45 tCO₂e/t)"
                />
                <KpiCard
                    title="综合回收率"
                    value="82.5"
                    unit="%"
                    icon={<TrendingUp className="text-amber-400" />}
                    trend="+4.2%"
                    description="当前市场各类型电池材料综合回收效率 (2024年均值)"
                />
                <KpiCard
                    title="梯次利用占比"
                    value="35.2"
                    unit="%"
                    icon={<RefreshCw className="text-purple-400" />}
                    trend="+2.1%"
                    description="退役电池中用于储能等场景的梯次利用比例"
                />
            </div>

            {/* Key Concepts Glossary (Explanatory Section) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-400" />
                    关键概念说明
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                        <h4 className="text-emerald-400 font-medium mb-1">生命周期评价 (LCA)</h4>
                        <p className="text-slate-400 leading-relaxed">
                            一种评估产品从原材料获取、生产、使用到废弃回收全过程环境影响的标准化方法 (ISO 14040)。
                        </p>
                    </div>
                    <div>
                        <h4 className="text-blue-400 font-medium mb-1">回收路径优化</h4>
                        <p className="text-slate-400 leading-relaxed">
                            基于运筹学模型，在碳排放、成本和物流效率之间寻找最优平衡点的决策过程。
                        </p>
                    </div>
                    <div>
                        <h4 className="text-amber-400 font-medium mb-1">决策支持模型</h4>
                        <p className="text-slate-400 leading-relaxed">
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
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                            {['cost', 'carbon', 'comprehensive'].map((goal) => (
                                <button
                                    key={goal}
                                    onClick={() => setOptimizationGoal(goal)}
                                    className={`px-3 py-1 text-xs rounded-md transition-all capitalize ${optimizationGoal === goal
                                        ? (goal === 'comprehensive' ? "bg-emerald-600 text-white" : goal === 'carbon' ? "bg-emerald-600 text-white" : "bg-blue-600 text-white")
                                        : "text-slate-400 hover:text-slate-300"
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
                        <div className="flex justify-between items-end border-b border-slate-700/50 pb-2 mb-2">
                            <div className="text-xs text-slate-400 max-w-[70%]">
                                <p className="mb-1 leading-relaxed">
                                    基于 Logistic 增长模型预测的动力电池理论退役量。
                                    图中展示了 <span className="text-slate-300">2020-2025年实际值</span> 与 <span className="text-emerald-400">2026年起预测值</span> 的趋势，包含 LFP 与 NMC 两种技术路线。
                                </p>
                            </div>
                            <div className="text-xs font-mono text-slate-500">单位: 吨 (Tons)</div>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#e2e8f0', padding: '2px 0' }}
                                formatter={(value: number, name: string, item: any) => {
                                    const year = item.payload.year;
                                    const type = year <= 2025 ? "实际量" : "预测量";
                                    return [`${value.toLocaleString()} 吨`, type];
                                }}
                                labelFormatter={(label) => `${label}年`}
                                cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }}
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
                            <Info size={18} className="text-slate-500 hover:text-emerald-400 cursor-help transition-colors" />
                            {/* LCA Tooltip Methodology */}
                            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-50">
                                <h5 className="font-bold text-slate-100 mb-2 border-b border-slate-700 pb-2">计算口径说明</h5>
                                <ul className="space-y-1.5 list-disc pl-3 text-slate-400">
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
                            <div className="text-slate-400 text-sm mb-1">年度总碳排量</div>
                            <div className="text-4xl font-bold text-white mb-2">1,245<span className="text-sm font-normal text-slate-500 ml-1">t CO₂e</span></div>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 px-2 py-1 rounded-lg">
                                <TrendingUp size={14} />
                                <span>同比下降 8.5%</span>
                            </div>
                            <p className="mt-6 text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-4">
                                <span className="block mb-1 font-medium text-slate-400">分析结论:</span>
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
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number) => `${value}%`}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-slate-400 text-xs ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Application Scenarios & Decision Support (Part 4) */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-slate-100">应用场景与决策支持</h2>
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 p-8 text-center mt-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                <h3 className="text-lg font-bold text-slate-100 mb-3">研究意义</h3>
                <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed text-sm">
                    本平台旨在响应国家 <span className="text-emerald-400 font-medium">“双碳”</span> 战略，
                    通过大数据与 AI 算法构建动力电池全生命周期绿色循环体系。
                    解决退役电池 <span className="text-slate-300">预测难、回收难、监管难</span> 的行业痛点，
                    实现资源最大化利用与环境影响最小化，推动新能源产业可持续发展。
                </p>
                <div className="flex justify-center gap-4 mt-6">
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">#资源循环</span>
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">#碳中和</span>
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">#智能决策</span>
                </div>
            </div>

            {/* Footer / Data Source & Assumptions */}
            <footer className="mt-12 border-t border-slate-800 pt-8 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div>
                        © 2025 智链绿能 Platform. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors group relative">
                            <Database size={14} />
                            <span>Data Sources</span>
                            <span className="hidden group-hover:inline-block text-[10px] bg-slate-800 px-2 py-1 rounded ml-1 absolute -top-8 left-1/2 -translate-x-1/2 w-48 text-center border border-slate-700">
                                CAAM, Ecoinvent 3.8, GREET 2023, Academic Literature (Le et al., 2023)
                            </span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors group relative">
                            <BookOpen size={14} />
                            <span>Model Assumptions</span>
                            <span className="hidden group-hover:inline-block text-[10px] bg-slate-800 px-2 py-1 rounded ml-1 absolute -top-8 right-0 w-56 text-center border border-slate-700">
                                Growth rate: 15% CAGR; Recycling efficiency: 95%; Policy: Carbon Tax $50/t
                            </span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                            <FileText size={14} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            {activeModal === 'time' && (
                <Modal title="设定预测时间区间" onClose={() => setActiveModal(null)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">开始年份 (Start)</label>
                                <input
                                    type="number"
                                    value={startYear}
                                    onChange={(e) => setStartYear(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">结束年份 (End)</label>
                                <input
                                    type="number"
                                    value={endYear}
                                    onChange={(e) => setEndYear(Number(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            注: 预测模型基于 Logistic 增长曲线，建议区间 2020-2050 年。
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">取消</button>
                            <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">确认应用</button>
                        </div>
                    </div>
                </Modal>
            )}

            {activeModal === 'scenario' && (
                <Modal title="选择回收网络优化目标" onClose={() => setActiveModal(null)}>
                    <div className="space-y-3">
                        {[
                            { id: 'cost', label: '成本优先', desc: '最小化回收网络建设与运营总成本' },
                            { id: 'carbon', label: '碳排优先', desc: '最大化全生命周期碳减排量' },
                            { id: 'comprehensive', label: '综合最优', desc: '平衡经济效益与环境效益 (推荐)' }
                        ].map((opt) => (
                            <div
                                key={opt.id}
                                onClick={() => { setOptimizationGoal(opt.id); setActiveModal(null); }}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${optimizationGoal === opt.id
                                    ? "bg-emerald-500/10 border-emerald-500/50"
                                    : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`font-medium ${optimizationGoal === opt.id ? "text-emerald-400" : "text-slate-200"}`}>{opt.label}</span>
                                    {optimizationGoal === opt.id && <CheckCircle2 size={16} className="text-emerald-400" />}
                                </div>
                                <p className="text-xs text-slate-400">{opt.desc}</p>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            {activeModal === 'report' && (
                <Modal title="智能生成分析报告" onClose={() => setActiveModal(null)}>
                    <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
                        {isGeneratingReport ? (
                            <div className="space-y-4 animate-in fade-in">
                                <Loader2 size={40} className="text-emerald-400 animate-spin mx-auto" />
                                <div>
                                    <h4 className="text-slate-200 font-medium">AI 正在分析全站数据...</h4>
                                    <p className="text-slate-500 text-xs mt-1">整合生命周期评价、回收预测与减排模型</p>
                                </div>
                            </div>
                        ) : reportReady ? (
                            <div className="space-y-4 w-full text-left animate-in slide-in-from-bottom-4">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-300 leading-relaxed h-[300px] overflow-y-auto">
                                    <p className="font-bold text-emerald-400 mb-2">报告摘要:</p>
                                    <p className="mb-2">基于当前模型参数 ({startYear}-{endYear})，预计 2030 年将迎来动力电池退役高峰，峰值总量达 {(wasteData.find(d => d.year === 2030)?.totalVolume || 0).toLocaleString()} 吨。</p>
                                    <p className="mb-2">采用"{optimizationGoal === 'cost' ? '成本优先' : optimizationGoal === 'carbon' ? '碳排优先' : '综合最优'}"策略，建议在华东与华南地区优先布局梯次利用中心。</p>
                                    <p className="mb-2">碳减排潜力巨大，预计通过规范回收可减少约 {((wasteData.find(d => d.year === 2030)?.totalVolume || 0) * 0.45).toFixed(0)} 吨碳排放。</p>
                                    <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-700">
                                        * 此报告由 智链绿能 AI 引擎基于 dashboard 实时数据自动生成。
                                    </p>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition-all">
                                    <Download size={16} />
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
        <div className="flex flex-col items-center text-center gap-2 bg-slate-900 border border-slate-800 p-4 rounded-xl min-w-[140px] z-10 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all cursor-default group">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <h3 className="text-slate-200 font-medium text-sm group-hover:text-emerald-300 transition-colors">{title}</h3>
                <p className="text-slate-500 text-[10px] scale-90 mt-0.5 whitespace-nowrap">{desc}</p>
            </div>
        </div>
    )
}

function KpiCard({ title, value, unit, icon, trend, description }: any) {
    return (
        <div className="group bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm hover:border-emerald-500/20 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">{trend}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                {description && (
                    <div className="relative group/tooltip">
                        <HelpCircle size={14} className="text-slate-600 cursor-help hover:text-slate-400" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 shadow-xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all pointer-events-none z-50 text-left leading-relaxed">
                            {description}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{value}</span>
                <span className="text-sm text-slate-500">{unit}</span>
            </div>
        </div>
    );
}

function ChartCard({ title, children, action }: { title: string, children: React.ReactNode, action?: React.ReactNode }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200">{title}</h3>
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
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };

    const activeStyle = colorStyles[color as keyof typeof colorStyles];

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${activeStyle} border`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-slate-200 font-bold">{title}</h3>
                    <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
                </div>
            </div>
            <ul className="space-y-2">
                {features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle2 size={14} className={`shrink-0 opacity-70 ${color === 'blue' ? 'text-blue-400' : color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`} />
                        {feat}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function QuickActionButton({ icon, label, active = false, onClick, href }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, href?: string }) {
    const baseClass = `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-slate-100 font-bold">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
