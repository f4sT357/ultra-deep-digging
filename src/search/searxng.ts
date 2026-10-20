import type { SearchProvider, SearchResult } from './provider';

type SearxngItem = {
  url?: string;
  title?: string;
  content?: string;
};

type SearxngResponse = {
  results?: SearxngItem[];
};

export class SearxngProvider implements SearchProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly language?: string,
  ) {}

  async search(query: string, options: { limit?: number } = {}): Promise<SearchResult> {
    const url = new URL('/search', this.baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    if (this.language) url.searchParams.set('language', this.language);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`SearXNG search failed (${response.status})`);
    }

    const result = (await response.json()) as SearxngResponse;
    return {
      data: (result.results ?? []).slice(0, options.limit ?? 5).map(item => ({
        url: item.url,
        title: item.title,
        markdown: item.content,
        description: item.content,
      })),
    };
  }
}

export function createSearxngProvider(): SearxngProvider {
  const baseUrl = process.env.SEARXNG_BASE_URL || 'http://localhost:8080';
  const language = process.env.SEARCH_LANGUAGE;
  return new SearxngProvider(baseUrl, language || undefined);
}
