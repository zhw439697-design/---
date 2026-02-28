"use client";

import { useState, useEffect, useMemo } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import Link from "next/link";
import { MessageSquare, Heart, Share2, Search, Hash, PenSquare, User, X, Loader2, RefreshCw, Mail, Send, MoreHorizontal, Phone, Video, Check } from "lucide-react";

// Contact type for messaging
interface Contact {
    id: string;
    sender: { name: string; role: string; abbreviation: string; avatar: string | null };
    content: string;
    time: string;
    unread: number;
    online: boolean;
}

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

export default function CommunityPage() {
    const [user, setUser] = useState<{ username: string, nickname?: string, user_id?: string, role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [postTopic, setPostTopic] = useState('综合');
    const [postTags, setPostTags] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Posts and interaction states
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'message'>('all');
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chat states
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<Record<string, any[]>>({});
    const [contactList, setContactList] = useState<Contact[]>([]);
    const [contactsLoading, setContactsLoading] = useState(false);

    // User search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Comment states
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentContent, setCommentContent] = useState<{ [postId: string]: string }>({});
    const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
    const [commentSubmitting, setCommentSubmitting] = useState<{ [postId: string]: boolean }>({});

    // User stats state
    const [userStats, setUserStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });

    // Global Community Stats State
    const [communityStats, setCommunityStats] = useState({ postsCount: 0, activeUsersCount: 0, newUsersTodayCount: 0 });
    const [trendingTopics, setTrendingTopics] = useState<{ topic: string, count: number }[]>([]);

    // Expert Application State
    const [expertStatus, setExpertStatus] = useState<'none' | 'pending' | 'reviewing' | 'approved' | 'rejected'>('none');
    const [showExpertModal, setShowExpertModal] = useState(false);
    const [expertForm, setExpertForm] = useState({ name: '', field: '', contact: '', reason: '', type: '' });
    const [expertSubmitting, setExpertSubmitting] = useState(false);

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

    // Fetch global community stats
    const fetchCommunityStats = async () => {
        try {
            const [statsRes, trendingRes] = await Promise.all([
                fetch('/api/community/stats'),
                fetch('/api/community/trending')
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                setCommunityStats(data);
            }
            if (trendingRes.ok) {
                const data = await trendingRes.json();
                setTrendingTopics(data.topics || []);
            }
        } catch (err) {
            console.error('Failed to load community stats:', err);
        }
    };

    // Fetch expert application status
    const fetchExpertStatus = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/expert/status');
            if (res.ok) {
                const data = await res.json();
                if (data.application) {
                    setExpertStatus(data.application.status);
                    // Pre-fill form if rejected/pending
                    setExpertForm({
                        name: data.application.name,
                        field: data.application.field,
                        contact: data.application.contact,
                        reason: data.application.reason,
                        type: data.application.type || ''
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load expert status:', err);
        }
    };

    const handleApplyExpert = async () => {
        if (!expertForm.name || !expertForm.field || !expertForm.contact || !expertForm.reason || !expertForm.type) {
            alert('请填写所有必填字段');
            return;
        }

        setExpertSubmitting(true);
        try {
            const res = await fetch('/api/expert/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expertForm)
            });

            const data = await res.json();

            if (res.ok) {
                setExpertStatus('pending');
                setShowExpertModal(false);
                alert('申请提交成功，请等待审核');
            } else {
                alert(data.error || '申请提交失败');
            }
        } catch (err) {
            console.error('Failed to apply:', err);
            alert('申请提交失败，请重试');
        } finally {
            setExpertSubmitting(false);
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

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            // Optional: force reload to clear all states
            window.location.reload();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    // Debounced user search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/user/search?q=${encodeURIComponent(searchQuery.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.users || []);
                }
            } catch (err) {
                console.error('User search failed:', err);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch contacts (followed users) for messaging
    const fetchContacts = async (silent = false) => {
        if (!user) return;
        if (!silent) setContactsLoading(true);
        try {
            const res = await fetch('/api/user/stats');
            if (res.ok) {
                const data = await res.json();
                const followingUsers = data.following || [];
                const contacts: Contact[] = followingUsers.map((u: any) => ({
                    id: u.username,
                    sender: {
                        name: u.nickname || u.username,
                        role: u.role || 'user',
                        abbreviation: (u.nickname || u.username)[0]?.toUpperCase() || 'U',
                        avatar: u.avatar_url || null,
                    },
                    content: '',
                    time: '',
                    unread: u.unreadCount || 0,
                    online: false,
                }));
                setContactList(contacts);
            }
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            if (!silent) setContactsLoading(false);
        }
    };

    // Fetch real messages for the selected chat
    const fetchMessages = async (chatId: string) => {
        if (!user || !chatId) return;
        try {
            const res = await fetch(`/api/community/messages?with=${chatId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => ({
                    ...prev,
                    [chatId]: data.messages || []
                }));
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    // Mark messages as read
    const markAsRead = async (chatId: string) => {
        if (!user || !chatId) return;
        try {
            await fetch('/api/community/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_username: chatId })
            });
            // Update local state to clear unread count
            setContactList(prev => prev.map(c =>
                c.id === chatId ? { ...c, unread: 0 } : c
            ));
        } catch (err) {
            console.error('Failed to mark messages as read:', err);
        }
    };

    // Polling for new messages and unread counts
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (user) {
            // Initial fetch contacts to get unread counts for sidebar
            fetchContacts();

            if (activeFilter === 'message' && selectedChatId) {
                fetchMessages(selectedChatId);
                markAsRead(selectedChatId);
            }

            // Set up polling every 5 seconds (silent)
            interval = setInterval(() => {
                fetchContacts(true); // Always refresh unread counts for global badge
                if (activeFilter === 'message' && selectedChatId) {
                    fetchMessages(selectedChatId);
                    markAsRead(selectedChatId); // Auto-clear if already in chat
                }
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedChatId, activeFilter, user]);

    useEffect(() => {
        if (!loading) {
            fetchPosts();
            fetchUserStats();
            fetchExpertStatus();
            fetchCommunityStats();
            fetchContacts();
        }
    }, [activeFilter, loading]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !selectedChatId || !user) return;

        const content = chatInput.trim();
        setChatInput('');

        try {
            const res = await fetch('/api/community/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiver_username: selectedChatId,
                    content: content
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Optimistically add to local state
                setMessages(prev => ({
                    ...prev,
                    [selectedChatId]: [...(prev[selectedChatId] || []), data.message]
                }));
            } else {
                alert('发送失败，请重试');
                setChatInput(content); // Restore input on error
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('发送失败，请检查网络');
            setChatInput(content);
        }
    };

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
                                    placeholder="搜索用户 (ID/名称)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                />
                                {searchQuery && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[60] py-2">
                                        <div className="px-4 py-2 border-b border-slate-50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">搜索结果</p>
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto">
                                            {searchResults.map((u) => (
                                                <Link
                                                    key={u.username}
                                                    href={`/community/user/${u.username}`}
                                                    onClick={() => setSearchQuery('')}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                        {(u.nickname || u.username)[0].toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-900 text-sm truncate">{u.nickname || u.username}</span>
                                                            {u.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0">专家</span>}
                                                            {u.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0">企业</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-500">@{u.username}</span>
                                                            {u.user_id && <span className="text-xs text-purple-500 font-mono">ID: {u.user_id}</span>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {searchQuery && searchResults.length === 0 && !searchLoading && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 text-center z-[60]">
                                        <p className="text-sm text-slate-500">未找到相关用户</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                            <Link href="/" className="hover:text-purple-600">首页</Link>
                            <Link href="/news" className="hover:text-purple-600">政策资讯</Link>
                            <Link href="/dashboard" className="hover:text-purple-600">数据中台</Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                                    <Link href={`/community/user/${user.username}`} className="flex items-center gap-2 group">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold group-hover:bg-purple-200 transition-colors">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">
                                                {user.nickname || user.username}
                                            </span>
                                            {user.user_id && (
                                                <span className="text-[10px] font-mono text-purple-500 leading-none">ID: {user.user_id}</span>
                                            )}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        退出
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors">
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
                                        <span className="font-medium text-slate-900">{communityStats.postsCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">社区人数</span>
                                        <span className="font-medium text-slate-900">{communityStats.activeUsersCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">今日新增</span>
                                        <span className="font-medium text-slate-900 text-green-600">+{communityStats.newUsersTodayCount}</span>
                                    </div>
                                </div>
                                {!user && (
                                    <Link href="/login" className="mt-6 w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
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
                                    badge={activeFilter !== 'message' ? contactList.reduce((acc, c) => acc + (c.unread || 0), 0) : 0}
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
                                            {user ? "分享你的观点或提问" : "登录后参与讨论..."}
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

                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md border border-purple-100 italic">
                                                                #{post.topic}
                                                            </span>
                                                            {post.tags && post.tags.split(' ').filter((t: string) => t.startsWith('#')).map((tag: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] rounded-md border border-slate-100">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>

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
                                                    placeholder="搜索用户..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm text-slate-900"
                                                />
                                            </div>
                                            {/* Search Results Dropdown */}
                                            {searchQuery.trim() && (
                                                <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                                    {searchLoading ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="animate-spin text-slate-400" size={18} />
                                                            <span className="ml-2 text-sm text-slate-400">搜索中...</span>
                                                        </div>
                                                    ) : searchResults.length > 0 ? (
                                                        searchResults.map((u: any) => (
                                                            <Link
                                                                key={u.username}
                                                                href={`/community/user/${u.username}`}
                                                                className="flex items-center gap-3 p-3 hover:bg-purple-50 transition-colors cursor-pointer border-b border-slate-50 last:border-b-0"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold flex-shrink-0">
                                                                    {(u.nickname || u.username)[0]?.toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium text-slate-900 text-sm truncate">{u.nickname || u.username}</span>
                                                                        {u.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0">专家</span>}
                                                                        {u.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0">企业</span>}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-slate-500">@{u.username}</span>
                                                                        {u.user_id && <span className="text-xs text-purple-500 font-mono">ID: {u.user_id}</span>}
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-4 text-sm text-slate-400">
                                                            未找到相关用户
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {contactsLoading && contactList.length === 0 ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="animate-spin text-slate-400" size={24} />
                                                </div>
                                            ) : contactList.length > 0 ? (
                                                contactList.map(msg => (
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
                                                            {msg.unread > 0 && selectedChatId !== msg.id && (
                                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm min-w-[20px] text-center">
                                                                    {msg.unread > 99 ? '99+' : msg.unread}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`font-medium truncate ${selectedChatId === msg.id ? 'text-purple-900' : 'text-slate-900'}`}>{msg.sender.name}</span>
                                                                {msg.sender.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-medium">专家</span>}
                                                                {msg.sender.role === 'company' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium">企业</span>}
                                                            </div>
                                                            <p className="text-sm text-slate-500 truncate">@{msg.id}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12 text-slate-400 text-sm">
                                                    <p>暂无联系人</p>
                                                    <p className="text-xs mt-1">关注其他用户后将显示在这里</p>
                                                </div>
                                            )}
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
                                                            {contactList.find(m => m.id === selectedChatId)?.sender.name || selectedChatId}
                                                        </div>
                                                        {contactList.find(m => m.id === selectedChatId)?.sender.role === 'expert' &&
                                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">认证专家</span>
                                                        }
                                                        {contactList.find(m => m.id === selectedChatId)?.sender.role === 'company' &&
                                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">企业认证</span>
                                                        }
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-400">
                                                        <button className="hover:text-purple-600 transition-colors"><MoreHorizontal size={20} /></button>
                                                    </div>
                                                </div>

                                                {/* Chat Messages 聊天 */}
                                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                                    {messages[selectedChatId]?.map((msg, idx) => (
                                                        <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${msg.isMe
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-white text-purple-600 border border-purple-100'
                                                                }`}>
                                                                {msg.isMe ? (user ? user.username[0].toUpperCase() : 'ME') : contactList.find(m => m.id === selectedChatId)?.sender.abbreviation}
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
                                                        </div>
                                                        <textarea
                                                            value={chatInput}
                                                            onChange={(e) => setChatInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSendMessage();
                                                                }
                                                            }}
                                                            placeholder="输入消息... (Enter发送)"
                                                            className="w-full px-3 py-2 bg-transparent focus:outline-none text-slate-900 text-sm resize-none h-24"
                                                        />
                                                        <div className="flex justify-between items-center px-2 pb-1">
                                                            <span className="text-xs text-slate-400">Enter 发送</span>
                                                            <button
                                                                onClick={handleSendMessage}
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
                                    {trendingTopics.length > 0 ? trendingTopics.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-slate-600 group-hover:text-purple-600 transition-colors">{item.topic}</span>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                                                {item.count} 讨论
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="text-sm text-slate-500 text-center py-4">
                                            暂无热门话题
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">加入专家计划</h3>
                                    <p className="text-purple-100 text-sm mb-4">认证成为领域专家，获取更多曝光和权益</p>

                                    {expertStatus === 'none' && (
                                        <button
                                            onClick={() => user ? setShowExpertModal(true) : alert('请先登录')}
                                            className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors"
                                        >
                                            立即申请
                                        </button>
                                    )}
                                    {expertStatus === 'pending' && (
                                        <div className="flex flex-col items-start gap-2">
                                            <span className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                审核中
                                            </span>
                                            <button
                                                onClick={() => setShowExpertModal(true)}
                                                className="text-xs text-white/80 hover:text-white underline pl-1"
                                            >
                                                修改申请资料
                                            </button>
                                        </div>
                                    )}
                                    {expertStatus === 'reviewing' && (
                                        <span className="px-4 py-2 bg-blue-400 text-blue-900 rounded-lg text-sm font-bold inline-block">
                                            认证审核中
                                        </span>
                                    )}
                                    {expertStatus === 'approved' && (
                                        <span className="px-4 py-2 bg-green-400 text-green-900 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                                            <Check size={16} />
                                            认证成功
                                        </span>
                                    )}
                                    {expertStatus === 'rejected' && (
                                        <div className="flex flex-col items-start gap-2">
                                            <span className="px-4 py-2 bg-red-400 text-red-900 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                                                <X size={16} />
                                                认证失败
                                            </span>
                                            <button
                                                onClick={() => setShowExpertModal(true)}
                                                className="text-xs text-white/80 hover:text-white underline"
                                            >
                                                重新申请
                                            </button>
                                        </div>
                                    )}
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

                                {/* Topic & Tags */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">选择话题 <span className="text-red-500">*</span></label>
                                        <select
                                            value={postTopic}
                                            onChange={(e) => setPostTopic(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        >
                                            <option value="综合">综合</option>
                                            <option value="问答">问答</option>
                                            <option value="科普">科普</option>
                                            <option value="建议">建议</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">添加标签 (选填)</label>
                                        <input
                                            type="text"
                                            value={postTags}
                                            onChange={(e) => setPostTags(e.target.value)}
                                            placeholder="例如: #新能源汽车 #电池技术"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
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
                                        onClick={async () => {
                                            if (!postTitle.trim() || !postContent.trim()) return;

                                            setSubmitting(true);
                                            try {
                                                const res = await fetch('/api/community/posts', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ title: postTitle, content: postContent, topic: postTopic, tags: postTags })
                                                });

                                                if (res.ok) {
                                                    setShowPostModal(false);
                                                    setPostTitle('');
                                                    setPostContent('');
                                                    setPostTopic('综合');
                                                    setPostTags('');
                                                    // Refresh posts
                                                    fetchPosts();
                                                    // Update stats
                                                    fetchUserStats();
                                                    fetchCommunityStats();
                                                } else {
                                                    alert('发布失败,请重试');
                                                }
                                            } catch (err) {
                                                console.error('Failed to create post:', err);
                                                alert('发布失败,请重试');
                                            } finally {
                                                setSubmitting(false);
                                            }
                                        }}
                                        disabled={submitting || !postTitle.trim() || !postContent.trim()}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 ml-auto"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        发布
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expert Application Modal */}
                {showExpertModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowExpertModal(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">申请成为认证专家</h3>
                                <button onClick={() => setShowExpertModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">真实姓名</label>
                                    <input
                                        type="text"
                                        value={expertForm.name}
                                        onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="请输入您的真实姓名"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">认证类型</label>
                                    <select
                                        value={expertForm.type}
                                        onChange={(e) => setExpertForm({ ...expertForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="">请选择类型...</option>
                                        <option value="individual">个人专家</option>
                                        <option value="enterprise">企业认证</option>
                                        <option value="organization">机构认证</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">专业领域</label>
                                    <select
                                        value={expertForm.field}
                                        onChange={(e) => setExpertForm({ ...expertForm, field: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    >
                                        <option value="">请选择领域...</option>
                                        <option value="电池材料">电池材料</option>
                                        <option value="回收工艺">回收工艺</option>
                                        <option value="环保政策">环保政策</option>
                                        <option value="新能源应用">新能源应用</option>
                                        <option value="其他">其他</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">联系方式</label>
                                    <input
                                        type="text"
                                        value={expertForm.contact}
                                        onChange={(e) => setExpertForm({ ...expertForm, contact: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="手机号或邮箱"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">申请理由 / 资质说明</label>
                                    <textarea
                                        value={expertForm.reason}
                                        onChange={(e) => setExpertForm({ ...expertForm, reason: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-32"
                                        placeholder="请简要介绍您的专业背景和申请理由..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowExpertModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={handleApplyExpert}
                                        disabled={expertSubmitting}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                                    >
                                        {expertSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        提交申请
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div >
        </AuroraBackground >
    );
}
function NavItem({ icon, label, active = false, onClick, badge }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, badge?: number }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'
                }`}>
            <div className="flex items-center gap-3">
                {icon}
                {label}
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </button>
    )
}


