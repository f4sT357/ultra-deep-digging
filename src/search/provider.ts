export type SearchResult = {
  data: Array<{
    url?: string;
    title?: string;
    markdown?: string;
    description?: string;
  }>;
};

export type SearchOptions = {
  limit?: number;
};

export interface SearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
}
