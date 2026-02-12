import { NextResponse } from 'next/server';
import { getPosts, deletePost, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) return false;

    const user: any = getUser(token.value);
    return user && user.role === 'admin';
}

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Reuse existing getPosts but maybe we want all of them without filters
        const posts = getPosts();

        // Enrich with more info if needed, but getPosts joins user already
        return NextResponse.json({ posts });

    } catch (error) {
        console.error('Get admin posts error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
        }

        const success = deletePost(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
