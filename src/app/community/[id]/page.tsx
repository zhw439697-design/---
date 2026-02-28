"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/AuroraBackground";
import Link from "next/link";
import { MessageSquare, Heart, Share2, ArrowLeft, Loader2, Send } from "lucide-react";

interface Post {
    id: string;
    title: string;
    content: string;
    topic: string;
    tags: string | null;
    author: {
        name: string;
        role: string;
    };
    date: string;
    likes: number;
    comments: number;
    isLiked: boolean;
}

interface Comment {
    id: string;
    content: string;
    author: {
        name: string;
        role: string;
    };
    date: string;
}

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Array.isArray(params.id) ? params.id[0] : params.id || '';

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);

    // Fetch user info
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

    // Fetch post and comments
    useEffect(() => {
        const loadPageData = async () => {
            if (!postId) return;
            setLoading(true);
            try {
                const postRes = await fetch(`/api/community/posts/${postId}`);
                if (postRes.ok) {
                    const postData = await postRes.json();
                    setPost(postData.post);

                    // Fetch comments
                    setCommentsLoading(true);
                    const commentsRes = await fetch(`/api/community/comments?postId=${postId}`);
                    if (commentsRes.ok) {
                        const commentsData = await commentsRes.json();
                        setComments(commentsData.comments || []);
                    }
                    setCommentsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load post detail:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, [postId]);

    const handleLike = async () => {
        if (!user || !post || liking) return;
        setLiking(true);
        try {
            const res = await fetch('/api/community/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: parseInt(post.id) })
            });

            if (res.ok) {
                const data = await res.json();
                setPost(prev => prev ? {
                    ...prev,
                    isLiked: data.isLiked,
                    likes: data.isLiked ? prev.likes + 1 : prev.likes - 1
                } : null);
            }
        } catch (err) {
            console.error('Like error:', err);
        } finally {
            setLiking(false);
        }
    };

    const handlePostComment = async () => {
        if (!user || !commentInput.trim() || submittingComment || !post) return;
        setSubmittingComment(true);
        try {
            const res = await fetch('/api/community/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: parseInt(post.id), content: commentInput })
            });

            if (res.ok) {
                setCommentInput('');
                // Refresh comments
                const commentsRes = await fetch(`/api/community/comments?postId=${postId}`);
                if (commentsRes.ok) {
                    const data = await commentsRes.json();
                    setComments(data.comments || []);
                    // Update post comment count optimistically
                    setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
                }
            }
        } catch (err) {
            console.error('Submit comment error:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <AuroraBackground theme="light">
                <div className="w-full min-h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                </div>
            </AuroraBackground>
        );
    }

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

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-purple-100">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                            <Link href="/" className="hover:opacity-80 transition-opacity">智链绿能</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-purple-600">智链社区</span>
                        </div>
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
                                    {post.author.name[0]?.toUpperCase()}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/community/user/${post.author.name}`} className="font-bold text-slate-900 hover:text-purple-600 transition-colors">
                                            {post.author.name}
                                        </Link>
                                        {post.author.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium">认证专家</span>}
                                        {post.author.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium">企业号</span>}
                                    </div>
                                    <div className="text-sm text-slate-500">{post.date}</div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100 italic">
                                        #{post.topic}
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">{post.title}</h1>

                            {/* Tags if any */}
                            {post.tags && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags.split(' ').filter(t => t.startsWith('#')).map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-lg border border-slate-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="prose prose-slate max-w-none mb-8">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
                                    {post.content}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-6 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleLike}
                                    disabled={liking}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${post.isLiked
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                >
                                    <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                                    <span className="font-bold">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all font-bold">
                                    <MessageSquare size={20} />
                                    <span>{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all ml-auto font-bold">
                                    <Share2 size={20} />
                                    <span>分享</span>
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MessageSquare size={20} className="text-purple-500" />
                                评论 ({post.comments})
                            </h2>

                            {user ? (
                                <div className="mb-8">
                                    <div className="relative">
                                        <textarea
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder="写下你的专业观点、建议或提问..."
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 resize-none min-h-[120px] transition-all"
                                            maxLength={500}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                                            {commentInput.length}/500
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-3">
                                        <button
                                            onClick={handlePostComment}
                                            disabled={!commentInput.trim() || submittingComment}
                                            className="px-8 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-200"
                                        >
                                            {submittingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                            发表回复
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-8">
                                    <p className="text-slate-500 mb-3 text-sm">登录智链社区，与行业精英深度交流</p>
                                    <Link href="/login" className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                                        即刻登录
                                    </Link>
                                </div>
                            )}

                            {/* Comments List */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-slate-300" size={32} />
                                </div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="group">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                    {comment.author.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <span className="font-bold text-slate-900 text-sm whitespace-nowrap">{comment.author.name}</span>
                                                        {comment.author.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">专家</span>}
                                                        {comment.author.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">企业</span>}
                                                        <span className="text-[11px] text-slate-400 ml-auto whitespace-nowrap">{comment.date}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-relaxed break-words">{comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                        <MessageSquare size={32} />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">暂无评论，快来分享您的观点</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuroraBackground>
    );
}
