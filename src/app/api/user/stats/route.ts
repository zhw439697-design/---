import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserStats } from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const username = authToken.value;
        const stats = getUserStats(username);

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        );
    }
}
