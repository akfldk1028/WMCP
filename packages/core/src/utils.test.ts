import { describe, it, expect } from 'vitest';
import {
  scoreToGrade,
  gradeColor,
  calculateReadinessScore,
  calculateDetailedScore,
} from './utils.js';
import type { FormInfo, WebMCPToolInput } from './types.js';

// ===== Helpers =====

function makeForm(overrides: Partial<FormInfo> = {}): FormInfo {
  return {
    action: '/search',
    method: 'GET',
    fields: [{ name: 'q', type: 'text', required: true }],
    hasToolAttributes: false,
    hasToolDescription: false,
    hasToolAutosubmit: false,
    ...overrides,
  };
}

function makeTool(overrides: Partial<WebMCPToolInput> = {}): WebMCPToolInput {
  return {
    name: 'test-tool',
    description: 'A test tool',
    inputSchema: { type: 'object' },
    ...overrides,
  };
}

// ===== scoreToGrade =====

describe('scoreToGrade', () => {
  it('returns A for scores >= 80', () => {
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(100)).toBe('A');
    expect(scoreToGrade(95)).toBe('A');
  });

  it('returns B for scores 60-79', () => {
    expect(scoreToGrade(60)).toBe('B');
    expect(scoreToGrade(79)).toBe('B');
  });

  it('returns C for scores 40-59', () => {
    expect(scoreToGrade(40)).toBe('C');
    expect(scoreToGrade(59)).toBe('C');
  });

  it('returns D for scores 20-39', () => {
    expect(scoreToGrade(20)).toBe('D');
    expect(scoreToGrade(39)).toBe('D');
  });

  it('returns F for scores < 20', () => {
    expect(scoreToGrade(0)).toBe('F');
    expect(scoreToGrade(19)).toBe('F');
  });

  it('handles boundary values exactly', () => {
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(79)).toBe('B');
    expect(scoreToGrade(60)).toBe('B');
    expect(scoreToGrade(59)).toBe('C');
    expect(scoreToGrade(40)).toBe('C');
    expect(scoreToGrade(39)).toBe('D');
    expect(scoreToGrade(20)).toBe('D');
    expect(scoreToGrade(19)).toBe('F');
  });
});

// ===== gradeColor =====

describe('gradeColor', () => {
  it('returns correct color for each grade', () => {
    expect(gradeColor('A')).toBe('#22c55e');
    expect(gradeColor('B')).toBe('#3b82f6');
    expect(gradeColor('C')).toBe('#eab308');
    expect(gradeColor('D')).toBe('#f97316');
    expect(gradeColor('F')).toBe('#ef4444');
  });

  it('returns gray for unknown grades', () => {
    expect(gradeColor('X')).toBe('#6b7280');
    expect(gradeColor('')).toBe('#6b7280');
  });
});

// ===== calculateReadinessScore (legacy) =====

describe('calculateReadinessScore', () => {
  it('returns 0 for empty site', () => {
    expect(calculateReadinessScore(0, 0, false, false)).toBe(0);
  });

  it('adds 20 for forms', () => {
    expect(calculateReadinessScore(1, 0, false, false)).toBe(20);
    expect(calculateReadinessScore(5, 0, false, false)).toBe(20);
  });

  it('adds 30 for tools', () => {
    expect(calculateReadinessScore(0, 1, false, false)).toBe(30);
  });

  it('caps at 100', () => {
    expect(calculateReadinessScore(10, 10, true, true)).toBe(100);
  });

  it('returns 100 for full implementation', () => {
    expect(calculateReadinessScore(1, 1, true, true)).toBe(100);
  });
});

// ===== calculateDetailedScore =====

