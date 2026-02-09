import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { toggleUserFollow, isUserFollowing } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Get current user from auth_token
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const followerUsername = authToken.value;
        const { targetUsername } = await request.json();

        if (!targetUsername) {
            return NextResponse.json(
                { error: 'Target username is required' },
                { status: 400 }
            );
        }

        // Prevent self-follow
        if (followerUsername === targetUsername) {
            return NextResponse.json(
                { error: 'Cannot follow yourself' },
                { status: 400 }
            );
        }

        const result = toggleUserFollow(followerUsername, targetUsername);

        return NextResponse.json({
            success: true,
            action: result.action,
            isFollowing: result.action === 'followed'
        });

    } catch (error) {
        console.error('Toggle user follow error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle follow' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ isFollowing: false });
        }

        const followerUsername = authToken.value;
        const searchParams = request.nextUrl.searchParams;
        const targetUsername = searchParams.get('targetUsername');

        if (!targetUsername) {
            return NextResponse.json(
                { error: 'Target username is required' },
                { status: 400 }
            );
        }

        const isFollowing = isUserFollowing(followerUsername, targetUsername);

        return NextResponse.json({
            success: true,
            isFollowing
        });

    } catch (error) {
        console.error('Get follow status error:', error);
        return NextResponse.json(
            { error: 'Failed to get follow status' },
            { status: 500 }
        );
    }
}
