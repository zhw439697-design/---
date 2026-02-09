/**
 * Client-side wrapper for Tavily API
 * Calls the server-side API route to avoid 'net' module errors in the browser
 */

export interface TavilySearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
    publishedDate?: string;
}

export interface TavilyResponse {
    query: string;
    results: TavilySearchResult[];
    answer?: string;
}

export interface TavilySearchOptions {
    max_results?: number;
    search_depth?: 'basic' | 'advanced' | 'fast' | 'ultra-fast';
    include_answer?: boolean;
}

export async function searchWithTavily(
    query: string,
    options: TavilySearchOptions = {}
): Promise<TavilyResponse | null> {
    try {
        const { max_results = 20, search_depth = 'basic', include_answer = false } = options;

        const response = await fetch('/api/tavily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                max_results,
                search_depth,
                include_answer
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Tavily search failed:', error);
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Failed to call Tavily API:', error);
        return null;
    }
}
