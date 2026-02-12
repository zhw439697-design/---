'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        {
            title: '仪表盘',
            icon: <LayoutDashboard size={20} />,
            href: '/admin',
            exact: true
        },
        {
            title: '专家审核',
            icon: <ShieldCheck size={20} />,
            href: '/admin/experts',
            exact: false
        },
        {
            title: '用户管理',
            icon: <Users size={20} />,
            href: '/admin/users',
            exact: false,
            disabled: false
        },
        {
            title: '内容审核',
            icon: <FileText size={20} />,
            href: '/admin/content',
            exact: false,
            disabled: false
        },
        {
            title: '系统设置',
            icon: <Settings size={20} />,
            href: '/admin/settings',
            exact: false,
            disabled: true
        }
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'w-64' : 'w-20'} 
                    ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                        {isSidebarOpen ? (
                            <Link href="/" className="font-bold text-xl tracking-wider text-purple-400">
                                智链后台
                            </Link>
                        ) : (
                            <Link href="/" className="font-bold text-xl text-purple-400 mx-auto">
                                Z
                            </Link>
                        )}
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                        {menuItems.map((item, index) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            if (item.disabled) {
                                return (
                                    <div
                                        key={index}
                                        className={`
                                            flex items-center px-3 py-3 rounded-xl cursor-not-allowed opacity-50
                                            ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                                        `}
                                    >
                                        <div className="text-slate-400">{item.icon}</div>
                                        {isSidebarOpen && (
                                            <span className="ml-3 text-sm font-medium text-slate-400">{item.title}</span>
                                        )}
                                        {isSidebarOpen && (
                                            <span className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                                                开发中
                                            </span>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`
                                        flex items-center px-3 py-3 rounded-xl transition-colors group relative
                                        ${isActive
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }
                                        ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                                    `}
                                >
                                    <div className={`${isActive ? 'text-white' : 'group-hover:text-white'}`}>
                                        {item.icon}
                                    </div>
                                    {isSidebarOpen && (
                                        <span className="ml-3 text-sm font-medium">{item.title}</span>
                                    )}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                            {item.title}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="border-t border-slate-700 p-4">
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors
                                ${isSidebarOpen ? 'justify-start' : 'justify-center'}
                            `}
                        >
                            <LogOut size={20} />
                            {isSidebarOpen && (
                                <span className="ml-3 text-sm font-medium">退出登录</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main
                className={`
                    flex-1 transition-all duration-300 ease-in-out min-h-screen
                    ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-20'}
                    ${isMobile ? 'ml-0' : ''}
                `}
            >
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 lg:hidden sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-600 hover:text-slate-900"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-lg text-slate-800">管理后台</span>
                </header>

                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
