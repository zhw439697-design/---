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

/**
 * Fetch battery recycling and policy news using Tavily API
 * Performs multiple targeted searches and combines results
 */
export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    source: string;
    date: string;
    tags: string[];
    category: 'domestic' | 'international' | 'industry';
    imageUrl?: string;
    url?: string;
}

export async function fetchBatteryPolicyNews(): Promise<Article[]> {
    try {
        // Perform parallel searches for different categories
        const [domesticResults, internationalResults, industryResults] = await Promise.all([
            searchWithTavily('中国动力电池回收政策 工信部 新能源汽车', {
                max_results: 7,
                search_depth: 'basic'
            }),
            searchWithTavily('欧盟电池法 EU Battery Regulation carbon footprint', {
                max_results: 7,
                search_depth: 'basic'
            }),
            searchWithTavily('动力电池回收行业 市场分析 梯次利用', {
                max_results: 6,
                search_depth: 'basic'
            })
        ]);

        const articles: Article[] = [];

        // Transform domestic policy results
        if (domesticResults?.results) {
            domesticResults.results.forEach((result, index) => {
                articles.push(transformToArticle(result, 'domestic', `tavily-domestic-${index}`));
            });
        }

        // Transform international policy results
        if (internationalResults?.results) {
            internationalResults.results.forEach((result, index) => {
                articles.push(transformToArticle(result, 'international', `tavily-intl-${index}`));
            });
        }

        // Transform industry news results
        if (industryResults?.results) {
            industryResults.results.forEach((result, index) => {
                articles.push(transformToArticle(result, 'industry', `tavily-industry-${index}`));
            });
        }

        return articles;
    } catch (error) {
        console.error('Failed to fetch battery policy news:', error);
        return [];
    }
}

/**
 * Transform Tavily search result to Article format
 */
function transformToArticle(
    result: TavilySearchResult,
    category: 'domestic' | 'international' | 'industry',
    id: string
): Article {
    // Extract tags based on category
    const tags: string[] = ['实时资讯'];
    if (category === 'domestic') {
        tags.push('国内政策', '动力电池');
    } else if (category === 'international') {
        tags.push('国际政策', '欧盟法规');
    } else {
        tags.push('行业观察', '市场分析');
    }

    // Format date
    const date = result.publishedDate
        ? new Date(result.publishedDate).toLocaleDateString('zh-CN')
        : new Date().toLocaleDateString('zh-CN');

    // Extract source from URL
    let source = 'Tavily';
    try {
        const urlObj = new URL(result.url);
        source = urlObj.hostname.replace('www.', '');
    } catch (e) {
        // Keep default source if URL parsing fails
    }

    return {
        id,
        title: result.title,
        summary: result.content.substring(0, 200) + (result.content.length > 200 ? '...' : ''),
        content: result.content,
        source,
        date,
        tags,
        category,
        url: result.url
    };
}
