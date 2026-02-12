import { NextResponse } from 'next/server';
import { getExpertApplication } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = authToken.value;
        const application = getExpertApplication(username);

        return NextResponse.json({ application });

    } catch (error) {
        console.error('Get expert status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
