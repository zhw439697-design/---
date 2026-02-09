"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/AuroraBackground";
import { POSTS_DATA } from "@/data/posts";
import Link from "next/link";
import { MessageSquare, Heart, Share2, ArrowLeft, User } from "lucide-react";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Array.isArray(params.id) ? params.id[0] : params.id || '';
    const post = POSTS_DATA.find(p => p.id === postId);

    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post?.likes || 0);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (!post) {
        return (
            <AuroraBackground theme="light">
                <div className="w-full min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">帖子不存在</h1>
                        <Link href="/community" className="text-purple-600 hover:underline">返回社区</Link>
                    </div>
                </div>
            </AuroraBackground>
        );
    }

    // Generate detailed content based on post title
    const getDetailedContent = () => {
        const baseContent = post.content;
        const additionalParagraphs = [
            "\n\n从技术角度来看,这个问题涉及到多个层面的考量。首先是政策层面的支持力度,其次是市场机制的完善程度,最后还要考虑技术创新的推动作用。",
            "\n\n根据最新的行业数据显示,相关领域在过去一年中取得了显著进展。多家企业纷纷加大投入,推动了整个产业链的升级优化。这为未来的发展奠定了坚实基础。",
            "\n\n值得注意的是,在实际操作过程中还存在一些挑战。比如成本控制、技术标准统一、以及跨区域协调等问题。这些都需要行业各方共同努力来解决。",
            "\n\n展望未来,随着相关政策的不断完善和技术的持续进步,我们有理由相信这个领域将迎来更加广阔的发展空间。同时也期待更多专业人士参与讨论,共同推动行业健康发展。"
        ];

        return baseContent + additionalParagraphs.join('');
    };

    // Generate mock comments based on post
    const getMockComments = () => {
        const commentTemplates = [
            { author: '环保先锋', role: 'user' as const, text: '非常有见地的分析!这个问题确实值得深入探讨。', time: '1小时前' },
            { author: '技术达人', role: 'expert' as const, text: '补充一点,根据我的实践经验,还需要考虑地区差异因素。', time: '2小时前' },
            { author: '绿色能源', role: 'company' as const, text: '我们公司在这方面有一些实际案例,可以分享给大家参考。', time: '3小时前' },
            { author: '新能源车主', role: 'user' as const, text: '学到了!之前一直不太了解这方面的内容。', time: '4小时前' },
            { author: '行业观察者', role: 'user' as const, text: '期待看到更多这样的专业讨论,对行业发展很有帮助。', time: '5小时前' },
            { author: '电池专家', role: 'expert' as const, text: '从技术角度来说,这个方向是正确的,但实施起来还有很多细节需要完善。', time: '6小时前' },
            { author: '回收企业', role: 'company' as const, text: '我们正在关注这个领域,希望能够参与到相关标准的制定中。', time: '7小时前' },
            { author: '环保志愿者', role: 'user' as const, text: '支持!希望政策能够尽快落地实施。', time: '8小时前' },
            { author: '研究员', role: 'expert' as const, text: '建议大家也关注一下国际上的相关动态,可以作为参考。', time: '1天前' },
            { author: '普通用户', role: 'user' as const, text: '感谢分享,收藏了!', time: '1天前' },
            { author: '产业分析师', role: 'expert' as const, text: '这个趋势值得关注,未来市场潜力很大。', time: '1天前' },
            { author: '车主小白', role: 'user' as const, text: '请问有没有更详细的资料可以学习?', time: '2天前' },
        ];

        // Return number of comments matching post.comments
        return commentTemplates.slice(0, Math.min(post.comments, commentTemplates.length));
    };

    const comments = getMockComments();

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    };

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-purple-100">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            EcoCycle AI
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                            <Link href="/" className="hover:text-purple-600">首页</Link>
                            <Link href="/community" className="text-purple-600">社区</Link>
                            <Link href="/news" className="hover:text-purple-600">资讯</Link>
                            <Link href="/dashboard" className="hover:text-purple-600">数据中台</Link>
                        </nav>
                    </div>
                </header>

                <main className="pt-24 pb-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            返回社区
                        </button>

                        {/* Post Content */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-slate-100 shadow-sm">
                            {/* Author Info */}
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                    {post.author.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/community/user/${post.author.name}`} className="font-bold text-slate-900 hover:text-purple-600 transition-colors">
                                            {post.author.name}
                                        </Link>
                                        {post.author.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium">认证专家</span>}
                                        {post.author.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">企业号</span>}
                                    </div>
                                    <div className="text-sm text-slate-500">{post.date}</div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-slate-900 mb-6">{post.title}</h1>

                            {/* Content */}
                            <div className="prose prose-slate max-w-none mb-8">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                    {getDetailedContent()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${liked
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                >
                                    <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                                    <span className="font-medium">{likeCount}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all">
                                    <MessageSquare size={20} />
                                    <span className="font-medium">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all ml-auto">
                                    <Share2 size={20} />
                                    <span className="font-medium">分享</span>
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">评论 ({post.comments})</h2>

                            {user ? (
                                <div className="mb-6">
                                    <textarea
                                        placeholder="写下你的评论..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 resize-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                                            发表评论
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Link href="/login" className="text-purple-600 hover:underline">登录</Link> 后参与评论
                                </div>
                            )}

                            {/* Comments List */}
                            {comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.map((comment, index) => (
                                        <div key={index} className="bg-slate-50 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                                                    {comment.author[0]}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-slate-900">{comment.author}</span>
                                                        {comment.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium">认证专家</span>}
                                                        {comment.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">企业号</span>}
                                                        <span className="text-xs text-slate-400">{comment.time}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-relaxed">{comment.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 py-8">
                                    暂无评论,快来抢沙发吧!
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuroraBackground>
    );
}
