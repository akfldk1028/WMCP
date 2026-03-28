import { describe, it, expect } from 'vitest';
import { BMC_BLOCK_META, getBmcSystemPrompt, getBmcBlockPrompt } from './prompts';
import { BMC_BLOCKS } from './types';

describe('BMC_BLOCK_META', () => {
  it('should have metadata for all 9 blocks', () => {
    for (const block of BMC_BLOCKS) {
      const meta = BMC_BLOCK_META[block];
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.labelKo).toBeTruthy();
      expect(meta.guideQuestions.length).toBeGreaterThan(0);
    }
  });
});

describe('getBmcSystemPrompt', () => {
  it('should return a non-empty system prompt', () => {
    const prompt = getBmcSystemPrompt();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('Business Model Canvas');
  });
});

describe('getBmcBlockPrompt', () => {
  it('should include block-specific guide questions', () => {
    const prompt = getBmcBlockPrompt('value-proposition');
    expect(prompt).toContain('Value Proposition');
    expect(prompt).toContain('가치 제안');
  });

  it('should include context from existing blocks', () => {
    const existing = { 'customer-segments': { entries: ['SaaS startups', 'Enterprise companies'] } };
    const prompt = getBmcBlockPrompt('value-proposition', existing);
    expect(prompt).toContain('SaaS startups');
  });
});