describe('calculateDetailedScore', () => {
  describe('structure category (max 30)', () => {
    it('scores 0 for no forms', () => {
      const result = calculateDetailedScore([], [], false, false);
      expect(result.categories.structure.score).toBe(0);
      expect(result.categories.structure.max).toBe(30);
    });

    it('scores form count * 5, capped at 15', () => {
      const oneForm = calculateDetailedScore([makeForm()], [], false, false);
      expect(oneForm.categories.structure.score).toBeGreaterThanOrEqual(5);

      const fourForms = calculateDetailedScore(
        [makeForm(), makeForm(), makeForm(), makeForm()],
        [], false, false,
      );
      // 4 forms * 5 = 20 → capped at 15, plus fields
      expect(fourForms.categories.structure.score).toBeGreaterThanOrEqual(15);
    });

    it('scores fields * 2, capped at 15', () => {
      const manyFields = makeForm({
        fields: Array.from({ length: 10 }, (_, i) => ({
          name: `field${i}`, type: 'text', required: false,
        })),
      });
      const result = calculateDetailedScore([manyFields], [], false, false);
      // 1 form * 5 = 5 + min(10 * 2, 15) = 15 → total 20
      expect(result.categories.structure.score).toBe(20);
    });

    it('caps at 30 total', () => {
      const forms = Array.from({ length: 5 }, () => makeForm({
        fields: Array.from({ length: 10 }, (_, i) => ({
          name: `f${i}`, type: 'text', required: false,
        })),
      }));
      const result = calculateDetailedScore(forms, [], false, false);
      expect(result.categories.structure.score).toBe(30);
    });
  });

  describe('tools category (max 30)', () => {
    it('scores 0 for no tools', () => {
      const result = calculateDetailedScore([], [], false, false);
      expect(result.categories.tools.score).toBe(0);
    });

    it('scores tool count * 10, capped at 15', () => {
      const oneTool = calculateDetailedScore([], [makeTool()], false, false);
      // 1 * 10 = 10 + schema score (no props → 5) = 15
      expect(oneTool.categories.tools.score).toBe(15);
    });

    it('gives 15 for tools with schema properties', () => {
      const toolWithProps = makeTool({
        inputSchema: {
          type: 'object',
          properties: { q: { type: 'string' } },
        },
      });
      const result = calculateDetailedScore([], [toolWithProps], false, false);
      // 1 * 10 = 10 + 15 (has props) = 25
      expect(result.categories.tools.score).toBe(25);
    });

    it('gives 5 for tools without schema properties', () => {
      const result = calculateDetailedScore([], [makeTool()], false, false);
      // 1 * 10 = 10 + 5 (no props) = 15
      expect(result.categories.tools.score).toBe(15);
    });
  });

  describe('declarative category (max 20)', () => {
    it('scores 0 when no declarative attributes', () => {
      const result = calculateDetailedScore([makeForm()], [], false, false);
      expect(result.categories.declarative.score).toBe(0);
    });

    it('scores 10 for toolname only', () => {
      const form = makeForm({
        hasToolAttributes: true,
        hasToolDescription: false,
        hasToolAutosubmit: false,
      });
      const result = calculateDetailedScore([form], [], true, false);
      expect(result.categories.declarative.score).toBe(10);
    });

    it('scores 15 for toolname + tooldescription', () => {
      const form = makeForm({
        hasToolAttributes: true,
        hasToolDescription: true,
        hasToolAutosubmit: false,
      });
      const result = calculateDetailedScore([form], [], true, false);
      expect(result.categories.declarative.score).toBe(15);
    });

    it('scores 20 for all three attributes', () => {
      const form = makeForm({
        hasToolAttributes: true,
        hasToolDescription: true,
        hasToolAutosubmit: true,
      });
      const result = calculateDetailedScore([form], [], true, false);
      expect(result.categories.declarative.score).toBe(20);
    });

    it('detects attributes across multiple forms', () => {
      const form1 = makeForm({ hasToolAttributes: true, hasToolDescription: true, hasToolAutosubmit: false });
      const form2 = makeForm({ hasToolAttributes: false, hasToolDescription: false, hasToolAutosubmit: true });
      const result = calculateDetailedScore([form1, form2], [], true, false);
      // toolname from form1 (10) + description from form1 (5) + autosubmit from form2 (5)
      expect(result.categories.declarative.score).toBe(20);
    });

    it('reports missing attributes in details', () => {
      const form = makeForm({
        hasToolAttributes: true,
        hasToolDescription: false,
        hasToolAutosubmit: false,
      });
      const result = calculateDetailedScore([form], [], true, false);
      expect(result.categories.declarative.details).toContain('tooldescription attribute missing');
      expect(result.categories.declarative.details).toContain('toolautosubmit attribute missing');
    });
  });

  describe('imperative category (max 20)', () => {
    it('scores 0 when no imperative usage', () => {
      const result = calculateDetailedScore([], [], false, false);
      expect(result.categories.imperative.score).toBe(0);
    });

    it('scores 10 for registerTool only', () => {
      const result = calculateDetailedScore([], [makeTool()], false, true, {
        hasInputSchema: false,
        hasExecute: false,
      });
      expect(result.categories.imperative.score).toBe(10);
    });

    it('scores 15 for registerTool + inputSchema', () => {
      const result = calculateDetailedScore([], [makeTool()], false, true, {
        hasInputSchema: true,
        hasExecute: false,
      });
      expect(result.categories.imperative.score).toBe(15);
    });

    it('scores 20 for full imperative implementation', () => {
      const result = calculateDetailedScore([], [makeTool()], false, true, {
        hasInputSchema: true,
        hasExecute: true,
      });
      expect(result.categories.imperative.score).toBe(20);
    });

    it('reports missing features in details', () => {
      const result = calculateDetailedScore([], [makeTool()], false, true, {
        hasInputSchema: false,
        hasExecute: false,
      });
      expect(result.categories.imperative.details).toContain('inputSchema not detected');
      expect(result.categories.imperative.details).toContain('execute() handler not detected');
    });
  });

  describe('total and grade', () => {
    it('sums all categories for total', () => {
      const form = makeForm({
        hasToolAttributes: true,
        hasToolDescription: true,
        hasToolAutosubmit: true,
      });
      const tool = makeTool({
        inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
      });
      const result = calculateDetailedScore([form], [tool], true, true, {
        hasInputSchema: true,
        hasExecute: true,
      });
      const expected = result.categories.structure.score
        + result.categories.tools.score
        + result.categories.declarative.score
        + result.categories.imperative.score;
      expect(result.total).toBe(expected);
    });

    it('assigns correct grade based on total', () => {
      // Empty site → 0 → F
      const empty = calculateDetailedScore([], [], false, false);
      expect(empty.grade).toBe('F');

      // Some forms → structure points only → low score
      const partial = calculateDetailedScore(
        [makeForm()], [], false, false,
      );
      expect(['F', 'D']).toContain(partial.grade);
    });

    it('max score gives grade A', () => {
      const forms = Array.from({ length: 5 }, () => makeForm({
        fields: Array.from({ length: 10 }, (_, i) => ({
          name: `f${i}`, type: 'text', required: false,
        })),
        hasToolAttributes: true,
        hasToolDescription: true,
        hasToolAutosubmit: true,
      }));
      const tools = [makeTool({
        inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
      }), makeTool({
        inputSchema: { type: 'object', properties: { q: { type: 'string' } } },
      })];
      const result = calculateDetailedScore(forms, tools, true, true, {
        hasInputSchema: true,
        hasExecute: true,
      });
      expect(result.total).toBe(100);
      expect(result.grade).toBe('A');
    });
  });
});
