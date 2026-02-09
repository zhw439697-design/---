import { Factory, Truck, BatteryCharging, Recycle, AlertCircle, Wrench, Warehouse, Ship } from "lucide-react";

export interface TimelineEvent {
    date: string;
    title: string;
    desc: string;
    iconType: 'Factory' | 'Truck' | 'BatteryCharging' | 'Recycle' | 'AlertCircle' | 'Wrench' | 'Warehouse' | 'Ship';
    location: string;
    color: string;
}

export interface BatteryData {
    id: string;
    model: string;
    manufacturer: string;
    chemistry: string;
    capacity: string;
    energyDensity: string;
    cycleLife: string;
    status: string;
    carbonSaved: string;
    timeline: TimelineEvent[];
}

export const batteryDatabase: BatteryData[] = [
    // 1. CATL Qilin (High Performance NMC)
    {
        id: "CATL-QL-2023-A001",
        model: "CATL Qilin (麒麟电池) CTP 3.0",
        manufacturer: "宁德时代 (CATL)",
        chemistry: "NMC (三元锂)",
        capacity: "140 kWh",
        energyDensity: "255 Wh/kg",
        cycleLife: "> 2000 Cycles",
        status: "在役 (In Use)",
        carbonSaved: "0 kg",
        timeline: [
            {
                date: "2023-05-10",
                title: "电池制造",
                desc: "在宁德时代福建基地完成生产。采用 CTP 3.0 技术，体积利用率 72%。",
                iconType: "Factory",
                location: "福建, 宁德",
                color: "bg-blue-500"
            },
            {
                date: "2023-06-15",
                title: "车辆装配",
                desc: "集成于 Zeekr 009 (极氪 009) 用作动力电池包。",
                iconType: "Truck",
                location: "浙江, 宁波",
                color: "bg-purple-500"
            }
        ]
    },
    // 2. BYD Blade (Safe LFP)
    {
        id: "BYD-BL-2022-X888",
        model: "BYD Blade Battery (刀片电池)",
        manufacturer: "比亚迪 (BYD)",
        chemistry: "LFP (磷酸铁锂)",
        capacity: "60.4 kWh",
        energyDensity: "140 Wh/kg",
        cycleLife: "> 5000 Cycles",
        status: "梯次利用 (Second-life)",
        carbonSaved: "320 kg",
        timeline: [
            {
                date: "2020-08-20",
                title: "电池制造",
                desc: "重庆弗迪电池工厂生产。通过针刺测试，具备极高安全性。",
                iconType: "Factory",
                location: "重庆, 璧山",
                color: "bg-blue-500"
            },
            {
                date: "2020-09-15",
                title: "车辆装配",
                desc: "装配于 BYD Han EV (比亚迪汉)。",
                iconType: "Truck",
                location: "广东, 深圳",
                color: "bg-purple-500"
            },
            {
                date: "2028-11-10",
                title: "退役检测",
                desc: "SOH 78%。退役主要原因：达到日历寿命，容量轻微衰减。",
                iconType: "AlertCircle",
                location: "北京, 维修中心",
                color: "bg-amber-500"
            },
            {
                date: "2029-01-05",
                title: "梯次利用入库",
                desc: "重组为通信基站备用电源。",
                iconType: "BatteryCharging",
                location: "河北, 廊坊",
                color: "bg-emerald-500"
            }
        ]
    },
    // 3. Tesla 4680 (Innovative Cylindrical)
    {
        id: "TSLA-4680-2024-Y2K",
        model: "Tesla 4680 Cell Pack",
        manufacturer: "Tesla Inc.",
        chemistry: "NCA (镍钴铝)",
        capacity: "90 kWh",
        energyDensity: "244 Wh/kg",
        cycleLife: "> 1500 Cycles",
        status: "维护中 (Maintenance)",
        carbonSaved: "50 kg",
        timeline: [
            {
                date: "2024-01-10",
                title: "电芯生产",
                desc: "Tesla Giga Texas 生产。采用干法电极工艺。",
                iconType: "Factory",
                location: "Austin, TX (USA)",
                color: "bg-blue-500"
            },
            {
                date: "2024-02-01",
                title: "海运物流",
                desc: "出口至中国上海超级工厂。",
                iconType: "Ship",
                location: "Pacific Ocean",
                color: "bg-cyan-500"
            },
            {
                date: "2024-02-28",
                title: "车辆集成",
                desc: "装配于 Model Y Performance。",
                iconType: "Truck",
                location: "上海, 临港",
                color: "bg-purple-500"
            },
            {
                date: "2025-06-15",
                title: "健康度检测",
                desc: "例行保养，SOH 98%，电芯一致性良好。",
                iconType: "Wrench",
                location: "上海, 特斯拉中心",
                color: "bg-blue-400"
            }
        ]
    },
    // 4. LG Energy Solution (High Energy Pouch)
    {
        id: "LGES-E78-2021-M3LR",
        model: "LG Chem E78 (NCM 811)",
        manufacturer: "LG Energy Solution",
        chemistry: "NCM 811",
        capacity: "78.4 kWh",
        energyDensity: "265 Wh/kg",
        cycleLife: "> 1000 Cycles",
        status: "回收处理 (Recycling)",
        carbonSaved: "1,200 kg",
        timeline: [
            {
                date: "2021-03-12",
                title: "电池制造",
                desc: "南京 LG 化学工厂生产。软包电池技术。",
                iconType: "Factory",
                location: "江苏, 南京",
                color: "bg-blue-500"
            },
            {
                date: "2021-04-05",
                title: "车辆装配",
                desc: "供应给 Tesla Model 3 Long Range (中国版)。",
                iconType: "Truck",
                location: "上海",
                color: "bg-purple-500"
            },
            {
                date: "2026-08-20",
                title: "交通事故报废",
                desc: "车辆发生碰撞，电池包外壳受损，判定全损报废。",
                iconType: "AlertCircle",
                location: "江苏, 苏州",
                color: "bg-red-500"
            },
            {
                date: "2026-09-01",
                title: "拆解回收",
                desc: "进入智链绿能回收中心。提炼镍钴锰金属。",
                iconType: "Recycle",
                location: "浙江, 衢州",
                color: "bg-emerald-600"
            }
        ]
    },
    // 5. CALB (中创新航) - Mid market
    {
        id: "CALB-LFP-2023-GAC",
        model: "CALB One-Stop Battery",
        manufacturer: "中创新航 (CALB)",
        chemistry: "LFP",
        capacity: "58 kWh",
        energyDensity: "155 Wh/kg",
        cycleLife: "> 4000 Cycles",
        status: "在役 (In Use)",
        carbonSaved: "0 kg",
        timeline: [
            {
                date: "2023-09-01",
                title: "电池制造",
                desc: "常州基地生产，采用极简结构设计。",
                iconType: "Factory",
                location: "江苏, 常州",
                color: "bg-blue-500"
            },
            {
                date: "2023-09-20",
                title: "车辆装配",
                desc: "装配于 GAC AION Y (广汽埃安)。",
                iconType: "Truck",
                location: "广东, 广州",
                color: "bg-purple-500"
            }
        ]
    },
    // 6. Gotion High-Tech (VW Partner)
    {
        id: "GOTION-JTM-VW-007",
        model: "Gotion JTM (Jelly Roll to Module)",
        manufacturer: "国轩高科",
        chemistry: "LFP + Manganese",
        capacity: "50 kWh",
        energyDensity: "160 Wh/kg",
        cycleLife: "> 3000 Cycles",
        status: "在役 (In Use)",
        carbonSaved: "0 kg",
        timeline: [{ date: "2023-11-15", title: "生产", desc: "合肥工厂", iconType: "Factory", location: "安徽, 合肥", color: "bg-blue-500" }]
    },
    // 7. Svolt (Honeycomb Energy) - Cobalt Free
    {
        id: "SVOLT-NMX-2024-L6",
        model: "Svolt NMX (无钴电池)",
        manufacturer: "蜂巢能源 (Svolt)",
        chemistry: "NMx (无钴)",
        capacity: "82 kWh",
        energyDensity: "240 Wh/kg",
        cycleLife: "> 2500 Cycles",
        status: "测试中 (Testing)",
        carbonSaved: "10 kg",
        timeline: [{ date: "2024-03-01", title: "研发试制", desc: "下一代无钴层状材料电池。", iconType: "Factory", location: "江苏, 常州", color: "bg-indigo-500" }]
    },
    // 8. Panasonic (Classic Tesla Partner)
    {
        id: "PANA-2170-2020-M3",
        model: "Panasonic 2170 NCA",
        manufacturer: "Panasonic",
        chemistry: "NCA",
        capacity: "75 kWh",
        energyDensity: "260 Wh/kg",
        cycleLife: "1500 Cycles",
        status: "梯次利用 (Second-life)",
        carbonSaved: "450 kg",
        timeline: [
            { date: "2019-05-20", title: "生产", desc: "Gigafactory 1 Nevada", iconType: "Factory", location: "USA", color: "bg-blue-500" },
            { date: "2024-06-10", title: "退役", desc: "SOH 75%", iconType: "AlertCircle", location: "USA", color: "bg-amber-500" }
        ]
    }
];
