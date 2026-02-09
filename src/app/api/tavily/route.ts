import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';

export async function POST(request: NextRequest) {
    try {
        const { query, max_results = 5, search_depth = 'basic', include_answer = false } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        // Initialize Tavily client
        const tvly = tavily({ apiKey: TAVILY_API_KEY });

        // Perform search with configurable parameters
        const response = await tvly.search(query, {
            searchDepth: search_depth,
            maxResults: max_results,
            includeAnswer: include_answer
        });

        return NextResponse.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Tavily API Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to search with Tavily',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
