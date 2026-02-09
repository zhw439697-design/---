"use client";

import { AuroraBackground } from "@/components/AuroraBackground";
import { NEWS_DATA } from "@/data/news";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Share2, Printer } from "lucide-react";
import { notFound } from "next/navigation";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
    const article = NEWS_DATA.find(item => item.id === params.id);

    if (!article) {
        notFound();
    }

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10 flex flex-col">
                <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-6">
                    <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                        <Link href="/news" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-medium">
                            <ArrowLeft size={20} />
                            返回列表
                        </Link>
                        <div className="text-sm font-bold text-slate-800 hidden md:block truncate max-w-md">
                            {article.title}
                        </div>
                        <div className="w-20"></div> {/* Spacer for center alignment */}
                    </div>
                </nav>

                <main className="flex-grow pt-28 pb-16 px-4">
                    <article className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                        {/* Article Header */}
                        <header className="mb-10 text-center border-b border-slate-100 pb-8">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${article.category === 'domestic' ? 'bg-red-100 text-red-700' :
                                        article.category === 'international' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {article.category === 'domestic' ? '国内政策' : article.category === 'international' ? '国际动态' : '行业观察'}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Calendar size={16} /> {article.date}</span>
                                <span className="font-medium text-emerald-700">来源：{article.source}</span>
                            </div>
                        </header>

                        {/* Article Content */}
                        <div
                            className="prose prose-lg prose-slate max-w-none 
                                prose-headings:text-slate-800 prose-headings:font-bold 
                                prose-p:text-slate-600 prose-p:leading-relaxed
                                prose-strong:text-slate-900 prose-strong:font-semibold
                                prose-li:text-slate-600
                                prose-a:text-emerald-600 hover:prose-a:text-emerald-500"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Footer / Tags */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Tag size={18} className="text-slate-400" />
                                {article.tags.map(tag => (
                                    <span key={tag} className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="分享">
                                    <Share2 size={20} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="打印">
                                    <Printer size={20} />
                                </button>
                            </div>
                        </div>
                    </article>
                </main>
            </div>
        </AuroraBackground>
    );
}
