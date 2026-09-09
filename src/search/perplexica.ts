import type { SearchProvider, SearchResult } from './provider';

type PerplexicaProviderConfig = {
  baseUrl: string;
  providerId: string;
  chatModel: string;
  embeddingProviderId: string;
  embeddingModel: string;
  optimizationMode?: 'speed' | 'balanced' | 'quality';
};

type PerplexicaSource = {
  pageContent?: string;
  metadata?: {
    title?: string;
    url?: string;
  };
};

type PerplexicaResponse = {
  message?: string;
  sources?: PerplexicaSource[];
};

export class PerplexicaProvider implements SearchProvider {
  constructor(private readonly config: PerplexicaProviderConfig) {}

  async search(query: string, options: { limit?: number } = {}): Promise<SearchResult> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatModel: {
          providerId: this.config.providerId,
          key: this.config.chatModel,
        },
        embeddingModel: {
          providerId: this.config.embeddingProviderId,
          key: this.config.embeddingModel,
        },
        optimizationMode: this.config.optimizationMode ?? 'speed',
        focusMode: 'webSearch',
        sources: ['web'],
        query,
        history: [],
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Perplexica search failed (${response.status}): ${body}`);
    }

    const result = (await response.json()) as PerplexicaResponse;
    const sources = result.sources ?? [];
    const limit = options.limit ?? 5;

    return {
      data: sources.slice(0, limit).map(source => ({
        url: source.metadata?.url,
        title: source.metadata?.title,
        markdown: source.pageContent,
        description: source.pageContent,
      })),
    };
  }
}

export function createPerplexicaProvider(): PerplexicaProvider {
  const baseUrl = process.env.PERPLEXICA_BASE_URL;
  const providerId = process.env.PERPLEXICA_PROVIDER_ID;
  const chatModel = process.env.PERPLEXICA_CHAT_MODEL;
  const embeddingProviderId = process.env.PERPLEXICA_EMBEDDING_PROVIDER_ID;
  const embeddingModel = process.env.PERPLEXICA_EMBEDDING_MODEL;

  if (!baseUrl || !providerId || !chatModel || !embeddingProviderId || !embeddingModel) {
    throw new Error(
      'Perplexica is not configured. Set PERPLEXICA_BASE_URL, PERPLEXICA_PROVIDER_ID, PERPLEXICA_CHAT_MODEL, PERPLEXICA_EMBEDDING_PROVIDER_ID, and PERPLEXICA_EMBEDDING_MODEL.',
    );
  }

  return new PerplexicaProvider({
    baseUrl,
    providerId,
    chatModel,
    embeddingProviderId,
    embeddingModel,
    optimizationMode:
      (process.env.PERPLEXICA_OPTIMIZATION_MODE as 'speed' | 'balanced' | 'quality') ?? 'speed',
  });
}
