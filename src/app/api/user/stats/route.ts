import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserStats, getUserFollowers, getUserFollowing } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        // Allow querying any user's stats via ?username=xxx
        const { searchParams } = new URL(request.url);
        const targetUsername = searchParams.get('username');

        // If no target specified, use logged-in user
        const username = targetUsername || authToken?.value;

        if (!username) {
            return NextResponse.json(
                { error: 'Username required' },
                { status: 400 }
            );
        }

        const stats = getUserStats(username);
        const followers = getUserFollowers(username);
        let following = getUserFollowing(username);

        // If the requester is the user themselves, add unread counts
        if (authToken?.value === username) {
            following = following.map((u: any) => ({
                ...u,
                unreadCount: require('@/lib/db').getUnreadMessageCount(username, u.username)
            }));
        }

        return NextResponse.json({
            success: true,
            stats,
            followers,
            following,
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        );
    }
}
