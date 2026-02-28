import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { searchUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 1) {
            return NextResponse.json({ success: true, users: [] });
        }

        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');
        const currentUsername = authToken?.value || undefined;

        const users = searchUsers(query, currentUsername);

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('Search users error:', error);
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        );
    }
}
