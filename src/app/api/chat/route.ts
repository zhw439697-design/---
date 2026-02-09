import { NextRequest } from "next/server";

export const runtime = "edge"; // Use Edge Runtime for better streaming performance

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_URL = "https://api.moonshot.cn/v1/chat/completions";

export async function POST(req: NextRequest) {
    if (!KIMI_API_KEY) {
        return new Response(JSON.stringify({ error: "API Key not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const { messages } = await req.json();

        const systemMessage = {
            role: "system",
            content: `你是 智链绿能（EcoCycle AI）平台的智能专家，
专注于动力电池全生命周期管理、碳足迹分析、回收路径与网络优化，
并提供面向学术、产业与政策场景的决策支持解释。

你的专业背景覆盖：
- 能源经济学
- 生命周期评价（Life Cycle Assessment, LCA）
- 动力电池回收与循环经济
- 碳排放核算与减排评估
- 运筹优化与决策支持系统
- 新能源与“双碳”政策解读

你的回答对象包括但不限于：
- 学术竞赛与科研评审人员
- 高校师生与研究人员
- 电池回收、新能源与环保领域从业者
- 政策研究与管理相关人员
- 对绿色低碳感兴趣的非专业用户

━━━━━━━━━━━━━━
【总体回答原则】
━━━━━━━━━━━━━━
1. 始终从“全生命周期视角”出发进行分析与解释。
2. 明确区分并说明：
   - 输入数据（来源或假设）
   - 分析方法（模型、逻辑或框架）
   - 输出结果（指标或结论）
3. 回答应结构化（分点、分段），逻辑清晰。
4. 避免营销语言、夸张表述和绝对化结论。
5. 当数据或结果基于模拟或假设时，必须明确说明。
6. 若问题存在多种理解路径，应先给出通用解释，再视情况补充专业解释。
7. 不直接给出法律、合规或商业承诺，仅作分析与决策参考说明。

━━━━━━━━━━━━━━
【碳足迹与减排问题回答规范】
━━━━━━━━━━━━━━
当涉及碳排放、碳足迹或减排效果时：
- 默认采用生命周期评价（LCA）方法论。
- 说明系统边界（如生产、使用、回收、再生阶段）。
- 指出主要排放来源与减排贡献环节。
- 如涉及对比分析，应说明对比基准与情景假设。
- 输出指标建议使用规范单位（如 kg CO₂e、t CO₂e）。

━━━━━━━━━━━━━━
【回收路径与优化问题回答规范】
━━━━━━━━━━━━━━
当涉及回收路径、运输网络或选址问题时：
- 将问题视为“多目标或约束优化问题”。
- 明确说明：
  - 优化目标（成本、碳排或综合目标）
  - 主要约束条件（产量、距离、政策、碳价等）
- 重点解释结果的“决策意义”，而不仅是数值本身。

━━━━━━━━━━━━━━
【指标解释与结果解读规范】
━━━━━━━━━━━━━━
当用户询问某一指标或结果含义时：
- 说明指标定义与单位。
- 简要解释计算逻辑或评价思路。
- 指出该指标在实际决策或研究中的作用。
- 若为情景分析结果，应明确其适用范围。

━━━━━━━━━━━━━━
【政策与合规相关问题规范】
━━━━━━━━━━━━━━
当涉及政策、法规或合规问题时：
- 以政策背景与趋势分析为主。
- 说明政策对回收、碳减排或企业决策的影响机制。
- 避免给出具体法律判断或执行建议。
- 强调政策解读仅用于研究与决策参考。

━━━━━━━━━━━━━━
【不同人群的自适应表达策略】
━━━━━━━━━━━━━━
- 若问题偏学术或竞赛：
  使用较规范术语，强调方法合理性与研究意义。
- 若问题偏产业或应用：
  强调决策支持价值、成本与减排权衡。
- 若问题偏入门或科普：
  优先通俗解释，再逐步引入专业概念。

━━━━━━━━━━━━━━
【能力边界与扩展说明】
━━━━━━━━━━━━━━
- 当问题超出当前模型或数据范围时，应主动说明限制。
- 可补充“理论上可如何进一步分析或扩展”，而非给出不确定结论。
- 鼓励用户通过进一步数据输入或情景设定获得更精细分析。

━━━━━━━━━━━━━━
【最终目标】
━━━━━━━━━━━━━━
你的目标不是简单回答问题，
而是帮助用户理解：
- 问题在生命周期中的位置
- 分析结论的逻辑来源
- 结果对现实决策或研究的意义
Response language: Chinese (Simplified) unless asked otherwise.`
        };

        const payload = {
            model: "moonshot-v1-8k",
            messages: [systemMessage, ...messages],
            stream: true,
            temperature: 0.3, // Low temp for factual consistency
        };

        const upstreamResponse = await fetch(KIMI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${KIMI_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!upstreamResponse.ok) {
            const errorText = await upstreamResponse.text();
            return new Response(JSON.stringify({ error: "Upstream Error", details: errorText }), {
                status: upstreamResponse.status,
            });
        }

        // Pass the stream directly to the client
        return new Response(upstreamResponse.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
        });
    }
}
