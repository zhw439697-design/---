import { NextResponse } from 'next/server';
import { getRecyclingStats } from '@/lib/db';

export async function GET() {
    try {
        const stats = getRecyclingStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to get recycling stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
