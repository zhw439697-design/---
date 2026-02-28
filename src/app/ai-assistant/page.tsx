"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, ArrowLeft, Sparkles, Zap, Battery, Leaf, Shield, BookOpen, TrendingUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/AuroraBackground";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Quick suggestion chips for first-time users
const QUICK_PROMPTS = [
    { icon: <Battery size={14} />, label: "电池回收政策", prompt: "请介绍下国内最新的动力电池回收政策法规，有哪些强制性要求？" },
    { icon: <Leaf size={14} />, label: "碳足迹核算", prompt: "动力电池全生命周期的碳足迹如何核算？有哪些国际标准？" },
    { icon: <Shield size={14} />, label: "EU电池法规", prompt: "请详细解读欧盟新电池法规（EU Battery Regulation）对中国电池出口的影响。" },
    { icon: <TrendingUp size={14} />, label: "金属价格趋势", prompt: "锂、钴、镍的价格走势如何？对电池回收经济性有什么影响？" },
    { icon: <BookOpen size={14} />, label: "梯次利用技术", prompt: "动力电池的梯次利用有哪些主流技术路线？安全性如何保障？" },
    { icon: <Zap size={14} />, label: "LFP vs NMC", prompt: "磷酸铁锂（LFP）和三元锂（NMC）电池在回收价值上有什么区别？" },
];

export default function AiAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch");
            if (!response.body) return;

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let assistantMessage = "";

            let buffer = "";
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                buffer += chunkValue;

                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === "data: [DONE]") continue;

                    if (trimmedLine.startsWith("data: ")) {
                        const dataStr = trimmedLine.slice(6);
                        try {
                            const data = JSON.parse(dataStr);
                            const content = data.choices[0]?.delta?.content || "";
                            if (content) {
                                assistantMessage += content;
                                setMessages(prev => {
                                    const newMsg = [...prev];
                                    newMsg[newMsg.length - 1].content = assistantMessage;
                                    return newMsg;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing SSE JSON", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "抱歉，我遇到了一些问题，请稍后再试。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickPrompt = (prompt: string) => {
        sendMessage(prompt);
    };

    const isEmptyConversation = messages.length === 0;

    return (
        <AuroraBackground theme="light" backgroundImage="/battery-lifecycle.svg">
            <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">

                <div className="w-full max-w-4xl flex-1 flex flex-col relative z-10 max-h-[92vh] my-4">
                    {/* Main Chat Container */}
                    <div className="flex-1 flex flex-col bg-white/70 border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-2xl">

                        {/* Header */}
                        <div className="bg-white/60 p-4 border-b border-slate-200/60 flex items-center justify-between backdrop-blur-xl">
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-all" title="返回控制台">
                                    <ArrowLeft size={20} />
                                </Link>
                                <div className="relative">
                                    <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl border border-emerald-200">
                                        <Bot className="text-emerald-600" size={22} />
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                        绿色循环智能专家
                                        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">ONLINE</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">Powered by Kimi (Moonshot AI) · 动力电池领域专家模型</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
                                    {messages.filter(m => m.role === 'user').length} 条对话
                                </span>
                                <button
                                    onClick={() => setMessages([])}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-slate-100 transition-all"
                                    title="清空会话"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/30">
                            {isEmptyConversation ? (
                                /* Welcome State */
                                <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in duration-700">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-3xl flex items-center justify-center border border-emerald-200 shadow-lg shadow-emerald-100/50">
                                            <Sparkles className="text-emerald-600" size={36} />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <MessageCircle size={10} className="text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">你好，我是绿色循环 AI 专家</h3>
                                    <p className="text-slate-500 text-sm text-center max-w-md mb-8 leading-relaxed">
                                        我精通动力电池回收政策、碳足迹核算、EU 电池法规、<br />
                                        梯次利用技术和金属资源价格分析。请问有什么可以帮您？
                                    </p>

                                    {/* Quick Action Chips */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl w-full">
                                        {QUICK_PROMPTS.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleQuickPrompt(item.prompt)}
                                                className="group flex items-center gap-2.5 bg-white/60 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-300 rounded-xl px-4 py-3 text-left transition-all duration-300 hover:shadow-md hover:shadow-emerald-100/50"
                                            >
                                                <span className="text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0">{item.icon}</span>
                                                <span className="text-sm text-slate-600 group-hover:text-slate-800 font-medium transition-colors truncate">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Chat Messages */
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === "user"
                                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200/30"
                                                : "bg-white border border-slate-200 shadow-slate-100/50"
                                            }`}>
                                            {msg.role === "user"
                                                ? <User size={16} className="text-white" />
                                                : <Bot size={16} className="text-emerald-600" />
                                            }
                                        </div>

                                        <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed text-sm ${msg.role === "user"
                                                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-md shadow-md shadow-emerald-200/30"
                                                : "bg-white/80 text-slate-700 border border-slate-200/60 rounded-tl-md shadow-sm"
                                            }`}>
                                            <div className="whitespace-pre-wrap [&>p]:mb-2 last:[&>p]:mb-0">
                                                {renderMarkdown(msg.content, msg.role)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Typing Indicator */}
                            {isLoading && (messages.length === 0 || messages[messages.length - 1].role === "user") && (
                                <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                                        <Bot size={16} className="text-emerald-600 animate-pulse" />
                                    </div>
                                    <div className="bg-white/80 border border-slate-200/60 rounded-2xl rounded-tl-md px-5 py-3 flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-2 h-2 bg-emerald-500/60 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/60 border-t border-slate-200/60 backdrop-blur-xl">
                            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="询问关于动力电池回收、碳税政策、EU 法规..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-5 pr-14 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-30 disabled:hover:from-emerald-600 disabled:hover:to-teal-600 text-white rounded-xl transition-all shadow-md shadow-emerald-200/30 disabled:shadow-none"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            <p className="text-center text-[11px] text-slate-400 mt-2.5 font-medium">
                                AI 模型可能会犯错，请务必核实重要信息。Kimi 大模型由 Moonshot AI 提供支持。
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}

// Simple Markdown-like renderer for AI responses
function renderMarkdown(text: string, role?: string) {
    if (!text) return null;

    const isUser = role === 'user';

    // Split by double newlines into paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, i) => {
        // Heading detection (### or ##)
        if (para.startsWith('### ')) {
            return <h4 key={i} className="text-emerald-700 font-bold text-sm mt-3 mb-1">{para.slice(4)}</h4>;
        }
        if (para.startsWith('## ')) {
            return <h3 key={i} className="text-emerald-600 font-bold text-base mt-4 mb-2">{para.slice(3)}</h3>;
        }

        // List detection
        const lines = para.split('\n');
        if (lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()))) {
            return (
                <ul key={i} className="space-y-1.5 my-2">
                    {lines.map((line, j) => {
                        const cleaned = line.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
                        if (!cleaned) return null;
                        return (
                            <li key={j} className={`flex gap-2 items-start ${isUser ? 'text-white/90' : 'text-slate-600'}`}>
                                <span className="text-emerald-500 mt-1 shrink-0">•</span>
                                <span>{formatInlineMarkdown(cleaned, isUser)}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        }

        // Regular paragraph
        return <p key={i} className={`${isUser ? 'text-white/90' : 'text-slate-600'} mb-2 last:mb-0`}>{formatInlineMarkdown(para, isUser)}</p>;
    });
}

// Handle inline markdown: **bold**, `code`
function formatInlineMarkdown(text: string, isUser?: boolean) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className={`${isUser ? 'text-white font-semibold' : 'text-slate-800 font-semibold'}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-xs font-mono border border-emerald-100">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}
