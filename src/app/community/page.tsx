"use client";

import { useState, useEffect, useMemo } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import Link from "next/link";
import { MessageSquare, Heart, Share2, Search, Hash, PenSquare, User, X, Loader2, RefreshCw, Mail, Send, MoreHorizontal, Phone, Video } from "lucide-react";

// Mock data for messages
const MOCK_MESSAGES = [
    {
        id: '1',
        sender: { name: 'Dr. Sarah', role: 'expert', abbreviation: 'S', avatar: null },
        content: '你好，我对你发布的关于电池回收的帖子很感兴趣，能否深入交流一下？',
        time: '2分钟前',
        unread: 1,
        online: true
    },
    {
        id: '2',
        sender: { name: 'EcoTech', role: 'company', abbreviation: 'E', avatar: null },
        content: '我们公司正在寻找合作伙伴，看您的项目非常有潜力。',
        time: '1小时前',
        unread: 0,
        online: false
    },
    {
        id: '3',
        sender: { name: 'GreenLife', role: 'member', abbreviation: 'G', avatar: null },
        content: '请教一下，那个最新的环保政策在哪里可以下载详细解读？',
        time: '昨天',
        unread: 0,
        online: true
    }
];

// Mock chat history
const MOCK_CHAT_HISTORY: Record<string, any[]> = {
    '1': [
        { id: '101', senderId: '1', content: '您好！我是Sarah，专注于电池材料研究。', time: '10:30', isMe: false },
        { id: '102', senderId: 'me', content: '幸会！很高兴认识您。', time: '10:32', isMe: true },
        { id: '103', senderId: '1', content: '我对你发布的关于电池回收的帖子很感兴趣，能否深入交流一下？', time: '10:33', isMe: false },
    ],
    '2': [
        { id: '201', senderId: '2', content: '您好，我们是EcoTech发布的。', time: '09:00', isMe: false },
        { id: '202', senderId: '2', content: '我们公司正在寻找合作伙伴，看您的项目非常有潜力。', time: '09:01', isMe: false },
    ],
    '3': [
        { id: '301', senderId: 'me', content: '您好，请问有什么可以帮您的？', time: '昨天', isMe: true },
        { id: '302', senderId: '3', content: '请教一下，那个最新的环保政策在哪里可以下载详细解读？', time: '昨天', isMe: false },
    ]
};

interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        role: string;
    };
    date: string;
    likes: number;
    comments: number;
    isLiked: boolean;
}

