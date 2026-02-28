"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { AuroraBackground } from "@/components/AuroraBackground";
import Logo from "../../components/Logo";

export default function ForgotPasswordPage() {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("两次输入的密码不一致");
            return;
        }

        if (newPassword.length < 6) {
            setError("新密码长度不能少于6位");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, newPassword }),
            });

            if (res.ok) {
                setSuccess("密码重置成功，请使用新密码登录！");
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || "重置失败，请检查用户名是否正确");
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
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                        <Logo className="w-20 h-20 mx-auto mb-6 relative z-10" iconClassName="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 mb-2">重置密码</h1>
                    <p className="text-slate-600">请输入您的用户名和新密码</p>
                </div>

                <div className="bg-white/60 backdrop-blur-2xl border border-slate-200/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 border border-emerald-500/10 rounded-3xl pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 text-sm animate-in fade-in slide-in-from-top-2">
                                <CheckCircle size={16} />
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">用户名</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="请输入需要找回密码的用户名"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">新密码</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="请输入新密码（不少于6位）"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">确认新密码</label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/80 transition-all duration-300"
                                    placeholder="请再次输入新密码"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        确认重置
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            想起密码了? <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors hover:underline underline-offset-4">返回登录</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-500 text-xs font-mono">
                    &copy; 2026 智链绿能. All rights reserved.
                </div>
            </div>
        </AuroraBackground>
    );
}
