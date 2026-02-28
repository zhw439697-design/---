import { Factory, Truck, BatteryCharging, Recycle, AlertCircle, Wrench, Warehouse, Ship } from "lucide-react";

export interface TimelineEvent {
    date: string;
    title: string;
    desc: string;
    iconType: 'Factory' | 'Truck' | 'BatteryCharging' | 'Recycle' | 'AlertCircle' | 'Wrench' | 'Warehouse' | 'Ship';
    location: string;
    color: string;
    isPrediction?: boolean; // AI prediction flag
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
    // 1. CATL Qilin (High Performance NMC) — 在役
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
                date: "2023-03-15",
                title: "原材料供应",
                desc: "锂辉石来自澳大利亚 Greenbushes 矿区 (天齐锂业供应)，前驱体由湖南邦普循环提供。碳足迹核算起点。",
                iconType: "Warehouse",
                location: "澳大利亚 / 湖南, 长沙",
                color: "bg-slate-500"
            },
            {
                date: "2023-05-10",
                title: "电池制造",
                desc: "在宁德时代福建基地完成生产。采用 CTP 3.0 技术，全球首创电芯大面冷却技术，体积利用率达到72%。",
                iconType: "Factory",
                location: "福建, 宁德",
                color: "bg-blue-500"
            },
            {
                date: "2023-06-15",
                title: "车辆装配",
                desc: "集成于 Zeekr 009 (极氪 009) 用作动力电池包，实现超 1000km 续航。通过 CATL WeLion 质量追溯系统上链。",
                iconType: "Truck",
                location: "浙江, 宁波",
                color: "bg-purple-500"
            },
            {
                date: "2025-08-20",
                title: "例行健康检测",
                desc: "首次年检: SOH 96.3%，电芯一致性优秀，温控系统运行良好。总行驶里程 4.2 万公里。",
                iconType: "Wrench",
                location: "浙江, 杭州",
                color: "bg-blue-400"
            },
            // AI Predictions
            {
                date: "2031-06 (预测)",
                title: "🔮 AI 预测: 退役节点",
                desc: "基于当前 SOH 衰减模型 (NMC 线性外推)，预测该电池将在约 2031 年 SOH 降至 80% 退役阈值。预计累计循环 ~1800 次。",
                iconType: "AlertCircle",
                location: "AI 模型推演",
                color: "bg-amber-500",
                isPrediction: true
            },
            {
                date: "2031-09 (预测)",
                title: "🔮 AI 预测: 梯次利用",
                desc: "基于麒麟电池的高能量密度和优秀温控，预计退役后可重组为大型工商业储能系统，剩余价值率约 45%。",
                iconType: "BatteryCharging",
                location: "AI 模型推演",
                color: "bg-emerald-500",
                isPrediction: true
            }
        ]
    },
    // 2. BYD Blade (Safe LFP) — 已进入梯次利用
    {
        id: "BYD-BL-2020-X888",
        model: "BYD Blade Battery (刀片电池)",
        manufacturer: "比亚迪 (BYD)",
        chemistry: "LFP (磷酸铁锂)",
        capacity: "60.4 kWh",
        energyDensity: "150 Wh/kg",
        cycleLife: "> 4500 Cycles",
        status: "梯次利用 (Second-life)",
        carbonSaved: "320 kg",
        timeline: [
            {
                date: "2020-06-10",
                title: "原材料供应",
                desc: "磷酸铁锂正极材料由德方纳米供应。国内矿源可控，供应链碳足迹较 NMC 低约 40%。",
                iconType: "Warehouse",
                location: "云南, 曲靖",
                color: "bg-slate-500"
            },
            {
                date: "2020-08-20",
                title: "电池制造",
                desc: "重庆弗迪电池工厂生产。通过严苛的针刺测试，体积能量密度达 450 Wh/L。",
                iconType: "Factory",
                location: "重庆, 璧山",
                color: "bg-blue-500"
            },
            {
                date: "2020-09-15",
                title: "车辆装配",
                desc: "装配于 BYD Han EV (比亚迪汉)，NEDC 续航 605km。",
                iconType: "Truck",
                location: "广东, 深圳",
                color: "bg-purple-500"
            },
            {
                date: "2024-11-10",
                title: "退役检测",
                desc: "SOH 78%。达到日历寿命退役阈值，总行驶里程超 28 万公里，容量正常衰减。经第三方检测机构 (中汽研) 出具检测报告。",
                iconType: "AlertCircle",
                location: "北京, 中汽研检测中心",
                color: "bg-amber-500"
            },
            {
                date: "2025-01-05",
                title: "梯次利用入库",
                desc: "经筛选重组后接入中国铁塔通信基站备用电源系统。剩余容量 47 kWh，预计可继续服役 3-5 年。",
                iconType: "BatteryCharging",
                location: "河北, 廊坊",
                color: "bg-emerald-500"
            },
            // AI Prediction
            {
                date: "2028-12 (预测)",
                title: "🔮 AI 预测: 最终回收",
                desc: "基于 LFP 梯次利用后的衰减速率，预测 SOH 降至 30% 后将进入材料回收阶段。预计可回收磷酸铁锂正极粉 38kg，碳酸锂 5.2kg。",
                iconType: "Recycle",
                location: "AI 模型推演",
                color: "bg-emerald-600",
                isPrediction: true
            }
        ]
    },
    // 3. Tesla 4680 (Innovative Cylindrical) — 维护中
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
                desc: "Tesla Giga Texas 生产。采用干法电极工艺 (Dry Electrode Process)，能耗降低约 10%。",
                iconType: "Factory",
                location: "Austin, TX (USA)",
                color: "bg-blue-500"
            },
            {
                date: "2024-02-01",
                title: "海运物流",
                desc: "经太平洋航线出口至中国上海超级工厂。运输全程温控监测，符合 UN38.3 危险品运输标准。",
                iconType: "Ship",
                location: "Pacific Ocean",
                color: "bg-cyan-500"
            },
            {
                date: "2024-02-28",
                title: "车辆集成",
                desc: "装配于 Model Y Performance (中国制造版)。结构电池设计，参与车身强度。",
                iconType: "Truck",
                location: "上海, 临港",
                color: "bg-purple-500"
            },
            {
                date: "2025-06-15",
                title: "健康度检测",
                desc: "例行保养，SOH 98%，电芯一致性良好。总行驶里程 2.1 万公里。当前状态: 维护保养中。",
                iconType: "Wrench",
                location: "上海, 特斯拉服务中心",
                color: "bg-blue-400"
            },
            // AI Prediction
            {
                date: "2032-03 (预测)",
                title: "🔮 AI 预测: 退役节点",
                desc: "基于 NCA 4680 大圆柱电芯的衰减特性和干法电极的长循环优势，预测退役时间约 2032 年。预计剩余价值可用于家庭储能 (Powerwall) 场景。",
                iconType: "AlertCircle",
                location: "AI 模型推演",
                color: "bg-amber-500",
                isPrediction: true
            }
        ]
    },
    // 4. LG Energy Solution (High Energy Pouch) — 已完成回收
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
                desc: "南京 LG 化学工厂生产。NCM 811 高镍软包电池技术，能量密度行业领先。",
                iconType: "Factory",
                location: "江苏, 南京",
                color: "bg-blue-500"
            },
            {
                date: "2021-04-05",
                title: "车辆装配",
                desc: "供应给 Tesla Model 3 Long Range (中国版)。",
                iconType: "Truck",
                location: "上海, 临港",
                color: "bg-purple-500"
            },
            {
                date: "2024-08-20",
                title: "交通事故报废",
                desc: "车辆发生碰撞，电池包外壳受损，经保险公司定损后判定全损报废。电池模组经安全放电处理后移交回收渠道。",
                iconType: "AlertCircle",
                location: "江苏, 苏州",
                color: "bg-red-500"
            },
            {
                date: "2024-10-15",
                title: "拆解回收",
                desc: "进入格林美 (GEM) 回收工厂，采用湿法冶金工艺提炼镍钴锰金属。镍回收率 98.5%，钴回收率 97.8%，锂回收率 91.2%。",
                iconType: "Recycle",
                location: "湖北, 荆门",
                color: "bg-emerald-600"
            }
        ]
    },
    // 5. CALB (中创新航) — 在役
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
                date: "2023-07-01",
                title: "原材料供应",
                desc: "磷酸铁锂正极材料采购自湖南裕能。碳酸锂原料经赣锋锂业提纯。",
                iconType: "Warehouse",
                location: "湖南, 长沙",
                color: "bg-slate-500"
            },
            {
                date: "2023-09-01",
                title: "电池制造",
                desc: "常州基地生产，采用极简结构设计 (One-Stop Design)，集成度提升 25%。",
                iconType: "Factory",
                location: "江苏, 常州",
                color: "bg-blue-500"
            },
            {
                date: "2023-09-20",
                title: "车辆装配",
                desc: "装配于 GAC AION Y Plus (广汽埃安 Y Plus)。CLTC 续航 510km。",
                iconType: "Truck",
                location: "广东, 广州",
                color: "bg-purple-500"
            },
            {
                date: "2026-01-18",
                title: "例行健康检测",
                desc: "SOH 94.5%，总行驶里程 5.8 万公里。电芯一致性良好，热管理系统正常。",
                iconType: "Wrench",
                location: "广东, 广州",
                color: "bg-blue-400"
            },
            // AI Prediction
            {
                date: "2033-06 (预测)",
                title: "🔮 AI 预测: 退役节点",
                desc: "LFP 体系具有超长循环寿命。基于 SOH 衰减率 (3000 次 → 80%)，预测该电池 2033 年前后退役，剩余价值适合梯次利用于分布式储能。",
                iconType: "AlertCircle",
                location: "AI 模型推演",
                color: "bg-amber-500",
                isPrediction: true
            }
        ]
    },
    // 6. Gotion High-Tech (VW Partner) — 在役
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
        timeline: [
            {
                date: "2023-11-15",
                title: "电池制造",
                desc: "合肥经开区工厂生产，采用 JTM (Jelly Roll to Module) 一体化技术。大众集团战略合作产品。",
                iconType: "Factory",
                location: "安徽, 合肥",
                color: "bg-blue-500"
            },
            {
                date: "2023-12-10",
                title: "车辆装配",
                desc: "装配于一汽大众 ID.4 CROZZ，CLTC 续航 425km。",
                iconType: "Truck",
                location: "吉林, 长春",
                color: "bg-purple-500"
            },
            {
                date: "2035-01 (预测)",
                title: "🔮 AI 预测: 退役节点",
                desc: "LMFP 体系理论循环寿命更优。结合大众平台 MEB 温控效率，预计 2035 年前后退役。",
                iconType: "AlertCircle",
                location: "AI 模型推演",
                color: "bg-amber-500",
                isPrediction: true
            }
        ]
    },
    // 7. Svolt (Honeycomb Energy) - Cobalt Free — 测试中
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
        timeline: [
            {
                date: "2024-03-01",
                title: "研发试制",
                desc: "下一代无钴层状材料电池，采用 NMx (Nickel-Manganese-x) 体系，完全去除稀缺金属钴，成本较 NMC 降低约 15%。",
                iconType: "Factory",
                location: "江苏, 常州",
                color: "bg-indigo-500"
            },
            {
                date: "2025-09-15",
                title: "装车测试",
                desc: "搭载于长城汽车测试车队，进入大规模路测验证阶段。累计测试里程 1.2 万公里，SOH 99.1%。",
                iconType: "Truck",
                location: "河北, 保定",
                color: "bg-purple-500"
            }
        ]
    },
    // 8. Panasonic — 梯次利用
    {
        id: "PANA-2170-2019-M3",
        model: "Panasonic 2170 NCA",
        manufacturer: "Panasonic",
        chemistry: "NCA",
        capacity: "75 kWh",
        energyDensity: "260 Wh/kg",
        cycleLife: "1500 Cycles",
        status: "梯次利用 (Second-life)",
        carbonSaved: "450 kg",
        timeline: [
            {
                date: "2019-05-20",
                title: "电池制造",
                desc: "Gigafactory 1 Nevada 生产。松下与特斯拉联合开发的 2170 NCA 电芯，能量密度业界标杆。",
                iconType: "Factory",
                location: "Nevada, USA",
                color: "bg-blue-500"
            },
            {
                date: "2019-07-01",
                title: "车辆装配",
                desc: "装配于 Tesla Model 3 Long Range (北美版)。EPA 续航 358 miles。",
                iconType: "Truck",
                location: "California, USA",
                color: "bg-purple-500"
            },
            {
                date: "2024-06-10",
                title: "退役检测",
                desc: "SOH 75%，总里程 19.8 万公里。经 Redwood Materials 检测后判定可梯次利用。",
                iconType: "AlertCircle",
                location: "Nevada, USA",
                color: "bg-amber-500"
            },
            {
                date: "2024-09-01",
                title: "梯次利用入库",
                desc: "重组为 Tesla Megapack 储能单元的一部分，部署于加州电网储能项目。",
                iconType: "BatteryCharging",
                location: "California, USA",
                color: "bg-emerald-500"
            },
            {
                date: "2028-06 (预测)",
                title: "🔮 AI 预测: 最终回收",
                desc: "基于 NCA 梯次利用后衰减模型，预测 2028 年送入 Redwood Materials 回收产线，提取镍钴铝锂。预计碳减排贡献累计 1,350 kg。",
                iconType: "Recycle",
                location: "AI 模型推演",
                color: "bg-emerald-600",
                isPrediction: true
            }
        ]
    }
];
