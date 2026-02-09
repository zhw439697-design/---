export interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

const API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY || '78744bc1da464d9e1dfc8e95c8afe607'; // Fallback for client-side demo if env not set
const BASE_URL = 'https://gnews.io/api/v4';

export async function fetchBatteryNews(query: string = '动力电池', lang: string = 'zh'): Promise<GNewsArticle[]> {
    try {
        const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}&country=cn&max=10&apikey=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error('GNews API Error:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('Failed to fetch news:', error);
        return [];
    }
}
