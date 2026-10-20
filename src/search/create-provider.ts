import { createPerplexicaProvider } from './perplexica';
import { createSearxngProvider } from './searxng';
import type { SearchProvider } from './provider';

export function createSearchProvider(): SearchProvider {
  const provider = (process.env.SEARCH_PROVIDER || 'searxng').toLowerCase();

  switch (provider) {
    case 'searxng':
      return createSearxngProvider();
    case 'vane':
    case 'perplexica':
      return createPerplexicaProvider();
    default:
      throw new Error(`Unsupported search provider: ${provider}`);
  }
}
