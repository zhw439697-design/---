"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Factory, Truck, BatteryCharging, Recycle, FileCheck, AlertCircle, Wrench, Warehouse, Ship, ChevronRight, Activity } from "lucide-react";
import { batteryDatabase, BatteryData, TimelineEvent } from "@/lib/mock/batteryData";

const iconMap: Record<string, any> = {
    Factory, Truck, BatteryCharging, Recycle, AlertCircle, Wrench, Warehouse, Ship
};

import { AuroraBackground } from "@/components/AuroraBackground";

export default function TraceabilityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(batteryDatabase[0].id);
    const [loading, setLoading] = useState(false);

    // Live IoT Telemetry State
    const [telemetry, setTelemetry] = useState({
        temp: 32.4,
        voltage: 384.2,
        current: 12.5,
        soc: 84
    });

    useEffect(() => {
        // Simulate live data fluctuations every 2 seconds
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                temp: parseFloat((prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1)),
                voltage: parseFloat((prev.voltage + (Math.random() - 0.5) * 2).toFixed(1)),
                current: parseFloat((prev.current + (Math.random() - 0.5) * 1.5).toFixed(1)),
                soc: prev.soc > 20 ? prev.soc - (Math.random() > 0.8 ? 1 : 0) : 84 // slowly drain or reset
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Filter batteries based on search
    const filteredBatteries = batteryDatabase.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeBattery = batteryDatabase.find(b => b.id === selectedId) || batteryDatabase[0];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate local search delay
        setTimeout(() => {
            setLoading(false);
            if (filteredBatteries.length > 0) {
                setSelectedId(filteredBatteries[0].id);
            }
        }, 500);
    };

    return (
        <AuroraBackground theme="light" backgroundImage="/battery-lifecycle.svg">
            <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 pt-8 relative z-10 px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">全生命周期溯源 (Battery Passport)</h1>
                        <p className="text-slate-500 font-medium">基于真实产业链数据的电池全生命周期追踪与认证系统</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                    {/* Left Sidebar: Search & List */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="bg-white/60 border border-slate-200/60 rounded-2xl p-4 backdrop-blur-xl shadow-sm">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm shadow-inner"
                                    placeholder="搜索型号、厂商或ID..."
                                />
                            </form>
                        </div>

                        {/* Battery List */}
                        <div className="bg-white/60 border border-slate-200/60 rounded-2xl flex-1 overflow-hidden flex flex-col backdrop-blur-xl shadow-md">
                            <div className="p-4 border-b border-slate-200/60 bg-white/40">
                                <h3 className="text-sm font-bold text-slate-700">电池目录 ({filteredBatteries.length})</h3>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1">
                                {filteredBatteries.map((battery) => (
                                    <button
                                        key={battery.id}
                                        onClick={() => setSelectedId(battery.id)}
                                        className={`w-full text-left p-3 rounded-xl transition-all border outline-none ${selectedId === battery.id
                                            ? "bg-emerald-50 border-emerald-300 shadow-sm ring-1 ring-emerald-500/20 translate-x-1"
                                            : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className={`text-xs font-mono px-2 py-0.5 rounded shadow-sm ${selectedId === battery.id ? "bg-emerald-100 text-emerald-700 font-bold border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                                                {battery.id.split('-')[0]}
                                            </span>
                                            <ChevronRight size={16} className={`transition-transform duration-300 ${selectedId === battery.id ? "text-emerald-500 rotate-90" : "text-slate-400"}`} />
                                        </div>
                                        <h4 className={`font-bold text-sm truncate mb-0.5 ${selectedId === battery.id ? "text-emerald-800" : "text-slate-700"}`}>{battery.model}</h4>
                                        <p className={`text-xs truncate ${selectedId === battery.id ? "text-emerald-600 font-medium" : "text-slate-500"}`}>{battery.manufacturer}</p>
                                    </button>
                                ))}
                                {filteredBatteries.length === 0 && (
                                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                        未找到匹配电池
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Details View */}
                    <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2 pb-10">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-emerald-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                            </div>
                        ) : activeBattery ? (
                            <div className="space-y-6">
                                {/* Key Info Card */}
                                <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-2xl shadow-xl shadow-slate-200/50">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <BatteryCharging size={180} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 pt-2">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                                                        <FileCheck className="text-emerald-600" size={28} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{activeBattery.id}</h2>
                                                        <p className="text-emerald-600 text-sm font-bold flex items-center gap-1 mt-0.5">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            已认证 Battery Passport
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-500 mb-1.5 font-medium">当前生命周期状态</span>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(activeBattery.status)}`}>
                                                    {activeBattery.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tech Specs & Telemetry Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                            {/* Left: Static Specs */}
                                            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl p-5 border border-slate-100 shadow-inner">
                                                <SpecItem label="电池型号" value={activeBattery.model} />
                                                <SpecItem label="化学体系" value={activeBattery.chemistry} highlight />
                                                <SpecItem label="额定容量" value={activeBattery.capacity} />
                                                <SpecItem label="能量密度" value={activeBattery.energyDensity} />

                                                {/* Dynamic Carbon Progress (Moved Here) */}
                                                <div className="col-span-2 pt-2 mt-2 border-t border-slate-200">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-xs font-bold text-emerald-800">全链减碳进度 (Carbon Savings)</span>
                                                        <span className="text-sm font-extrabold text-emerald-600">{activeBattery.carbonSaved}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000"
                                                            style={{ width: activeBattery.status.includes('梯次') ? '75%' : activeBattery.status.includes('回收') ? '100%' : '35%' }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-medium">
                                                        <span>设计潜力基准线</span>
                                                        <span>目标: 资源闭环 (100%)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Live Telemetry */}
                                            <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-700 shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                                                <h3 className="text-emerald-400 text-xs font-mono font-bold mb-4 flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        <Activity className="animate-pulse" size={14} /> LIVE TELEMETRY
                                                    </span>
                                                    <span className="text-slate-500 text-[10px]">ID: {activeBattery.id.split('-').pop()}</span>
                                                </h3>

                                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                                    <TelemetryItem label="Temp (C°)" value={telemetry.temp.toFixed(1)} color="text-amber-400" />
                                                    <TelemetryItem label="Voltage (V)" value={telemetry.voltage.toFixed(1)} color="text-blue-400" />
                                                    <TelemetryItem label="Current (A)" value={telemetry.current.toFixed(1)} color="text-purple-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-400 text-[10px] font-mono mb-1">SOC (%)</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-emerald-400 font-mono text-xl font-bold">{telemetry.soc}%</span>
                                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ width: `${telemetry.soc}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* IoT Status Bar */}
                                                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                                                    <span className="flex items-center gap-1.5 text-emerald-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                                        MQTT CONNECTED
                                                    </span>
                                                    <span className="text-slate-500">LATENCY: 42ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Lifecycle Timeline */}
                                <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-8 backdrop-blur-2xl shadow-xl shadow-slate-200/50">
                                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-700 mb-8 flex items-center gap-2">
                                        <Recycle className="text-emerald-500" size={24} />
                                        全生命周期数据足迹
                                    </h3>

                                    {/* ── Phase Progress Bar ── */}
                                    <LifecycleProgressBar status={activeBattery.status} />

                                    <div className="space-y-8 relative pl-2 mt-8">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[35px] top-2 bottom-10 w-0.5 bg-gradient-to-b from-emerald-200 via-slate-200 to-transparent"></div>

                                        {/* Timeline Events (Real + AI Predictions) */}
                                        {activeBattery.timeline.map((item, index) => {
                                            const IconComponent = iconMap[item.iconType] || FileCheck;
                                            const isPred = item.isPrediction;
                                            return (
                                                <div key={index} className={`relative flex gap-6 group ${isPred ? 'opacity-80' : ''}`}>
                                                    {/* Icon Node */}
                                                    <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isPred
                                                            ? 'border-2 border-dashed border-amber-400 bg-amber-50/80 shadow-amber-200/50 shadow-md'
                                                            : `border-[3px] border-white shadow-md ${item.color.replace('bg-', 'bg-').replace('500', '100').replace('600', '100')}`
                                                        }`}>
                                                        <IconComponent size={20} className={
                                                            isPred
                                                                ? 'text-amber-500'
                                                                : item.color.replace('bg-', 'text-').replace('500', '600').replace('600', '700')
                                                        } />
                                                    </div>

                                                    {/* Content */}
                                                    <div className={`flex-1 pt-1 pb-8 group-last:pb-2 ${isPred
                                                            ? 'border-b border-dashed border-amber-200'
                                                            : 'border-b border-slate-100 last:border-0'
                                                        }`}>
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`text-base font-bold ${isPred ? 'text-amber-700' : 'text-slate-800'}`}>{item.title}</h4>
                                                                {isPred && (
                                                                    <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded animate-pulse">
                                                                        AI PREDICTION
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded shadow-sm ${isPred
                                                                    ? 'text-amber-600 border border-amber-300 bg-amber-50'
                                                                    : 'text-slate-500 border border-slate-200 bg-slate-50'
                                                                }`}>
                                                                {item.date}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm leading-relaxed mb-3 font-medium ${isPred ? 'text-amber-600/80 italic' : 'text-slate-600'}`}>
                                                            {item.desc}
                                                        </p>
                                                        <div className={`flex items-center gap-2 text-xs font-bold inline-flex px-2 py-1 rounded border ${isPred
                                                                ? 'text-amber-600 bg-amber-50 border-amber-200'
                                                                : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                                            }`}>
                                                            <MapPin size={12} />
                                                            {item.location}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Smart Pending Future Lifecycle Events */}
                                        {getPendingStages(activeBattery).map((stage, i) => (
                                            <div key={`pending-${i}`} className="relative flex gap-6 group">
                                                <div className="relative z-10 w-14 h-14 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 bg-slate-50/50">
                                                    {stage.icon}
                                                </div>
                                                <div className="flex-1 pt-1 pb-8 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-base font-bold text-slate-400">{stage.title}</h4>
                                                        <span className="text-[10px] font-mono text-slate-400 border border-dashed border-slate-300 px-1.5 py-0.5 rounded">PENDING</span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm mt-1 leading-relaxed font-medium">{stage.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}

function SpecItem({ label, value, highlight, color }: any) {
    const textColor = color === 'emerald' ? 'text-emerald-600 font-bold' : highlight ? 'text-slate-800 font-bold' : 'text-slate-700';
    return (
        <div>
            <div className="text-xs text-slate-500 mb-1.5 font-medium">{label}</div>
            <div className={`font-semibold text-sm truncate ${textColor} border-l-[3px] ${color === 'emerald' ? 'border-emerald-500' : 'border-slate-300'} pl-2.5`}>
                {value}
            </div>
        </div>
    );
}

function getStatusStyle(status: string) {
    if (status.includes("在役") || status.includes("In Use")) return "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-500/10";
    if (status.includes("梯次") || status.includes("Second")) return "bg-blue-100 text-blue-700 border-blue-200 shadow-blue-500/10";
    if (status.includes("回收") || status.includes("Recycling")) return "bg-purple-100 text-purple-700 border-purple-200 shadow-purple-500/10";
    if (status.includes("退役") || status.includes("Warning")) return "bg-amber-100 text-amber-700 border-amber-200 shadow-amber-500/10";
    return "bg-slate-100 text-slate-600 border-slate-200";
}

function TelemetryItem({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-mono mb-1">{label}</span>
            <span className={`font-mono text-xl font-bold ${color}`}>{value}</span>
        </div>
    );
}

// --- Full Lifecycle Logic ---

// 5 canonical lifecycle stages
const LIFECYCLE_STAGES = [
    { key: 'raw', title: '原材料采炼', desc: '锂矿、钴矿、镍矿开采与前驱体合成。碳减排核算起点。', iconType: 'Warehouse' },
    { key: 'mfg', title: '电池制造', desc: '电芯生产、模组/CTP集成、BMS校准与质检。', iconType: 'Factory' },
    { key: 'use', title: '车辆运营', desc: '装车后循环充放电运营。SOH 持续监控中。', iconType: 'Truck' },
    { key: 'second', title: '梯次利用', desc: '退役后重组为储能/基站电源，延长使用寿命。', iconType: 'BatteryCharging' },
    { key: 'recycle', title: '拆解回收', desc: '湿法/火法工艺提炼钴镍锂锰，实现资源闭环。', iconType: 'Recycle' },
];

// Match existing timeline events to canonical stages
function getCompletedStageKeys(battery: BatteryData): Set<string> {
    const completed = new Set<string>();
    const titles = battery.timeline.map(t => t.title);

    // Match by title keywords
    if (titles.some(t => t.includes('原材料') || t.includes('采炼') || t.includes('矿'))) completed.add('raw');
    if (titles.some(t => t.includes('制造') || t.includes('生产') || t.includes('电芯') || t.includes('研发'))) completed.add('mfg');
    if (titles.some(t => t.includes('装配') || t.includes('集成') || t.includes('物流') || t.includes('海运') || t.includes('检测') || t.includes('保养'))) completed.add('use');
    if (titles.some(t => t.includes('梯次') || t.includes('储能'))) completed.add('second');
    if (titles.some(t => t.includes('回收') || t.includes('拆解') || t.includes('报废'))) completed.add('recycle');

    // Also infer from status
    if (battery.status.includes('在役') || battery.status.includes('In Use') || battery.status.includes('维护') || battery.status.includes('测试')) {
        completed.add('mfg'); completed.add('use');
    }
    if (battery.status.includes('梯次') || battery.status.includes('Second')) {
        completed.add('mfg'); completed.add('use'); completed.add('second');
    }
    if (battery.status.includes('回收') || battery.status.includes('Recycling')) {
        completed.add('mfg'); completed.add('use'); completed.add('recycle');
    }

    return completed;
}

function getPendingStages(battery: BatteryData) {
    const completed = getCompletedStageKeys(battery);
    const iconMap: Record<string, any> = { Factory, Truck, BatteryCharging, Recycle, Warehouse };

    return LIFECYCLE_STAGES
        .filter(stage => !completed.has(stage.key))
        .map(stage => {
            const Icon = iconMap[stage.iconType] || FileCheck;
            return {
                title: stage.title,
                desc: stage.desc,
                icon: <Icon size={20} className="text-slate-300" />
            };
        });
}

function LifecycleProgressBar({ status }: { status: string }) {
    // Determine current phase index
    let activeIndex = 2; // default: "use"
    if (status.includes('梯次') || status.includes('Second')) activeIndex = 3;
    if (status.includes('回收') || status.includes('Recycling')) activeIndex = 4;
    if (status.includes('退役') || status.includes('Warning')) activeIndex = 2;
    if (status.includes('测试') || status.includes('Testing') || status.includes('维护')) activeIndex = 2;

    const labels = ['采炼', '制造', '运营', '梯次', '回收'];

    return (
        <div className="flex items-center gap-0 w-full px-2">
            {labels.map((label, i) => {
                const isCompleted = i < activeIndex;
                const isActive = i === activeIndex;
                const isPending = i > activeIndex;
                return (
                    <div key={i} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' :
                                isActive ? 'bg-white border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/20 shadow-lg animate-pulse' :
                                    'bg-slate-100 border-slate-300 text-slate-400'
                                }`}>
                                {isCompleted ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] mt-1.5 font-bold ${isCompleted ? 'text-emerald-600' : isActive ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</span>
                        </div>
                        {i < labels.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'} ${isPending ? 'border-dashed border border-slate-300 h-0' : ''}`}></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

