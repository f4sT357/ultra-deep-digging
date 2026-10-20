type ModelListResponse = {
  data?: Array<{ id?: string; type?: string }>;
};

export function getDefaultModelId(): string {
  if (process.env.CUSTOM_MODEL) return process.env.CUSTOM_MODEL;
  return process.env.FIREWORKS_KEY
    ? 'accounts/fireworks/models/deepseek-r1'
    : 'o3-mini';
}

export async function fetchAvailableModels(): Promise<string[]> {
  const endpoint = process.env.OPENAI_ENDPOINT?.replace(/\/+$/, '');
  if (!endpoint) return [];

  const headers = new Headers({ Accept: 'application/json' });
  if (process.env.OPENAI_KEY) {
    headers.set('Authorization', `Bearer ${process.env.OPENAI_KEY}`);
  }

  const response = await fetch(`${endpoint}/models`, {
    headers,
    signal: AbortSignal.timeout(3_000),
  });

  if (!response.ok) {
    throw new Error(`Model list request failed (${response.status})`);
  }

  const result = (await response.json()) as ModelListResponse;
  return (result.data ?? [])
    .filter(model => model.type !== 'embedding' && model.id && !/embed/i.test(model.id))
    .map(model => model.id as string);
}
