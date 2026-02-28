import { NextRequest, NextResponse } from 'next/server';
import { getPostById, getUserLikedPosts } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const postId = parseInt(id);
        if (isNaN(postId)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
        }

        const post = getPostById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Get current user from auth token to check if liked
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');
        const currentUser = authToken?.value;

        let isLiked = false;
        if (currentUser) {
            const likedPostIds = getUserLikedPosts(currentUser);
            isLiked = likedPostIds.includes(postId);
        }

        // Format date
        const date = new Date(post.created_at + ' UTC');
        const formattedDate = date.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/\//g, '-');

        // Transform to frontend format
        const transformedPost = {
            id: post.id.toString(),
            title: post.title,
            content: post.content,
            topic: post.topic,
            tags: post.tags,
            author: {
                name: post.author_username,
                role: post.author_role || 'user'
            },
            date: formattedDate,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            isLiked: isLiked
        };

        return NextResponse.json({
            success: true,
            post: transformedPost
        });

    } catch (error) {
        console.error('Get post by ID error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}
