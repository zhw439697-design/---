import { NextResponse } from 'next/server';
import { getAllExpertApplications, updateExpertApplicationStatus, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


async function isAdmin() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) return false;

    const user = getUser(authToken.value) as any;
    return user && user.role === 'admin';
}

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const applications = getAllExpertApplications();
        return NextResponse.json({ applications });

    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const application = updateExpertApplicationStatus(id, status);
        return NextResponse.json({ success: true, application });

    } catch (error) {
        console.error('Update application error:', error);
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
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // Import dynamically
        const { deleteExpertApplication } = await import('@/lib/db');
        const success = deleteExpertApplication(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

    } catch (error) {
        console.error('Delete application error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
