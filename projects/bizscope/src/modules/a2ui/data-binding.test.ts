import { describe, it, expect } from 'vitest';
import { resolvePointer, setPointer, isDataRef, resolveValue } from './data-binding';

describe('resolvePointer', () => {
  const data = {
    bmc: {
      customerSegments: {
        primary: 'SaaS Startups',
        marketType: 'Niche',
      },
    },
    planning: {
      stage1: { title: 'Executive Summary' },
    },
  };

  it('should resolve a nested pointer', () => {
    expect(resolvePointer(data, '/bmc/customerSegments/primary')).toBe('SaaS Startups');
  });

  it('should resolve root pointer', () => {
    expect(resolvePointer(data, '')).toEqual(data);
  });

  it('should return undefined for missing path', () => {
    expect(resolvePointer(data, '/bmc/missing/path')).toBeUndefined();
  });

  it('should handle single-level pointer', () => {
    expect(resolvePointer(data, '/planning')).toEqual(data.planning);
  });
});

describe('setPointer', () => {
  it('should set a value at a nested path', () => {
    const data = { bmc: { vp: {} } };
    const result = setPointer(data, '/bmc/vp/text', 'AI Reports');
    expect(result.bmc.vp.text).toBe('AI Reports');
  });

  it('should create intermediate objects', () => {
    const data = {};
    const result = setPointer(data, '/a/b/c', 'deep');
    expect(result.a.b.c).toBe('deep');
  });

  it('should not mutate the original object', () => {
    const data = { x: 1 };
    const result = setPointer(data, '/y', 2);
    expect(data).toEqual({ x: 1 });
    expect(result).toEqual({ x: 1, y: 2 });
  });
});

describe('isDataRef', () => {
  it('should identify a data ref', () => {
    expect(isDataRef({ $ref: '/bmc/vp' })).toBe(true);
  });

  it('should reject non-ref objects', () => {
    expect(isDataRef({ text: 'hello' })).toBe(false);
    expect(isDataRef('string')).toBe(false);
    expect(isDataRef(null)).toBe(false);
    expect(isDataRef(42)).toBe(false);
  });
});

describe('resolveValue', () => {
  const data = { bmc: { vp: 'AI Reports' } };

  it('should resolve a data ref to its value', () => {
    expect(resolveValue({ $ref: '/bmc/vp' }, data)).toBe('AI Reports');
  });

  it('should return literal values as-is', () => {
    expect(resolveValue('hello', data)).toBe('hello');
    expect(resolveValue(42, data)).toBe(42);
    expect(resolveValue(true, data)).toBe(true);
  });
});
