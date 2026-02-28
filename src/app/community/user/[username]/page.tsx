"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/AuroraBackground";
import { POSTS_DATA } from "@/data/posts";
import Link from "next/link";
import { MessageSquare, Heart, Share2, ArrowLeft, User, Calendar, MapPin, Loader2 } from "lucide-react";

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = Array.isArray(params.username) ? params.username[0] : params.username || '';

    const [currentUser, setCurrentUser] = useState<{ username: string, role: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showAllFollowers, setShowAllFollowers] = useState(false);
    const [showAllFollowing, setShowAllFollowing] = useState(false);

    // Real data from API
    const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
    const [followers, setFollowers] = useState<any[]>([]);
    const [following, setFollowing] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [userIdNumber, setUserIdNumber] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [realPosts, setRealPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    // Profile info derived from real data with fallbacks
    const profileUser = {
        username: username,
        nickname: profileData?.nickname || (username === 'TechGeek_01' ? '技术极客' : username === 'GreenEnergy_Co' ? '绿色能源公司' : username),
        role: profileData?.role || (username === 'TechGeek_01' ? 'expert' : username === 'GreenEnergy_Co' ? 'company' : 'user'),
        bio: profileData?.bio || (username === 'TechGeek_01'
            ? '专注于电池回收技术研究,致力于推动行业可持续发展'
            : username === 'GreenEnergy_Co'
                ? '专业的电池回收企业,提供一站式回收解决方案'
                : '热爱环保,关注新能源发展'),
        location: profileData?.location || '山西省 太原市',
        joinDate: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : '2026/2/7',
    };

    const userPosts = realPosts.length > 0 ? realPosts : POSTS_DATA.filter(p => p.author.name === username);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setCurrentUser(data.user);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Fetch user profile data (including user_id)
    useEffect(() => {
        fetch(`/api/user/profile?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.profile) {
                    setProfileData(data.profile);
                    setUserIdNumber(data.profile.user_id || null);
                }
            })
            .catch(err => console.error('Failed to fetch profile:', err));
    }, [username]);

    // Fetch real user posts
    useEffect(() => {
        setPostsLoading(true);
        fetch(`/api/community/posts?filter=user&username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRealPosts(data.posts);
                }
            })
            .catch(err => console.error('Failed to fetch user posts:', err))
            .finally(() => setPostsLoading(false));
    }, [username]);

    // Fetch real stats from API
    useEffect(() => {
        setStatsLoading(true);
        fetch(`/api/user/stats?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStats({
                        postsCount: data.stats?.postsCount ?? userPosts.length,
                        followersCount: data.stats?.followersCount ?? 0,
                        followingCount: data.stats?.followingCount ?? 0,
                    });
                    setFollowers(data.followers || []);
                    setFollowing(data.following || []);
                }
            })
            .catch(err => console.error('Failed to fetch user stats:', err))
            .finally(() => setStatsLoading(false));
    }, [username]);

    // Fetch follow status
    useEffect(() => {
        if (currentUser && currentUser.username !== username) {
            fetch(`/api/user/follow?targetUsername=${username}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setIsFollowing(data.isFollowing);
                    }
                })
                .catch(err => console.error('Failed to fetch follow status:', err));
        }
    }, [currentUser, username]);

    const handleFollow = async () => {
        if (!currentUser) {
            alert('请先登录');
            return;
        }

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(!isFollowing);
        setStats(prev => ({
            ...prev,
            followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
        }));

        try {
            const res = await fetch('/api/user/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: username })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.isFollowing);
                // Refresh stats
                const statsRes = await fetch(`/api/user/stats?username=${username}`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats({
                        postsCount: statsData.stats?.postsCount ?? userPosts.length,
                        followersCount: statsData.stats?.followersCount ?? 0,
                        followingCount: statsData.stats?.followingCount ?? 0,
                    });
                    setFollowers(statsData.followers || []);
                    setFollowing(statsData.following || []);
                }
            } else {
                // Revert on error
                setIsFollowing(previousState);
                setStats(prev => ({
                    ...prev,
                    followersCount: isFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
                }));
                alert('操作失败,请重试');
            }
        } catch (err) {
            console.error('Failed to toggle follow:', err);
            // Revert on error
            setIsFollowing(previousState);
            setStats(prev => ({
                ...prev,
                followersCount: isFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
            }));
        }
    };

    // Use real post count: max of DB count and POSTS_DATA count
    const postsCount = Math.max(stats.postsCount, userPosts.length);

    return (
        <AuroraBackground theme="light">
            <div className="w-full min-h-screen relative z-10">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-purple-100">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            智链绿能
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

                        {/* Profile Header */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-slate-100 shadow-sm mb-6">
                            <div className="flex items-start gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-3xl flex-shrink-0">
                                    {username[0]?.toUpperCase()}
                                </div>

                                {/* User Info */}
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-slate-900">{profileUser.nickname}</h1>
                                        {profileUser.role === 'expert' && (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium">
                                                ✓ 认证专家
                                            </span>
                                        )}
                                        {profileUser.role === 'company' && (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                ✓ 企业认证
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <p className="text-slate-500">@{username}</p>
                                        {userIdNumber && (
                                            <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full font-mono border border-purple-200">
                                                ID: {userIdNumber}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-700 mb-4">{profileUser.bio}</p>

                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            <span>{profileUser.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>加入于 {new Date(profileUser.joinDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 mb-4">
                                        <button
                                            onClick={() => setActiveTab('posts')}
                                            className="hover:text-purple-600 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900">{postsCount}</span>
                                            <span className="text-slate-600 ml-1">帖子</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('followers')}
                                            className="hover:text-purple-600 transition-colors"
                                        >
                                            {statsLoading ? (
                                                <span className="inline-block w-6 h-5 bg-slate-200 rounded animate-pulse"></span>
                                            ) : (
                                                <span className="font-bold text-slate-900">{stats.followersCount}</span>
                                            )}
                                            <span className="text-slate-600 ml-1">粉丝</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('following')}
                                            className="hover:text-purple-600 transition-colors"
                                        >
                                            {statsLoading ? (
                                                <span className="inline-block w-6 h-5 bg-slate-200 rounded animate-pulse"></span>
                                            ) : (
                                                <span className="font-bold text-slate-900">{stats.followingCount}</span>
                                            )}
                                            <span className="text-slate-600 ml-1">关注</span>
                                        </button>
                                    </div>

                                    {/* Follow Button */}
                                    {currentUser && currentUser.username !== username && (
                                        <button
                                            onClick={handleFollow}
                                            className={`px-6 py-2 rounded-xl font-medium transition-colors ${isFollowing
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                }`}
                                        >
                                            {isFollowing ? '已关注' : '关注'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs Content */}
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-100 shadow-sm">
                            {/* Tab Headers */}
                            <div className="flex gap-6 border-b border-slate-200 mb-6">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'posts'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    帖子 ({postsCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('followers')}
                                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'followers'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    粉丝 ({statsLoading ? '...' : stats.followersCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('following')}
                                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'following'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    关注 ({statsLoading ? '...' : stats.followingCount})
                                </button>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'posts' && (
                                <div className="space-y-4">
                                    {userPosts.length > 0 ? (
                                        userPosts.map(post => (
                                            <Link key={post.id} href={`/community/${post.id}`}>
                                                <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                                    <h3 className="font-bold text-slate-900 mb-2">{post.title}</h3>
                                                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                                                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare size={14} /> {post.comments}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Heart size={14} /> {post.likes}
                                                        </span>
                                                        <span className="text-slate-400 ml-auto">{post.date}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            暂无帖子
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'followers' && (
                                <div className="space-y-3">
                                    {statsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-slate-400" size={24} />
                                        </div>
                                    ) : followers.length > 0 ? (
                                        <>
                                            {(showAllFollowers ? followers : followers.slice(0, 5)).map(follower => (
                                                <Link key={follower.username} href={`/community/user/${follower.username}`}>
                                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold">
                                                                {follower.username[0]}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-900">{follower.nickname || follower.username}</span>
                                                                    {follower.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">专家</span>}
                                                                    {follower.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">企业</span>}
                                                                </div>
                                                                <span className="text-sm text-slate-500">@{follower.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            {followers.length > 5 && (
                                                <button
                                                    onClick={() => setShowAllFollowers(!showAllFollowers)}
                                                    className="w-full py-3 text-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                                >
                                                    {showAllFollowers ? '收起' : `展示全部 (${followers.length})`}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            暂无粉丝
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'following' && (
                                <div className="space-y-3">
                                    {statsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-slate-400" size={24} />
                                        </div>
                                    ) : following.length > 0 ? (
                                        <>
                                            {(showAllFollowing ? following : following.slice(0, 5)).map(user => (
                                                <Link key={user.username} href={`/community/user/${user.username}`}>
                                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold">
                                                                {user.username[0]}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-900">{user.nickname || user.username}</span>
                                                                    {user.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">专家</span>}
                                                                    {user.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">企业</span>}
                                                                </div>
                                                                <span className="text-sm text-slate-500">@{user.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            {following.length > 5 && (
                                                <button
                                                    onClick={() => setShowAllFollowing(!showAllFollowing)}
                                                    className="w-full py-3 text-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                                >
                                                    {showAllFollowing ? '收起' : `展示全部 (${following.length})`}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            暂无关注
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuroraBackground>
    );
}
