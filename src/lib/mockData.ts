
// Mock Data for Analytics Dashboard

// 1. LCA Analysis Data (Carbon Footprint Breakdown)
export const lcaData = [
    { stage: "原材料获取", co2: 450, color: "#94a3b8" }, // Slate 400
    { stage: "电池制造", co2: 320, color: "#3b82f6" },   // Blue 500
    { stage: "使用阶段", co2: 50, color: "#10b981" },    // Emerald 500 (Grid Mix)
    { stage: "运输物流", co2: 80, color: "#f59e0b" },    // Amber 500
    { stage: "回收处理", co2: -200, color: "#8b5cf6" },  // Violet 500 (Credit)
];

// 2. Battery SOH Distribution (Scatter Plot Data)
// Generate 50 random data points
export const sohDistributionData = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    cycles: Math.floor(Math.random() * (3000 - 500) + 500), // 500 - 3000 cycles
    soh: Math.random() * (100 - 70) + 70, // 70% - 100% SOH
    type: Math.random() > 0.5 ? "LFP" : "NMC",
}));

// 3. Recycling Efficiency (Composed Chart Data)
export const recyclingEfficiencyData = [
    { month: "Jan", volume: 120, rate: 88 },
    { month: "Feb", volume: 135, rate: 89 },
    { month: "Mar", volume: 150, rate: 90 },
    { month: "Apr", volume: 180, rate: 91 },
    { month: "May", volume: 210, rate: 92 },
    { month: "Jun", volume: 250, rate: 93 },
];

export const recyclingRadarData = [
    { subject: '碳减排', A: 120, B: 110, fullMark: 150 }, // A: Hydrometallurgy, B: Pyrometallurgy
    { subject: '经济效益', A: 98, B: 130, fullMark: 150 },
    { subject: '回收率', A: 86, B: 130, fullMark: 150 },
    { subject: '能耗', A: 99, B: 100, fullMark: 150 },
    { subject: '安全性', A: 85, B: 90, fullMark: 150 },
    { subject: '扩展性', A: 65, B: 85, fullMark: 150 },
];
