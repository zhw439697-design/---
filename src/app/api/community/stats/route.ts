import { NextResponse } from 'next/server';
import { getCommunityStats } from '@/lib/db';

export async function GET() {
    try {
        const stats = getCommunityStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching community stats:', error);
        return NextResponse.json({ error: 'Failed to fetch community stats' }, { status: 500 });
    }
}
