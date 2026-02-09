"use client";

import { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { NEWS_DATA, Article } from "@/data/news";
import { fetchBatteryNews, GNewsArticle } from "@/lib/gnews";
import Link from "next/link";
import { Search, Tag, Calendar, ChevronRight, Globe, FileText, TrendingUp, Loader2 } from "lucide-react";

export default function NewsPage() {
    const [filter, setFilter] = useState<'all' | 'domestic' | 'international' | 'industry'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [realtimeNews, setRealtimeNews] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            setLoading(true);
            try {
                // Fetch latest battery news
                const gnewsArticles = await fetchBatteryNews('动力电池 回收');

                // Transform GNews format to our internal Article format
                const transformedNews: Article[] = gnewsArticles.map((item, index) => ({
                    id: `gnews-${index}`,
                    title: item.title,
                    summary: item.description,
                    content: item.content, // GNews provides limited content in free tier, full content is in url
                    source: item.source.name,
                    date: new Date(item.publishedAt).toLocaleDateString(),
                    tags: ['实时资讯', '动力电池'],
                    category: 'industry', // Default to industry for general news
                    imageUrl: item.image,
                    url: item.url // Add external URL support
                }));

                setRealtimeNews(transformedNews);
            } catch (err) {
                console.error("Failed to load realtime news", err);
            } finally {
                setLoading(false);
            }
        };

        loadNews();
    }, []);

    // Combine static curated data (NEWS_DATA) with real-time fetched data
    const allNews = [...NEWS_DATA, ...realtimeNews];

    const filteredNews = allNews.filter(item => {
        const matchesType = filter === 'all' || item.category === filter;
        const matchesSearch = item.title.includes(searchQuery) || item.summary.includes(searchQuery);
        return matchesType && matchesSearch;
    });

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10 flex flex-col">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-emerald-100">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                            <Link href="/" className="hover:opacity-80 transition-opacity">智链绿能</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-emerald-700">政策资讯</span>
                        </div>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                            <Link href="/" className="hover:text-emerald-600">首页</Link>
                            <Link href="/dashboard" className="hover:text-emerald-600">数据中台</Link>
                            <Link href="/community" className="hover:text-emerald-600">智链社区</Link>
                        </nav>
                    </div>
                </header>

                <main className="flex-grow pt-24 pb-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        {/* Title Section */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">全球电池政策与行业动态</h1>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                实时汇聚欧盟新电池法、工信部规范条件及行业最新研报，助您把握合规命脉。
                            </p>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<Globe size={16} />}>全部</FilterButton>
                                <FilterButton active={filter === 'domestic'} onClick={() => setFilter('domestic')} icon={<FileText size={16} />}>国内政策</FilterButton>
                                <FilterButton active={filter === 'international'} onClick={() => setFilter('international')} icon={<Globe size={16} />}>国际动态</FilterButton>
                                <FilterButton active={filter === 'industry'} onClick={() => setFilter('industry')} icon={<TrendingUp size={16} />}>行业观察</FilterButton>
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="搜索政策或关键词..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* News Grid */}
                        <div className="grid gap-6">
                            {filteredNews.map(news => (
                                <NewsCard key={news.id} article={news} />
                            ))}

                            {filteredNews.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <p>未找到相关文章</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuroraBackground>
    );
}

function FilterButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap
                ${active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-transparent text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
        >
            {icon}
            {children}
        </button>
    )
}

function NewsCard({ article }: { article: Article & { url?: string, imageUrl?: string } }) {
    const LinkComponent = article.url ? 'a' : Link;
    const linkProps = article.url ? { href: article.url, target: "_blank", rel: "noopener noreferrer" } : { href: `/news/${article.id}` };

    return (
        // @ts-ignore
        <LinkComponent {...linkProps}>
            <div className="group bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-emerald-50/50 hover:border-emerald-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden flex flex-col md:flex-row gap-6">

                {article.imageUrl && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                )}

                <div className="flex-grow space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                        <span className={`px-2 py-0.5 rounded-full border ${article.category === 'domestic' ? 'bg-red-50 text-red-600 border-red-100' :
                                article.category === 'international' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {article.category === 'domestic' ? '国内政策' : article.category === 'international' ? '国际动态' : '行业观察'}
                        </span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {article.date}</span>
                        <span>来源：{article.source}</span>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {article.title}
                        </h3>
                        <div className="flex-shrink-0 self-start mt-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                {article.url ? <Globe size={16} /> : <ChevronRight size={18} />}
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed line-clamp-2 text-sm">
                        {article.summary}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                        {article.tags.map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded md:inline-block hidden">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </LinkComponent>
    )
}
