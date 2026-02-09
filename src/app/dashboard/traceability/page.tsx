"use client";

import { useState } from "react";
import { Search, MapPin, Factory, Truck, BatteryCharging, Recycle, FileCheck, AlertCircle, Wrench, Warehouse, Ship, ChevronRight } from "lucide-react";
import { batteryDatabase, BatteryData, TimelineEvent } from "@/lib/mock/batteryData";

const iconMap: Record<string, any> = {
    Factory, Truck, BatteryCharging, Recycle, AlertCircle, Wrench, Warehouse, Ship
};

export default function TraceabilityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(batteryDatabase[0].id);
    const [loading, setLoading] = useState(false);

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
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-100 mb-2">全生命周期溯源 (Battery Passport)</h1>
                <p className="text-slate-400">基于真实产业链数据的电池全生命周期追踪与认证系统</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* Left Sidebar: Search & List */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                placeholder="搜索型号、厂商或ID..."
                            />
                        </form>
                    </div>

                    {/* Battery List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                            <h3 className="text-sm font-bold text-slate-300">电池目录 ({filteredBatteries.length})</h3>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar flex-1">
                            {filteredBatteries.map((battery) => (
                                <button
                                    key={battery.id}
                                    onClick={() => setSelectedId(battery.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border ${selectedId === battery.id
                                        ? "bg-emerald-500/10 border-emerald-500/50"
                                        : "bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${selectedId === battery.id ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                                            {battery.id.split('-')[0]}
                                        </span>
                                        <ChevronRight size={14} className={`transition-transform ${selectedId === battery.id ? "text-emerald-500 rotate-90" : "text-slate-600"}`} />
                                    </div>
                                    <h4 className={`font-medium text-sm truncate mb-0.5 ${selectedId === battery.id ? "text-emerald-100" : "text-slate-300"}`}>{battery.model}</h4>
                                    <p className="text-xs text-slate-500 truncate">{battery.manufacturer}</p>
                                </button>
                            ))}
                            {filteredBatteries.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    未找到匹配电池
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content: Details View */}
                <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-emerald-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
                        </div>
                    ) : activeBattery ? (
                        <div className="space-y-6">
                            {/* Key Info Card */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <BatteryCharging size={180} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                                    <FileCheck className="text-emerald-500" size={24} />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-100">{activeBattery.id}</h2>
                                                    <p className="text-emerald-400 text-sm font-medium">已认证 Battery Passport</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-slate-500 mb-1">当前状态</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(activeBattery.status)}`}>
                                                {activeBattery.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tech Specs Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/30 rounded-xl p-4 border border-slate-800/50">
                                        <SpecItem label="电池型号" value={activeBattery.model} />
                                        <SpecItem label="制造商" value={activeBattery.manufacturer} />
                                        <SpecItem label="化学体系" value={activeBattery.chemistry} highlight />
                                        <SpecItem label="额定容量" value={activeBattery.capacity} />
                                        <SpecItem label="能量密度" value={activeBattery.energyDensity} />
                                        <SpecItem label="循环寿命" value={activeBattery.cycleLife} />
                                        <SpecItem label="碳减排量" value={activeBattery.carbonSaved} color="emerald" />
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                                <h3 className="text-lg font-bold text-slate-100 mb-8 flex items-center gap-2">
                                    <Recycle className="text-emerald-500" size={20} />
                                    生命周期足迹
                                </h3>

                                <div className="space-y-8 relative pl-2">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[35px] top-2 bottom-10 w-0.5 bg-slate-800"></div>

                                    {activeBattery.timeline.map((item, index) => {
                                        const IconComponent = iconMap[item.iconType] || FileCheck;
                                        return (
                                            <div key={index} className="relative flex gap-6 group">
                                                {/* Icon Node */}
                                                <div className={`relative z-10 w-14 h-14 rounded-full border-4 border-slate-900 flex items-center justify-center shrink-0 ${item.color.replace('bg-', 'bg-').replace('500', '500/10').replace('600', '600/10')}`}>
                                                    <div className={`absolute inset-0 rounded-full opacity-20 ${item.color}`}></div>
                                                    <IconComponent size={20} className={item.color.replace('bg-', 'text-')} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pt-1 pb-8 border-b border-slate-800/50 last:border-0 group-last:pb-0">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                                                        <h4 className="text-base font-bold text-slate-200">{item.title}</h4>
                                                        <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                                                            {item.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                                                        {item.desc}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <MapPin size={12} />
                                                        {item.location}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function SpecItem({ label, value, highlight, color }: any) {
    const textColor = color === 'emerald' ? 'text-emerald-400' : highlight ? 'text-white' : 'text-slate-200';
    return (
        <div>
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className={`font-medium text-sm truncate ${textColor} border-l-2 ${color === 'emerald' ? 'border-emerald-500' : 'border-slate-700'} pl-2`}>
                {value}
            </div>
        </div>
    );
}

function getStatusStyle(status: string) {
    if (status.includes("在役") || status.includes("In Use")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (status.includes("梯次") || status.includes("Second")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (status.includes("回收") || status.includes("Recycling")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (status.includes("退役") || status.includes("Warning")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-slate-800 text-slate-400 border-slate-700";
}
