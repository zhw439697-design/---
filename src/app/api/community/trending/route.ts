import { NextResponse } from 'next/server';
import { getTrendingTopics } from '@/lib/db';

export async function GET() {
    try {
        const topics = getTrendingTopics();
        return NextResponse.json({ topics });
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return NextResponse.json({ error: 'Failed to fetch trending topics' }, { status: 500 });
    }
}
