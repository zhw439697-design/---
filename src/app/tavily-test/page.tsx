"use client";

import { useState } from 'react';
import { searchWithTavily, TavilyResponse } from '@/lib/tavily';

export default function TavilyTestPage() {
    const [query, setQuery] = useState('Who is Leo Messi?');
    const [maxResults, setMaxResults] = useState(5);
    const [searchDepth, setSearchDepth] = useState<'basic' | 'advanced' | 'fast' | 'ultra-fast'>('basic');
    const [includeAnswer, setIncludeAnswer] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TavilyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await searchWithTavily(query, {
                max_results: maxResults,
                search_depth: searchDepth,
                include_answer: includeAnswer
            });
            if (data) {
                setResult(data);
                console.log('Tavily 搜索结果:', data);
            } else {
                setError('搜索失败,请检查控制台');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '未知错误');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Tavily API 测试</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="输入搜索查询..."
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 transition-colors"
                        >
                            {loading ? '搜索中...' : '搜索'}
                        </button>
                    </div>

                    {/* Search Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                最大结果数: {maxResults}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={maxResults}
                                onChange={(e) => setMaxResults(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                搜索深度
                            </label>
                            <select
                                value={searchDepth}
                                onChange={(e) => setSearchDepth(e.target.value as any)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black"
                            >
                                <option value="basic">Basic (平衡)</option>
                                <option value="advanced">Advanced (高精度)</option>
                                <option value="fast">Fast (快速)</option>
                                <option value="ultra-fast">Ultra-fast (超快)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                包含 AI 回答
                            </label>
                            <button
                                onClick={() => setIncludeAnswer(!includeAnswer)}
                                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${includeAnswer
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                            >
                                {includeAnswer ? '是' : '否'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            错误: {error}
                        </div>
                    )}
                </div>

                {result && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">搜索查询</h2>
                            <p className="text-slate-700">{result.query}</p>

                            {result.answer && (
                                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                                    <h3 className="font-semibold text-emerald-900 mb-2">AI 回答</h3>
                                    <p className="text-emerald-800">{result.answer}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">搜索结果 ({result.results?.length || 0})</h2>

                            <div className="space-y-4">
                                {result.results?.map((item, index) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-semibold text-emerald-600 hover:text-emerald-700 block mb-2"
                                        >
                                            {item.title}
                                        </a>
                                        <p className="text-slate-600 text-sm mb-2">{item.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>评分: {item.score?.toFixed(2)}</span>
                                            {item.publishedDate && <span>发布日期: {item.publishedDate}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">原始 JSON 响应</h2>
                            <pre className="text-xs text-green-400 overflow-x-auto">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
