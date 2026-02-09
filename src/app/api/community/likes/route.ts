import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, isPostLikedByUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get user from auth_token (matching the auth system)
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // The auth_token value is the username
        const username = authToken.value;

        const { postId } = await request.json();

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        const result = toggleLike(parseInt(postId), username);

        return NextResponse.json({
            success: true,
            action: result.action,
            likesCount: result.likesCount,
            isLiked: result.action === 'liked' // true if liked, false if unliked
        });

    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ likedPosts: [] });
        }

        const username = authToken.value;

        const searchParams = request.nextUrl.searchParams;
        const postId = searchParams.get('postId');

        if (postId) {
            const isLiked = isPostLikedByUser(parseInt(postId), username);
            return NextResponse.json({ isLiked });
        }

        return NextResponse.json({ likedPosts: [] });

    } catch (error) {
        console.error('Get likes error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch likes' },
            { status: 500 }
        );
    }
}
