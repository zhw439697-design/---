import { NextResponse } from 'next/server';
import { createExpertApplication, getExpertApplication, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real app, we would verify the token. 
        // For this demo, we assume the token IS the username as set in login/register
        const username = authToken.value;
        const user = getUser(username);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if already applied
        const existing = getExpertApplication(username);

        if (existing && existing.status === 'approved') {
            return NextResponse.json({ error: '您已经是认证专家了' }, { status: 400 });
        }

        const body = await request.json();
        const { name, field, contact, reason, type } = body;

        if (!name || !field || !contact || !reason || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const application = createExpertApplication({
            username,
            name,
            field,
            contact,
            reason,
            type
        });

        return NextResponse.json({ success: true, application });

    } catch (error) {
        console.error('Apply expert error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
