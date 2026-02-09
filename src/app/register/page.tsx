"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import { AuroraBackground } from "@/components/AuroraBackground";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("注册成功！正在跳转至登录页...");
                setTimeout(() => {
                    router.push("/login"); // Redirect to login page
                }, 1500);
            } else {
                setError(data.error || "注册失败，请稍后重试");
            }
        } catch (err) {
            setError("发生错误，请稍后重试");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuroraBackground theme="light" backgroundImage="/battery-lifecycle.svg">
            <div className="w-full max-w-md relative z-10 p-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 mb-2">注册账号</h1>
                    <p className="text-slate-600">加入 智链绿能，开启绿色循环之旅</p>
                </div>

                <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Inner glowing border effect */}
                    <div className="absolute inset-0 border border-purple-500/10 rounded-3xl pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 text-sm animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 size={16} />
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">用户名</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-purple-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="设置用户名"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">密码</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-purple-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="设置密码 (至少6位)"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">确认密码</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-purple-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="再次输入密码"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    立即注册
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            已有账号? <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors hover:underline underline-offset-4">直接登录</Link>
                        </p>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}