export default function CommunityPage() {
    const [user, setUser] = useState<{ username: string, role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Posts and interaction states
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'message'>('all');
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chat states
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<Record<string, any[]>>(MOCK_CHAT_HISTORY);

    // Comment states
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentContent, setCommentContent] = useState<{ [postId: string]: string }>({});
    const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
    const [commentSubmitting, setCommentSubmitting] = useState<{ [postId: string]: boolean }>({});

    // User stats state
    const [userStats, setUserStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });

    // Fetch posts
    const fetchPosts = async () => {
        setPostsLoading(true);
        setError(null);
        try {
            const filterParam = activeFilter === 'all' ? 'all' : activeFilter;
            const usernameParam = user ? `&username=${user.username}` : '';
            const res = await fetch(`/api/community/posts?filter=${filterParam}${usernameParam}`);

            if (!res.ok) throw new Error('Failed to fetch posts');

            const data = await res.json();
            setPosts(data.posts || []);
        } catch (err) {
            console.error('Failed to load posts:', err);
            setError('加载帖子失败,请刷新重试');
        } finally {
            setPostsLoading(false);
        }
    };



    // Fetch user stats
    const fetchUserStats = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/user/stats');
            if (res.ok) {
                const data = await res.json();
                setUserStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to load user stats:', err);
        }
    };

    // Fetch comments for a post
    const fetchComments = async (postId: string) => {
        try {
            const res = await fetch(`/api/community/comments?postId=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(prev => ({ ...prev, [postId]: data.comments || [] }));
            }
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    };

    // Toggle comment section
    const toggleComments = async (postId: string) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
            // Fetch comments if not already loaded
            if (!comments[postId]) {
                await fetchComments(postId);
            }
        }
        setExpandedComments(newExpanded);
    };

    // Submit comment
    const handleSubmitComment = async (postId: string) => {
        if (!user) {
            alert('请先登录');
            return;
        }

        const content = commentContent[postId]?.trim();
        if (!content) {
            alert('请输入评论内容');
            return;
        }

        setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch('/api/community/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, content })
            });

            if (res.ok) {
                // Clear input
                setCommentContent(prev => ({ ...prev, [postId]: '' }));
                // Refresh comments
                await fetchComments(postId);
                // Update comment count optimistically
                setPosts(prevPosts => prevPosts.map(p =>
                    p.id === postId ? { ...p, comments: p.comments + 1 } : p
                ));
            } else {
                alert('评论发布失败,请重试');
            }
        } catch (err) {
            console.error('Failed to submit comment:', err);
            alert('评论发布失败,请重试');
        } finally {
            setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
        }
    };

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchPosts();
            fetchUserStats();
        }
    }, [activeFilter, loading]);

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10 flex flex-col">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-purple-100">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                            <Link href="/" className="hover:opacity-80 transition-opacity">智链绿能</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-purple-600">智链社区</span>
                        </div>
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="搜索话题、帖子..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                />
                            </div>
                        </div>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                            <Link href="/" className="hover:text-purple-600">首页</Link>
                            <Link href="/news" className="hover:text-purple-600">政策资讯</Link>
                            <Link href="/dashboard" className="hover:text-purple-600">数据中台</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link href={`/community/user/${user.username}`} className="flex items-center gap-2 pl-4 border-l border-slate-200">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 hidden md:inline">{user.username}</span>
                                </Link>
                            ) : (
                                <Link href="/auth/login" className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
                                    立即登录
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-grow pt-24 pb-12 px-4">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
                        <div className="hidden lg:block lg:col-span-1 space-y-6">
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h2 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                                    <Hash className="text-purple-500" size={20} />
                                    社区概览
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">总帖子数</span>
                                        <span className="font-medium text-slate-900">{userStats.postsCount + 128}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">活跃用户</span>
                                        <span className="font-medium text-slate-900">2.4k</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">今日新增</span>
                                        <span className="font-medium text-slate-900 text-green-600">+45</span>
                                    </div>
                                </div>
                                {!user && (
                                    <Link href="/auth/login" className="mt-6 w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                        <User size={16} />
                                        立即登录
                                    </Link>
                                )}
                            </div>

                            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm space-y-1">
                                <NavItem
                                    active={activeFilter === 'all'}
                                    icon={<MessageSquare size={18} />}
                                    label="全部讨论"
                                    onClick={() => setActiveFilter('all')}
                                />
                                <NavItem
                                    active={activeFilter === 'liked'}
                                    icon={<Heart size={18} />}
                                    label="我的点赞"
                                    onClick={() => setActiveFilter('liked')}
                                />
                                <NavItem
                                    active={activeFilter === 'message'}
                                    icon={<Mail size={18} />}
                                    label="消息"
                                    onClick={() => setActiveFilter('message')}
                                />

                            </div>
                        </div>

                        {/* Middle - Feed or Messaging */}
                        <div className={`${activeFilter === 'message' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6 transition-all duration-300`}>
                            {activeFilter !== 'message' && (
                                <>
                                    {/* Create Post Input */}
                                    <div
                                        onClick={() => user && setShowPostModal(true)}
                                        className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-4 items-center cursor-pointer hover:bg-white transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400">
                                            {user ? <span className="font-bold text-purple-600">{user.username[0].toUpperCase()}</span> : <User size={20} />}
                                        </div>
                                        <div className="flex-grow bg-slate-50 rounded-full px-4 py-2.5 text-slate-400 text-sm">
                                            {user ? `分享你的观点或提问，${user.username}...` : "登录后参与讨论..."}
                                        </div>
                                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
                                            <PenSquare size={20} />
                                        </button>
                                    </div>


                                    {/* Loading State */}
                                    {postsLoading && (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                                            <p className="text-slate-600">正在加载帖子...</p>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {!postsLoading && error && (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                                                <p className="text-red-700 mb-4">{error}</p>
                                                <button
                                                    onClick={fetchPosts}
                                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
                                                >
                                                    <RefreshCw size={18} />
                                                    重新加载
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Posts List */}
                                    {!postsLoading && !error && (
                                        <>
                                            {posts.length > 0 ? (
                                                posts.map(post => (
                                                    <div key={post.id} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                                    {post.author.name[0]}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Link href={`/community/user/${post.author.name}`} className="font-bold text-slate-900 text-sm hover:text-purple-600 transition-colors">
                                                                            {post.author.name}
                                                                        </Link>
                                                                        {post.author.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium">认证专家</span>}
                                                                        {post.author.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium">企业号</span>}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">{post.date}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Link href={`/community/${post.id}`}>
                                                            <h3 className="font-bold text-lg text-slate-900 mb-2 cursor-pointer hover:text-purple-700 transition-colors">
                                                                {post.title}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                            {post.content}
                                                        </p>

                                                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                                                            <button
                                                                onClick={() => toggleComments(post.id)}
                                                                className="flex items-center gap-1.5 hover:text-purple-600 transition-colors"
                                                            >
                                                                <MessageSquare size={16} /> {post.comments}
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!user) {
                                                                        alert('请先登录');
                                                                        return;
                                                                    }

                                                                    // Optimistic update - update UI immediately
                                                                    const isCurrentlyLiked = post.isLiked;

                                                                    // Update post likes count and isLiked status immediately
                                                                    setPosts(prevPosts => prevPosts.map(p =>
                                                                        p.id === post.id
                                                                            ? {
                                                                                ...p,
                                                                                likes: p.likes + (isCurrentlyLiked ? -1 : 1),
                                                                                isLiked: !isCurrentlyLiked
                                                                            }
                                                                            : p
                                                                    ));

                                                                    // Send API request in background
                                                                    try {
                                                                        const res = await fetch('/api/community/likes', {
                                                                            method: 'POST',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ postId: post.id })
                                                                        });

                                                                        if (res.ok) {
                                                                            // Update with server response
                                                                            const data = await res.json();
                                                                            setPosts(prevPosts => prevPosts.map(p =>
                                                                                p.id === post.id
                                                                                    ? {
                                                                                        ...p,
                                                                                        likes: data.likesCount,
                                                                                        isLiked: data.isLiked
                                                                                    }
                                                                                    : p
                                                                            ));
                                                                        } else {
                                                                            // Revert on error
                                                                            setPosts(prevPosts => prevPosts.map(p =>
                                                                                p.id === post.id
                                                                                    ? {
                                                                                        ...p,
                                                                                        likes: p.likes + (isCurrentlyLiked ? 1 : -1),
                                                                                        isLiked: isCurrentlyLiked
                                                                                    }
                                                                                    : p
                                                                            ));
                                                                            alert('操作失败,请重试');
                                                                        }
                                                                    } catch (err) {
                                                                        console.error('Failed to toggle like:', err);
                                                                        // Revert on error
                                                                        setPosts(prevPosts => prevPosts.map(p =>
                                                                            p.id === post.id
                                                                                ? {
                                                                                    ...p,
                                                                                    likes: p.likes + (isCurrentlyLiked ? 1 : -1),
                                                                                    isLiked: isCurrentlyLiked
                                                                                }
                                                                                : p
                                                                        ));
                                                                    }
                                                                }}
                                                                className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'
                                                                    }`}
                                                            >
                                                                <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} />
                                                                {post.likes}
                                                            </button>
                                                            {/* <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors ml-auto">
                                                        <Share2 size={16} /> 分享
                                                    </button> */}
                                                        </div>

                                                        {/* Comment Section */}
                                                        {expandedComments.has(post.id) && (
                                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                                {/* Comments List */}
                                                                <div className="space-y-3 mb-4">
                                                                    {comments[post.id]?.length > 0 ? (
                                                                        comments[post.id].map((comment: any) => (
                                                                            <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                                                                                <div className="flex items-start gap-2">
                                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-xs flex-shrink-0">
                                                                                        {comment.author.name[0]}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <span className="font-medium text-slate-900 text-sm">{comment.author.name}</span>
                                                                                            {comment.author.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium">认证专家</span>}
                                                                                            {comment.author.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium">企业号</span>}
                                                                                            <span className="text-xs text-slate-400">{comment.date}</span>
                                                                                        </div>
                                                                                        <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-center text-slate-400 text-sm py-4">暂无评论,快来发表第一条评论吧!</p>
                                                                    )}
                                                                </div>

                                                                {/* Comment Input */}
                                                                <div className="pt-3 border-t border-slate-200">
                                                                    <textarea
                                                                        value={commentContent[post.id] || ''}
                                                                        onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                        placeholder="写下你的评论..."
                                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                                                                        rows={3}
                                                                        maxLength={500}
                                                                    />
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <span className="text-xs text-slate-400">
                                                                            {(commentContent[post.id] || '').length}/500
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleSubmitComment(post.id)}
                                                                            disabled={commentSubmitting[post.id] || !(commentContent[post.id]?.trim())}
                                                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                                                                        >
                                                                            {commentSubmitting[post.id] && <Loader2 className="w-4 h-4 animate-spin" />}
                                                                            发布评论
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                                                    <p className="text-slate-400">
                                                        {activeFilter === 'liked' ? '暂无点赞的帖子' : '暂无帖子,快来发布第一条吧!'}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* Message UI (Split View) */}
                            {activeFilter === 'message' && (
                                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[calc(100vh-8rem)]">
                                    {/* Left Sidebar - Chat List */}
                                    <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                                        <div className="p-4 border-b border-slate-100">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="搜索联系人..."
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {MOCK_MESSAGES.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    onClick={() => setSelectedChatId(msg.id)}
                                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedChatId === msg.id ? 'bg-purple-50' : 'hover:bg-white'
                                                        }`}
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                                            {msg.sender.abbreviation}
                                                        </div>
                                                        {msg.online && (
                                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                                        )}
                                                        {msg.unread > 0 && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white transform scale-90">
                                                                {msg.unread}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`font-medium truncate ${selectedChatId === msg.id ? 'text-purple-900' : 'text-slate-900'}`}>{msg.sender.name}</span>
                                                            <span className="text-xs text-slate-400 flex-shrink-0">{msg.time}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 truncate">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Content - Chat Box */}
                                    <div className="flex-1 flex flex-col bg-slate-50/30">
                                        {selectedChatId ? (
                                            <>
                                                {/* Chat Header */}
                                                <div className="h-16 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="font-bold text-slate-900 text-lg">
                                                            {MOCK_MESSAGES.find(m => m.id === selectedChatId)?.sender.name}
                                                        </div>
                                                        {MOCK_MESSAGES.find(m => m.id === selectedChatId)?.sender.role === 'expert' &&
                                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">认证专家</span>
                                                        }
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-400">
                                                        <button className="hover:text-purple-600 transition-colors"><Phone size={20} /></button>
                                                        <button className="hover:text-purple-600 transition-colors"><Video size={20} /></button>
                                                        <button className="hover:text-purple-600 transition-colors"><MoreHorizontal size={20} /></button>
                                                    </div>
                                                </div>

                                                {/* Chat Messages */}
                                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                                    {messages[selectedChatId]?.map((msg, idx) => (
                                                        <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${msg.isMe
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-white text-purple-600 border border-purple-100'
                                                                }`}>
                                                                {msg.isMe ? (user ? user.username[0].toUpperCase() : 'ME') : MOCK_MESSAGES.find(m => m.id === selectedChatId)?.sender.abbreviation}
                                                            </div>
                                                            <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.isMe
                                                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                                    }`}>
                                                                    {msg.content}
                                                                </div>
                                                                <span className="text-xs text-slate-400 mt-1 px-1">{msg.time}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Chat Input */}
                                                <div className="p-4 bg-white border-t border-slate-100">
                                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/50 transition-all">
                                                        <div className="flex gap-2 p-2 border-b border-slate-200/50">
                                                            <button className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-200/50 transition-colors">
                                                                <MessageSquare size={18} />
                                                            </button>
                                                            <button className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-200/50 transition-colors">
                                                                <Heart size={18} />
                                                            </button>
                                                            <button className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-200/50 transition-colors">
                                                                <Share2 size={18} />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={chatInput}
                                                            onChange={(e) => setChatInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    if (!chatInput.trim()) return;
                                                                    const newMessage = {
                                                                        id: Date.now().toString(),
                                                                        senderId: 'me',
                                                                        content: chatInput,
                                                                        time: '刚刚',
                                                                        isMe: true
                                                                    };
                                                                    setMessages(prev => ({
                                                                        ...prev,
                                                                        [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
                                                                    }));
                                                                    setChatInput('');
                                                                }
                                                            }}
                                                            placeholder="输入消息... (Enter发送)"
                                                            className="w-full px-3 py-2 bg-transparent focus:outline-none text-slate-900 text-sm resize-none h-24"
                                                        />
                                                        <div className="flex justify-between items-center px-2 pb-1">
                                                            <span className="text-xs text-slate-400">Enter 发送</span>
                                                            <button
                                                                onClick={() => {
                                                                    if (!chatInput.trim()) return;
                                                                    const newMessage = {
                                                                        id: Date.now().toString(),
                                                                        senderId: 'me',
                                                                        content: chatInput,
                                                                        time: '刚刚',
                                                                        isMe: true
                                                                    };
                                                                    setMessages(prev => ({
                                                                        ...prev,
                                                                        [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
                                                                    }));
                                                                    setChatInput('');
                                                                }}
                                                                disabled={!chatInput.trim()}
                                                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Send size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                    <MessageSquare size={40} />
                                                </div>
                                                <p className="text-lg font-medium text-slate-500">选择一个联系人开始聊天</p>
                                                <p className="text-sm mt-2">与专家、企业和社区成员实时交流</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - Message mode hides it */}
                        <div className={`${activeFilter === 'message' ? 'hidden' : 'hidden lg:block lg:col-span-1'} space-y-6 transition-all`}>
                            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                                    <Hash className="text-purple-500" size={20} />
                                    热门话题
                                </h3>
                                <div className="space-y-3">
                                    {['#电池回收', '#锂电池', '#环保政策', '#新能源', '#碳中和'].map((tag, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-slate-600 group-hover:text-purple-600 transition-colors">{tag}</span>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                {120 - i * 15} 讨论
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">加入专家计划</h3>
                                    <p className="text-purple-100 text-sm mb-4">认证成为领域专家，获取更多曝光和权益</p>
                                    <button className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors">
                                        立即申请
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Post Creation Modal */}
                {showPostModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPostModal(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">发布新帖子</h3>
                                <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
                                    <input
                                        type="text"
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        placeholder="输入帖子标题..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900"
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{postTitle.length}/100</p>
                                </div>

                                {/* Content Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">内容</label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="分享你的观点、经验或提出问题..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 resize-none"
                                        rows={8}
                                        maxLength={1000}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{postContent.length}/1000</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowPostModal(false);
                                            setPostTitle('');
                                            setPostContent('');
                                        }}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!postTitle.trim() || !postContent.trim()) {
                                                alert('请填写标题和内容');
                                                return;
                                            }
                                            setSubmitting(true);
                                            try {
                                                const res = await fetch('/api/community/posts', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ title: postTitle, content: postContent })
                                                });

                                                if (!res.ok) {
                                                    throw new Error('Failed to create post');
                                                }

                                                alert('帖子发布成功!');
                                                setShowPostModal(false);
                                                setPostTitle('');
                                                setPostContent('');
                                                await fetchPosts(); // Refresh posts list
                                            } catch (err) {
                                                console.error(err);
                                                alert('发布失败,请重试');
                                            } finally {
                                                setSubmitting(false);
                                            }
                                        }}
                                        disabled={submitting || !postTitle.trim() || !postContent.trim()}
                                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? '发布中...' : '发布'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuroraBackground>
    );
}
function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
                }`}>
            {icon}
            {label}
        </button>
    )
}


