import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost, getUserLikedPosts } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter') || 'all';
        const username = searchParams.get('username');

        // Get current user from auth token
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');
        const currentUser = authToken?.value;

        let posts;

        if (filter === 'liked' && username) {
            // Get posts liked by user
            posts = getPosts({ likedBy: username });
        } else if (filter === 'topics' && username) {
            // TODO: Filter by followed topics
            // For now, return empty array
            posts = [];
        } else {
            // Get all posts
            posts = getPosts();
        }

        // Get user's liked posts if logged in
        let userLikedPostIds = new Set<number>();
        if (currentUser) {
            const likedPostIds = getUserLikedPosts(currentUser);
            userLikedPostIds = new Set(likedPostIds);
        }

        // Transform to frontend format
        const transformedPosts = posts.map((post: any) => {
            // Format date
            const date = new Date(post.created_at);
            const formattedDate = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-');

            return {
                id: post.id.toString(),
                title: post.title,
                content: post.content,
                author: {
                    name: post.author_username,
                    role: post.author_role || 'user'
                },
                date: formattedDate,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                isLiked: userLikedPostIds.has(post.id)
            };
        });

        return NextResponse.json({
            success: true,
            posts: transformedPosts
        });

    } catch (error) {
        console.error('Get posts error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

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

        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        if (title.length > 100) {
            return NextResponse.json(
                { error: 'Title too long (max 100 characters)' },
                { status: 400 }
            );
        }

        if (content.length > 1000) {
            return NextResponse.json(
                { error: 'Content too long (max 1000 characters)' },
                { status: 400 }
            );
        }

        const post = createPost(title, content, username);

        return NextResponse.json({
            success: true,
            post
        });

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
