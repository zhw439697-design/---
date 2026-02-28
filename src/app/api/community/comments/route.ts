import { NextRequest, NextResponse } from 'next/server';
import { createComment, getComments } from '@/lib/db';
import { cookies } from 'next/headers';

// GET - Get comments for a post
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json(
                { error: 'Post ID is required' },
                { status: 400 }
            );
        }

        const comments = getComments(parseInt(postId));

        // Transform to frontend format
        const transformedComments = comments.map((comment: any) => {
            const date = new Date(comment.created_at + ' UTC');
            const formattedDate = date.toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(/\//g, '-');

            return {
                id: comment.id.toString(),
                content: comment.content,
                author: {
                    name: comment.author_username,
                    role: comment.author_role || 'user'
                },
                date: formattedDate
            };
        });

        return NextResponse.json({
            success: true,
            comments: transformedComments
        });

    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
    try {
        // Get user from auth_token
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const username = authToken.value;
        const { postId, content } = await request.json();

        if (!postId || !content) {
            return NextResponse.json(
                { error: 'Post ID and content are required' },
                { status: 400 }
            );
        }

        if (content.length > 500) {
            return NextResponse.json(
                { error: 'Comment too long (max 500 characters)' },
                { status: 400 }
            );
        }

        const comment = createComment(parseInt(postId), content, username);

        return NextResponse.json({
            success: true,
            comment
        });

    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}
