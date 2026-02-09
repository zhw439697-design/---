"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "../page.module.css"; // Reuse branding styles

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AiAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "您好！我是您的绿色循环智能顾问。请问有什么关于动力电池回收政策、碳足迹核算或安全规范的问题吗？" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
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

            // Start streaming response
            setMessages(prev => [...prev, { role: "assistant", content: "" }]); // Placeholder

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
                // Keep the last part in buffer as it might be incomplete
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

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center pt-20 pb-10 px-4">
            <div className="w-full max-w-4xl flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors" title="返回控制台">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Bot className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-100">绿色循环智能专家</h2>
                            <p className="text-xs text-slate-400">Powered by Kimi (Moonshot)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMessages([])}
                        className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                        title="清空会话"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-emerald-600" : "bg-slate-700"
                                }`}>
                                {msg.role === "user" ? <User size={20} className="text-white" /> : <Bot size={20} className="text-emerald-400" />}
                            </div>

                            <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed ${msg.role === "user"
                                ? "bg-emerald-600/20 text-emerald-50 border border-emerald-500/30 rounded-tr-none"
                                : "bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-tl-none"
                                }`}>
                                {/* Simple Markdown-like rendering could go here, for now just text */}
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1].role === "user" && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center animate-pulse">
                                <Bot size={20} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1 h-10">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="询问关于碳税政策、电池化学成分..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-4 pr-14 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="text-center text-xs text-slate-600 mt-2">
                        AI 模型可能会犯错，请务必核实重要信息。
                    </p>
                </div>

            </div>
        </div>
    );
}
