"use client";

import Link from "next/link";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    LineChart,
    Settings,
    LogOut,
    Bot,
    Home,
    ScanSearch,
    FileText,
    Users,
    User
} from "lucide-react";


export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") return true;
        if (path !== "/dashboard" && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col z-20">
            <div className="flex items-center gap-3 mb-10">
                <Logo />
                <span className="text-xl font-bold tracking-tight text-white">智链绿能</span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="总览" active={isActive("/dashboard")} />
                <NavLink href="/dashboard/analytics" icon={<LineChart size={20} />} label="数据分析" active={isActive("/dashboard/analytics")} />
                <NavLink href="/ai-assistant" icon={<Bot size={20} />} label="AI 顾问" active={isActive("/ai-assistant")} />
                <NavLink href="/dashboard/traceability" icon={<ScanSearch size={20} />} label="全生命周期溯源" active={isActive("/dashboard/traceability")} />

                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    个人与社区
                </div>
                <NavLink href="/dashboard/profile" icon={<User size={20} />} label="个人中心" active={isActive("/dashboard/profile")} />
                <NavLink href="/news" icon={<FileText size={20} />} label="政策资讯" active={pathname?.startsWith('/news')} />
                <NavLink href="/community" icon={<Users size={20} />} label="智链社区" active={isActive("/community")} />

                <NavLink href="/" icon={<Home size={20} />} label="返回首页" active={pathname === "/"} />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <button
                    onClick={async () => {
                        try {
                            await fetch("/api/auth/logout", { method: "POST" });
                            window.location.href = "/login";
                        } catch (error) {
                            console.error("Logout failed:", error);
                        }
                    }}
                    className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full px-4 py-2"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">退出登录</span>
                </button>
            </div>
        </aside>
    );
}

function NavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
        </Link>
    );
}
