import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Zap, Search, Leaf } from "lucide-react";
import Logo from "../components/Logo";
import { AuroraBackground } from "@/components/AuroraBackground";

export default function Home() {
  return (
    <AuroraBackground theme="light">
      <div className="relative w-full flex flex-col min-h-screen">
        {/* Navbar Overlay */}
        <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/60 backdrop-blur-md transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
              <Logo className="w-8 h-8" />
              <span>智链绿能</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link href="/news" className="hover:text-emerald-600 transition-colors">政策资讯</Link>
              <Link href="/community" className="hover:text-emerald-600 transition-colors">智链社区</Link>
              <Link href="#features" className="hover:text-emerald-600 transition-colors">功能特性</Link>
              <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">数据中台</Link>
              <Link href="/ai-assistant" className="hover:text-emerald-600 transition-colors">智能专家</Link>
            </div>
            <div className="md:hidden">
              {/* Mobile menu placeholder */}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-32 pb-16 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-emerald-700 text-xs font-medium mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              绿色循环 · 智享未来
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
              赋能动力电池<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">全生命周期管理</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              利用人工智能优化回收路径、精准核算碳足迹、解读环保政策。<br className="hidden md:block" />
              赋能绿色能源革命，共建循环经济未来。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center gap-2">
                查看实时数据
                <ArrowRight size={18} />
              </Link>
              <Link href="/ai-assistant" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-semibold shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                问专家一个问题
              </Link>
            </div>

            {/* Core Features Section */}
            <div className="w-full max-w-6xl mx-auto mt-24" id="features">
              <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">平台核心功能</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">基于 AI 驱动的动力电池全生命周期管理解决方案，为企业与政府提供决策支持</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 text-left">
                <FeatureCard
                  icon={<BarChart3 size={24} className="text-emerald-600" />}
                  title="碳足迹分析"
                  desc="支持曲线图、堆叠图及敏感性分析等多维视图，精准核算回收过程碳排放，预测技术改进带来的减排潜力。"
                  tags={["LCA全生命周期", "敏感性分析"]}
                  visual={
                    <div className="flex items-end gap-1 h-12 mt-2 w-full justify-center opacity-80">
                      <div className="w-3 bg-emerald-500/20 rounded-t h-[40%]"></div>
                      <div className="w-3 bg-emerald-500/40 rounded-t h-[60%]"></div>
                      <div className="w-3 bg-emerald-500/60 rounded-t h-[30%]"></div>
                      <div className="w-3 bg-emerald-500/80 rounded-t h-[80%]"></div>
                      <div className="w-3 bg-emerald-500 rounded-t h-[50%]"></div>
                    </div>
                  }
                />
                <FeatureCard
                  icon={<Bot size={24} className="text-blue-600" />}
                  title="智能政策顾问"
                  desc="基于行业法规知识库构建，为您解答电池回收税率、合规性要求及补贴政策等复杂问题。"
                  tags={["法规知识库", "实时问答"]}
                  visual={
                    <div className="flex flex-col gap-2 mt-2 w-full opacity-80">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
                        <div className="bg-slate-100 rounded-lg rounded-tl-none p-1.5 w-3/4 h-6"></div>
                      </div>
                      <div className="flex gap-2 flex-row-reverse">
                        <div className="w-6 h-6 rounded-full bg-blue-100 shrink-0"></div>
                        <div className="bg-blue-50 rounded-lg rounded-tr-none p-1.5 w-3/4 h-8 border border-blue-100"></div>
                      </div>
                    </div>
                  }
                />
                <FeatureCard
                  icon={<Leaf size={24} className="text-amber-500" />}
                  title="生态价值追踪"
                  desc="实时输出资源回收贡献量、材料利用率及等效碳减排价值，量化循环经济对碳中和目标的具体贡献。"
                  tags={["量化指标", "动态看板"]}
                  visual={
                    <div className="grid grid-cols-2 gap-2 mt-2 w-full opacity-80">
                      <div className="bg-slate-50 border border-slate-200 rounded p-1.5 flex flex-col items-center">
                        <span className="text-[10px] text-slate-500">回收量</span>
                        <span className="text-xs font-bold text-amber-500">85%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded p-1.5 flex flex-col items-center">
                        <span className="text-[10px] text-slate-500">碳减排</span>
                        <span className="text-xs font-bold text-emerald-500">1.2t</span>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full py-8 text-center text-slate-400 text-sm relative z-10">
          © 2026 智链绿能. 赋能绿色未来.
        </footer>
      </div>
    </AuroraBackground>
  );
}

function FeatureCard({ icon, title, desc, visual, tags }: { icon: React.ReactNode, title: string, desc: string, visual: React.ReactNode, tags: string[] }) {
  return (
    <div className="group bg-white/60 hover:bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-slate-100">
          {icon}
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end max-w-[60%]">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6 h-20 overflow-hidden text-ellipsis">{desc}</p>

      {/* Mini-mockup / Visual Cue */}
      <div className="mt-auto pt-4 border-t border-slate-100 min-h-[80px] flex items-center justify-center relative overflow-hidden bg-slate-50/50 rounded-b-xl -mx-6 -mb-6 px-6">
        {/* Background glow effect for visual */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 z-10"></div>
        {visual}
      </div>
    </div>
  );
}
