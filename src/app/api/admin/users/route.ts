import { NextResponse } from 'next/server';
import { getAllUsers, getUser } from '@/lib/db';
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

        const users = getAllUsers();
        return NextResponse.json({ users });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        if (username === 'admin') {
            return NextResponse.json({ error: 'Cannot delete default admin' }, { status: 400 });
        }

        // Import dynamically to avoid circular dependency issues if any (though here it's fine)
        const { deleteUser } = await import('@/lib/db');
        const success = deleteUser(username);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'User not found or delete failed' }, { status: 404 });
        }

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
