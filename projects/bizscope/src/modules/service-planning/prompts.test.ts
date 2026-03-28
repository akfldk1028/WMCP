import { describe, it, expect } from 'vitest';
import { PLAN_STAGE_META, getPlanningSystemPrompt, getStagePrompt } from './prompts';
import { PLAN_STAGES } from './types';

describe('PLAN_STAGE_META', () => {
  it('should have metadata for all 8 stages', () => {
    for (const stage of PLAN_STAGES) {
      const meta = PLAN_STAGE_META[stage];
      expect(meta).toBeDefined();
      expect(meta.label).toBeTruthy();
      expect(meta.labelKo).toBeTruthy();
      expect(meta.subsections.length).toBeGreaterThan(0);
    }
  });
});

describe('getPlanningSystemPrompt', () => {
  it('should return a non-empty system prompt', () => {
    const prompt = getPlanningSystemPrompt();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('service planning');
  });
});

describe('getStagePrompt', () => {
  it('should include stage-specific subsections', () => {
    const prompt = getStagePrompt('executive-summary');
    expect(prompt).toContain('Executive Summary');
    expect(prompt).toContain('프로젝트 개요');
  });

  it('should include context from existing stages', () => {
    const existing = { 'executive-summary': { sections: { objectives: 'Build AI tool' } } };
    const prompt = getStagePrompt('conceptual-framework', existing);
    expect(prompt).toContain('Build AI tool');
  });
});
