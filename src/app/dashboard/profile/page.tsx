"use client";

import { useState, useEffect } from "react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { PROVINCES } from "@/data/regions";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationType, setVerificationType] = useState<'expert' | 'company' | ''>('');
    const [verificationData, setVerificationData] = useState({
        realName: '',
        idNumber: '',
        companyName: '',
        businessLicense: '',
        expertise: '',
        credentials: ''
    });

    // Preset avatars using emoji and gradients
    const PRESET_AVATARS = [
        { id: 1, emoji: '😊', gradient: 'from-emerald-400 to-teal-400' },
        { id: 2, emoji: '🌟', gradient: 'from-yellow-400 to-orange-400' },
        { id: 3, emoji: '🌿', gradient: 'from-green-400 to-lime-400' },
        { id: 4, emoji: '🚀', gradient: 'from-blue-400 to-cyan-400' },
        { id: 5, emoji: '🎨', gradient: 'from-purple-400 to-pink-400' },
        { id: 6, emoji: '💡', gradient: 'from-amber-400 to-yellow-400' },
        { id: 7, emoji: '🌈', gradient: 'from-pink-400 to-purple-400' },
        { id: 8, emoji: '⚡', gradient: 'from-cyan-400 to-blue-400' },
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    // Parse location when profile loads or editing starts
    useEffect(() => {
        if (profile?.location && editing) {
            // Try to parse "省份 城市" format
            const parts = profile.location.split(' ');
            if (parts.length >= 2) {
                const province = PROVINCES.find(p => p.name === parts[0]);
                if (province) {
                    setSelectedProvince(province.name);
                    setAvailableCities(province.cities);
                    setSelectedCity(parts[1] || '');
                }
            }
        }
    }, [profile, editing]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/user/profile');
            const data = await res.json();
            if (data.profile) {
                setProfile(data.profile);
                setFormData(data.profile);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out empty string values to avoid overwriting with blanks
            const updates: any = {};
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined && value !== '') {
                    // Only trim if it's a string
                    if (typeof value === 'string' && value.trim() === '') {
                        return; // Skip empty strings
                    }
                    updates[key] = value;
                }
            });

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (data.profile) {
                setProfile(data.profile);
                setFormData(data.profile);
                setEditing(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">个人中心</h1>
                    <p className="text-slate-500 mt-2">管理您的个人信息和偏好设置</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-8">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 text-3xl font-bold mb-4 overflow-hidden">
                                    {(() => {
                                        const avatarUrl = editing ? formData?.avatar_url : profile?.avatar_url;
                                        if (avatarUrl?.startsWith('preset-')) {
                                            const presetId = parseInt(avatarUrl.replace('preset-', ''));
                                            const preset = PRESET_AVATARS.find(a => a.id === presetId);
                                            if (preset) {
                                                return (
                                                    <div className={`w-full h-full bg-gradient-to-br ${preset.gradient} flex items-center justify-center text-5xl`}>
                                                        {preset.emoji}
                                                    </div>
                                                );
                                            }
                                        } else if (avatarUrl && avatarUrl.startsWith('data:')) {
                                            return <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />;
                                        } else if (avatarUrl) {
                                            return <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
                                        }
                                        return <span>{(editing ? formData?.username : profile?.username)?.[0]?.toUpperCase() || 'U'}</span>;
                                    })()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{(editing ? formData?.nickname : profile?.nickname) || profile?.username}</h2>
                                <p className="text-sm text-slate-500 mt-1">@{profile?.username}</p>

                                {/* Verification Status */}
                                <div className="mt-3 space-y-2">
                                    {profile?.verification_status === 'verified' && (
                                        <div>
                                            {profile?.verification_type === 'expert' && (
                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                                                    ✓ 认证专家
                                                </span>
                                            )}
                                            {profile?.verification_type === 'company' && (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                                                    ✓ 企业认证
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {profile?.verification_status === 'pending' && (
                                        <span className="inline-block bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-medium">
                                            审核中...
                                        </span>
                                    )}
                                    {(!profile?.verification_status || profile?.verification_status === 'none') && (
                                        <button
                                            onClick={() => setShowVerificationModal(true)}
                                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            申请认证
                                        </button>
                                    )}
                                </div>

                                <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar size={16} />
                                        <span>加入于 {new Date(profile?.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">基本信息</h3>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        编辑资料
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData(profile);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                                        >
                                            <X size={16} />
                                            取消
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {saving ? '保存中...' : '保存'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <FormField
                                    label="昵称"
                                    icon={<User size={18} />}
                                    value={formData?.nickname || ''}
                                    displayValue={profile?.nickname}
                                    onChange={(val: string) => setFormData({ ...formData, nickname: val })}
                                    editing={editing}
                                    placeholder="设置您的昵称"
                                />


                                {/* Avatar Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <User size={18} className="text-slate-400" />
                                        头像
                                    </label>
                                    {editing ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowAvatarModal(true)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-left text-slate-600 flex items-center justify-between"
                                        >
                                            <span>{formData?.avatar_url ? '已选择头像' : '点击选择头像'}</span>
                                            <Edit2 size={16} />
                                        </button>
                                    ) : (
                                        <p className="text-slate-600 px-4 py-3 bg-slate-50 rounded-xl">
                                            {profile?.avatar_url ? '已设置' : '未设置'}
                                        </p>
                                    )}
                                </div>

                                <FormField
                                    label="邮箱"
                                    icon={<Mail size={18} />}
                                    value={formData?.email || ''}
                                    displayValue={profile?.email}
                                    onChange={(val: string) => setFormData({ ...formData, email: val })}
                                    editing={editing}
                                    placeholder="your@email.com"
                                />

                                <FormField
                                    label="手机号"
                                    icon={<Phone size={18} />}
                                    value={formData?.phone || ''}
                                    displayValue={profile?.phone}
                                    onChange={(val: string) => {
                                        // Only allow digits and limit to 11 characters
                                        const cleaned = val.replace(/\D/g, '').slice(0, 11);
                                        setFormData({ ...formData, phone: cleaned });
                                    }}
                                    editing={editing}
                                    placeholder="13800138000"
                                    type="tel"
                                    maxLength={11}
                                />

                                <FormField
                                    label="生日"
                                    icon={<Calendar size={18} />}
                                    value={formData?.birthday || ''}
                                    displayValue={profile?.birthday}
                                    onChange={(val: string) => setFormData({ ...formData, birthday: val })}
                                    editing={editing}
                                    placeholder="YYYY-MM-DD"
                                    type="date"
                                />

                                {/* Location Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <MapPin size={18} className="text-slate-400" />
                                        所在地
                                    </label>
                                    {editing ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={selectedProvince}
                                                onChange={(e) => {
                                                    const provinceName = e.target.value;
                                                    setSelectedProvince(provinceName);
                                                    const province = PROVINCES.find(p => p.name === provinceName);
                                                    if (province) {
                                                        setAvailableCities(province.cities);
                                                        setSelectedCity('');
                                                        setFormData({ ...formData, location: '' });
                                                    }
                                                }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900"
                                            >
                                                <option value="">选择省份</option>
                                                {PROVINCES.map(province => (
                                                    <option key={province.code} value={province.name}>{province.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => {
                                                    const city = e.target.value;
                                                    setSelectedCity(city);
                                                    if (selectedProvince && city) {
                                                        setFormData({ ...formData, location: `${selectedProvince} ${city}` });
                                                    }
                                                }}
                                                disabled={!selectedProvince}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">选择城市</option>
                                                {availableCities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 px-4 py-3 bg-slate-50 rounded-xl">
                                            {profile?.location || '未设置'}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <User size={18} className="text-slate-400" />
                                        个人简介
                                    </label>
                                    {editing ? (
                                        <textarea
                                            value={formData?.bio || ''}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-slate-900"
                                            rows={4}
                                            placeholder="介绍一下自己..."
                                        />
                                    ) : (
                                        <p className="text-slate-600 px-4 py-3 bg-slate-50 rounded-xl min-h-[100px]">
                                            {profile?.bio || '暂无简介'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Avatar Selection Modal */}
                {showAvatarModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAvatarModal(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">选择头像</h3>
                                <button onClick={() => setShowAvatarModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Preset Avatars */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-slate-700 mb-3">预设头像</h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {PRESET_AVATARS.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => {
                                                setFormData({ ...formData, avatar_url: `preset-${avatar.id}` });
                                                setShowAvatarModal(false);
                                            }}
                                            className={`w-full aspect-square rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-4xl hover:scale-110 transition-transform ${formData?.avatar_url === `preset-${avatar.id}` ? 'ring-4 ring-emerald-500' : ''
                                                }`}
                                        >
                                            {avatar.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-3">上传图片</h4>
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setUploadingAvatar(true);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, avatar_url: reader.result as string });
                                                    setUploadingAvatar(false);
                                                    setShowAvatarModal(false);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="avatar-upload"
                                    />
                                    <div className="w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer text-center text-slate-600">
                                        {uploadingAvatar ? '上传中...' : '点击上传图片'}
                                    </div>
                                </label>
                                <p className="text-xs text-slate-500 mt-2">支持 JPG、PNG 格式</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Modal */}
                {showVerificationModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowVerificationModal(false)}>
                        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">身份认证申请</h3>
                                <button onClick={() => setShowVerificationModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            {!verificationType ? (
                                <div className="space-y-4">
                                    <p className="text-slate-600 mb-6">请选择您要申请的认证类型:</p>
                                    <button
                                        onClick={() => setVerificationType('expert')}
                                        className="w-full p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">🎓</span>
                                            <h4 className="text-lg font-bold text-emerald-700">专家认证</h4>
                                        </div>
                                        <p className="text-sm text-slate-600">适用于行业专家、技术人员、研究人员等专业人士</p>
                                    </button>
                                    <button
                                        onClick={() => setVerificationType('company')}
                                        className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">🏢</span>
                                            <h4 className="text-lg font-bold text-blue-700">企业认证</h4>
                                        </div>
                                        <p className="text-sm text-slate-600">适用于电池回收企业、新能源公司等机构</p>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setVerificationType('')}
                                        className="text-sm text-slate-600 hover:text-slate-900 mb-4"
                                    >
                                        ← 返回选择
                                    </button>

                                    {verificationType === 'expert' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">真实姓名 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.realName}
                                                    onChange={(e) => setVerificationData({ ...verificationData, realName: e.target.value })}
                                                    placeholder="请输入真实姓名"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">身份证号 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.idNumber}
                                                    onChange={(e) => setVerificationData({ ...verificationData, idNumber: e.target.value })}
                                                    placeholder="请输入身份证号"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900"
                                                    maxLength={18}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">专业领域 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.expertise}
                                                    onChange={(e) => setVerificationData({ ...verificationData, expertise: e.target.value })}
                                                    placeholder="例如:电池回收技术、新能源材料等"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">资质证明</label>
                                                <textarea
                                                    value={verificationData.credentials}
                                                    onChange={(e) => setVerificationData({ ...verificationData, credentials: e.target.value })}
                                                    placeholder="请简述您的专业背景、工作经历、学历证书等"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 resize-none"
                                                    rows={4}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">企业名称 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.companyName}
                                                    onChange={(e) => setVerificationData({ ...verificationData, companyName: e.target.value })}
                                                    placeholder="请输入企业全称"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">统一社会信用代码 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.businessLicense}
                                                    onChange={(e) => setVerificationData({ ...verificationData, businessLicense: e.target.value })}
                                                    placeholder="请输入18位统一社会信用代码"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                                                    maxLength={18}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">联系人姓名 *</label>
                                                <input
                                                    type="text"
                                                    value={verificationData.realName}
                                                    onChange={(e) => setVerificationData({ ...verificationData, realName: e.target.value })}
                                                    placeholder="请输入联系人姓名"
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => {
                                                setShowVerificationModal(false);
                                                setVerificationType('');
                                                setVerificationData({
                                                    realName: '',
                                                    idNumber: '',
                                                    companyName: '',
                                                    businessLicense: '',
                                                    expertise: '',
                                                    credentials: ''
                                                });
                                            }}
                                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={() => {
                                                // TODO: Submit verification request
                                                alert('认证申请已提交,我们将在3-5个工作日内完成审核');
                                                setShowVerificationModal(false);
                                                setVerificationType('');
                                            }}
                                            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                                        >
                                            提交申请
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormField({ label, icon, value, displayValue, onChange, editing, placeholder, type = "text", maxLength }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className="text-slate-400">{icon}</span>
                {label}
            </label>
            {editing ? (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={maxLength}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900"
                    placeholder={placeholder}
                />
            ) : (
                <p className="text-slate-600 px-4 py-3 bg-slate-50 rounded-xl">
                    {displayValue || '未设置'}
                </p>
            )}
        </div>
    );
}
