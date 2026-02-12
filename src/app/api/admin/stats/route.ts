import { NextResponse } from 'next/server';
import { getAllUsers, getAllExpertApplications, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) return false;

    // Simple check: fetch user and check role
    const user: any = getUser(token.value);
    return user && user.role === 'admin';
}

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users: any[] = getAllUsers();
        const applications: any[] = getAllExpertApplications();

        const stats = {
            totalUsers: users.length,
            totalApplications: applications.length,
            pendingApplications: applications.filter(a => a.status === 'pending').length,
            approvedExperts: applications.filter(a => a.status === 'approved').length,
            rejectedApplications: applications.filter(a => a.status === 'rejected').length,
            // Simple logic for "Active Today": users created today OR applications created today
            // In a real app we'd track login/activity timestamps
            todayActivity: 0
        };

        // Calculate today's activity (new users + new applications)
        const today = new Date().toISOString().split('T')[0];
        const newUsersToday = users.filter((u: any) => u.created_at && u.created_at.startsWith(today)).length;
        const newAppsToday = applications.filter((a: any) => a.created_at && a.created_at.startsWith(today)).length;

        stats.todayActivity = newUsersToday + newAppsToday;

        return NextResponse.json({ stats });

    } catch (error) {
        console.error('Get admin stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
