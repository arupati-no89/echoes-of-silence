import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('getOpenAI guard', () => {
  const original = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = original;
  });

  it('throws a clear error when the API key is unset', async () => {
    delete process.env.OPENAI_API_KEY;
    const { getOpenAI } = await import('./client');
    expect(() => getOpenAI()).toThrow(/OPENAI_API_KEY/);
  });

  it('throws a clear error when the API key is the placeholder from .env.local.example', async () => {
    process.env.OPENAI_API_KEY = 'sk-your-api-key-here';
    const { getOpenAI } = await import('./client');
    expect(() => getOpenAI()).toThrow(/OPENAI_API_KEY/);
  });

  it('throws when the API key is whitespace-only', async () => {
    process.env.OPENAI_API_KEY = '   ';
    const { getOpenAI } = await import('./client');
    expect(() => getOpenAI()).toThrow(/OPENAI_API_KEY/);
  });
});
