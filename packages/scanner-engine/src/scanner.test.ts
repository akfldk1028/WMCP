import { describe, it, expect, vi } from 'vitest';
import { scanUrl } from './scanner.js';

// ===== Integration tests (real fetch) =====

describe('scanUrl integration', () => {
  it('throws on invalid URL', async () => {
    await expect(scanUrl('not-a-url')).rejects.toThrow();
  });

  it('throws on unreachable host', async () => {
    await expect(
      scanUrl('https://this-domain-does-not-exist-wmcp-test.invalid', { timeout: 3000 }),
    ).rejects.toThrow();
  });

  it('returns ScanResult with all required fields for example.com', async () => {
    const result = await scanUrl('https://example.com', { timeout: 10000 });

    expect(result.url).toBe('https://example.com');
    expect(result.timestamp).toBeTruthy();
    expect(Array.isArray(result.forms)).toBe(true);
    expect(Array.isArray(result.existingTools)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.score).toBe('number');

    // DetailedScore shape
    const ds = result.detailedScore;
    expect(ds.total).toBeGreaterThanOrEqual(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(ds.grade);

    for (const cat of Object.values(ds.categories)) {
      expect(cat.score).toBeGreaterThanOrEqual(0);
      expect(cat.score).toBeLessThanOrEqual(cat.max);
      expect(Array.isArray(cat.details)).toBe(true);
    }

    // Total = sum of categories
    const sum = Object.values(ds.categories).reduce((a, c) => a + c.score, 0);
    expect(ds.total).toBe(sum);
  });

  it('returns 0 structure score for example.com (no forms)', async () => {
    const result = await scanUrl('https://example.com', { timeout: 10000 });
    expect(result.forms).toEqual([]);
    expect(result.detailedScore.categories.structure.score).toBe(0);
  });
});

// ===== Unit tests via mocked fetch =====

describe('scanUrl HTML parsing', () => {
  function mockFetch(html: string) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } }),
    );
  }

  it('extracts basic form fields', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/search" method="GET">
          <input name="q" type="text" placeholder="Search..." required>
          <input name="lang" type="hidden">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms).toHaveLength(1);
    expect(result.forms[0].action).toBe('/search');
    expect(result.forms[0].method).toBe('GET');
    expect(result.forms[0].fields).toHaveLength(2);
    expect(result.forms[0].fields[0]).toMatchObject({
      name: 'q', type: 'text', required: true, placeholder: 'Search...',
    });
    expect(result.forms[0].hasToolAttributes).toBe(false);
    expect(result.forms[0].hasToolDescription).toBe(false);
    expect(result.forms[0].hasToolAutosubmit).toBe(false);
  });

  it('detects declarative toolname attribute', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/search" toolname="search-tool">
          <input name="q" type="text">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms[0].hasToolAttributes).toBe(true);
    expect(result.forms[0].suggestedToolName).toBe('search-tool');
    expect(result.forms[0].hasToolDescription).toBe(false);
    expect(result.forms[0].hasToolAutosubmit).toBe(false);

    // Declarative score: 10 (toolname) + 0 + 0 = 10
    expect(result.detailedScore.categories.declarative.score).toBe(10);
  });

  it('detects tooldescription attribute', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/search" toolname="search" tooldescription="Search the site">
          <input name="q" type="text">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms[0].hasToolDescription).toBe(true);
    // 10 (toolname) + 5 (description) = 15
    expect(result.detailedScore.categories.declarative.score).toBe(15);
  });

  it('detects toolautosubmit attribute', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/search" toolname="search" tooldescription="Search" toolautosubmit>
          <input name="q" type="text">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms[0].hasToolAutosubmit).toBe(true);
    // 10 + 5 + 5 = 20
    expect(result.detailedScore.categories.declarative.score).toBe(20);
  });

  it('gives partial declarative score for toolname + autosubmit without description', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/search" toolname="search" toolautosubmit>
          <input name="q" type="text">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms[0].hasToolDescription).toBe(false);
    expect(result.forms[0].hasToolAutosubmit).toBe(true);
    // 10 (toolname) + 0 (no desc) + 5 (autosubmit) = 15
    expect(result.detailedScore.categories.declarative.score).toBe(15);
    expect(result.detailedScore.categories.declarative.details).toContain('tooldescription attribute missing');
  });

  it('detects registerTool with inputSchema and execute', async () => {
    const spy = mockFetch(`
      <html><body>
        <script>
          navigator.modelContext.registerTool({
            name: 'my-tool',
            description: 'A tool',
            inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
            async execute(input) { return { content: [] }; }
          });
        </script>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.existingTools).toHaveLength(1);
    expect(result.existingTools[0].name).toBe('my-tool');

    // Imperative: 10 (registerTool) + 5 (inputSchema) + 5 (execute) = 20
    expect(result.detailedScore.categories.imperative.score).toBe(20);
  });

  it('detects registerTool without inputSchema', async () => {
    const spy = mockFetch(`
      <html><body>
        <script>
          navigator.modelContext.registerTool({
            name: 'simple-tool',
            execute: async (input) => ({ content: [] })
          });
        </script>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    // registerTool detected but inputSchema not in content
    expect(result.detailedScore.categories.imperative.score).toBe(15); // 10 + 0 + 5
    expect(result.detailedScore.categories.imperative.details).toContain('inputSchema not detected');
  });

  it('handles page with no forms and no scripts', async () => {
    const spy = mockFetch(`<html><body><h1>Hello</h1></body></html>`);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms).toHaveLength(0);
    expect(result.existingTools).toHaveLength(0);
    expect(result.detailedScore.total).toBe(0);
    expect(result.detailedScore.grade).toBe('F');
  });

  it('handles multiple forms with mixed attributes', async () => {
    const spy = mockFetch(`
      <html><body>
        <form action="/login" method="POST">
          <input name="email" type="email" required>
          <input name="password" type="password" required>
        </form>
        <form action="/search" toolname="search" tooldescription="Search" toolautosubmit>
          <input name="q" type="text">
        </form>
      </body></html>
    `);

    const result = await scanUrl('https://test.example.com');
    spy.mockRestore();

    expect(result.forms).toHaveLength(2);
    expect(result.forms[0].hasToolAttributes).toBe(false);
    expect(result.forms[1].hasToolAttributes).toBe(true);
    expect(result.forms[1].hasToolDescription).toBe(true);
    expect(result.forms[1].hasToolAutosubmit).toBe(true);

    // Structure: 2 forms * 5 = 10, 3 fields * 2 = 6 → 16
    expect(result.detailedScore.categories.structure.score).toBe(16);
    // Declarative: 10 + 5 + 5 = 20
    expect(result.detailedScore.categories.declarative.score).toBe(20);
  });
});
