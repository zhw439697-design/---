"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/AuroraBackground";
import { POSTS_DATA } from "@/data/posts";
import Link from "next/link";
import { MessageSquare, Heart, Share2, ArrowLeft, User, Calendar, MapPin } from "lucide-react";

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = Array.isArray(params.username) ? params.username[0] : params.username || '';

    const [currentUser, setCurrentUser] = useState<{ username: string, role: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showAllFollowers, setShowAllFollowers] = useState(false);
    const [showAllFollowing, setShowAllFollowing] = useState(false);

    // Mock user data - in real app, fetch from API
    // Use useMemo to keep counts stable across re-renders
    const profileUser = useMemo(() => {
        // Generate consistent random numbers based on username
        const hashCode = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            username: username,
            nickname: username === 'TechGeek_01' ? '技术极客' : username === 'GreenEnergy_Co' ? '绿色能源公司' : username,
            role: username === 'TechGeek_01' ? 'expert' : username === 'GreenEnergy_Co' ? 'company' : 'user',
            bio: username === 'TechGeek_01'
                ? '专注于电池回收技术研究,致力于推动行业可持续发展'
                : username === 'GreenEnergy_Co'
                    ? '专业的电池回收企业,提供一站式回收解决方案'
                    : '热爱环保,关注新能源发展',
            location: '山西省 太原市',
            joinDate: '2026/2/7',
            postsCount: POSTS_DATA.filter(p => p.author.name === username).length,
            followersCount: (hashCode % 900) + 100,  // Consistent 100-999
            followingCount: (hashCode % 450) + 50,   // Consistent 50-499
        };
    }, [username]);

    const userPosts = POSTS_DATA.filter(p => p.author.name === username);

    // Generate mock followers and following data to match the counts
    const mockFollowers = useMemo(() => {
        const baseFollowers = [
            { username: 'User_001', nickname: '环保达人', role: 'user' as const },
            { username: 'Expert_Li', nickname: '李工', role: 'expert' as const },
            { username: 'Company_A', nickname: 'A公司', role: 'company' as const },
            { username: 'GreenTech_Fan', nickname: '绿色科技爱好者', role: 'user' as const },
            { username: 'Dr_Wang', nickname: '王博士', role: 'expert' as const },
            { username: 'EcoWarrior_88', nickname: '环保战士', role: 'user' as const },
            { username: 'BatteryExpert', nickname: '电池专家张', role: 'expert' as const },
            { username: 'RecycleKing', nickname: '回收之王', role: 'user' as const },
            { username: 'CleanEnergy_Co', nickname: '清洁能源公司', role: 'company' as const },
            { username: 'TechEnthusiast', nickname: '技术爱好者', role: 'user' as const },
        ];

        // Generate additional followers to match the count
        const additionalCount = Math.max(0, profileUser.followersCount - baseFollowers.length);
        const roles = ['user', 'expert', 'company'] as const;
        const prefixes = ['Eco', 'Green', 'Tech', 'Battery', 'Energy', 'Climate', 'Sustain', 'Recycle', 'Clean', 'Smart'];
        const suffixes = ['Fan', 'Pro', 'Expert', 'Lover', 'Enthusiast', 'Advocate', 'Pioneer', 'Leader', 'Master', 'Guru'];

        for (let i = 0; i < additionalCount; i++) {
            const role = roles[i % roles.length];
            const prefix = prefixes[i % prefixes.length];
            const suffix = suffixes[Math.floor(i / prefixes.length) % suffixes.length];
            const username = `${prefix}_${suffix}_${i + 1}`;
            const nickname = role === 'expert' ? `专家${i + 1}号` : role === 'company' ? `企业${i + 1}` : `用户${i + 1}`;

            baseFollowers.push({ username, nickname, role });
        }

        return baseFollowers;
    }, [profileUser.followersCount]);

    const mockFollowing = useMemo(() => {
        const baseFollowing = [
            { username: 'TechGeek_01', nickname: '技术极客', role: 'expert' as const },
            { username: 'GreenEnergy_Co', nickname: '绿色能源', role: 'company' as const },
            { username: 'BatteryPro_2024', nickname: '电池专业人士', role: 'expert' as const },
            { username: 'EcoNews_Daily', nickname: '环保日报', role: 'company' as const },
            { username: 'ClimateAction', nickname: '气候行动', role: 'user' as const },
            { username: 'Dr_Zhang_EV', nickname: '张博士-电动车', role: 'expert' as const },
            { username: 'Renewable_Energy', nickname: '可再生能源研究', role: 'expert' as const },
            { username: 'GreenCity_Project', nickname: '绿色城市项目', role: 'company' as const },
        ];

        // Generate additional following to match the count
        const additionalCount = Math.max(0, profileUser.followingCount - baseFollowing.length);
        const roles = ['user', 'expert', 'company'] as const;
        const topics = ['电池', '能源', '环保', '科技', '回收', '可持续', '绿色', '清洁'];

        for (let i = 0; i < additionalCount; i++) {
            const role = roles[i % roles.length];
            const topic = topics[i % topics.length];
            const username = `${topic}_User_${i + 1}`;
            const nickname = role === 'expert' ? `${topic}专家` : role === 'company' ? `${topic}公司` : `${topic}爱好者`;

            baseFollowing.push({ username, nickname, role });
        }

        return baseFollowing;
    }, [profileUser.followingCount]);

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

        try {
            const res = await fetch('/api/user/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUsername: username })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.isFollowing);
            } else {
                // Revert on error
                setIsFollowing(previousState);
                alert('操作失败,请重试');
            }
        } catch (err) {
            console.error('Failed to toggle follow:', err);
            // Revert on error
            setIsFollowing(previousState);
        }
    };

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
                                    <p className="text-slate-500 mb-4">@{username}</p>
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
                                            <span className="font-bold text-slate-900">{profileUser.postsCount}</span>
                                            <span className="text-slate-600 ml-1">帖子</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('followers')}
                                            className="hover:text-purple-600 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900">{profileUser.followersCount}</span>
                                            <span className="text-slate-600 ml-1">粉丝</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('following')}
                                            className="hover:text-purple-600 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900">{profileUser.followingCount}</span>
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
                                    帖子 ({profileUser.postsCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('followers')}
                                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'followers'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    粉丝 ({profileUser.followersCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('following')}
                                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'following'
                                        ? 'text-purple-600 border-b-2 border-purple-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    关注 ({profileUser.followingCount})
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
                                    {(showAllFollowers ? mockFollowers : mockFollowers.slice(0, 5)).map(follower => (
                                        <Link key={follower.username} href={`/community/user/${follower.username}`}>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold">
                                                        {follower.username[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-900">{follower.nickname}</span>
                                                            {follower.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">专家</span>}
                                                            {follower.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">企业</span>}
                                                        </div>
                                                        <span className="text-sm text-slate-500">@{follower.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {mockFollowers.length > 5 && (
                                        <button
                                            onClick={() => setShowAllFollowers(!showAllFollowers)}
                                            className="w-full py-3 text-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                        >
                                            {showAllFollowers ? '收起' : `展示全部 (${mockFollowers.length})`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'following' && (
                                <div className="space-y-3">
                                    {(showAllFollowing ? mockFollowing : mockFollowing.slice(0, 5)).map(following => (
                                        <Link key={following.username} href={`/community/user/${following.username}`}>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold">
                                                        {following.username[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-900">{following.nickname}</span>
                                                            {following.role === 'expert' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">专家</span>}
                                                            {following.role === 'company' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">企业</span>}
                                                        </div>
                                                        <span className="text-sm text-slate-500">@{following.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {mockFollowing.length > 5 && (
                                        <button
                                            onClick={() => setShowAllFollowing(!showAllFollowing)}
                                            className="w-full py-3 text-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                        >
                                            {showAllFollowing ? '收起' : `展示全部 (${mockFollowing.length})`}
                                        </button>
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
