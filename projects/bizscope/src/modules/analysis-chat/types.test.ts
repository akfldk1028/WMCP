import { describe, it, expect } from 'vitest';
import type { AnalysisMessage, SectionStatus, AnalysisChatConfig, AnalysisChatEvent } from './types';

describe('analysis-chat types', () => {
  it('should create a valid AnalysisMessage', () => {
    const msg: AnalysisMessage = {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello',
      sectionType: 'idea-overview',
      timestamp: Date.now(),
    };
    expect(msg.role).toBe('assistant');
    expect(msg.sectionType).toBe('idea-overview');
  });

  it('should create a valid SectionStatus', () => {
    const status: SectionStatus = {
      type: 'pest-analysis',
      title: 'PEST 분석',
      status: 'pending',
      data: null,
    };
    expect(status.status).toBe('pending');
    expect(status.data).toBeNull();
  });

  it('should accept error state with message', () => {
    const status: SectionStatus = {
      type: 'market-size',
      title: 'Market Size',
      status: 'error',
      data: null,
      error: 'AI generation failed',
    };
    expect(status.error).toBe('AI generation failed');
  });

  it('should create a valid AnalysisChatConfig', () => {
    const config: AnalysisChatConfig = {
      mode: 'idea',
      subjectName: 'Pet Care App',
      ideaDescription: 'A marketplace for pet care',
      ideaTarget: 'Millennial pet owners',
    };
    expect(config.mode).toBe('idea');
    expect(config.subjectName).toBe('Pet Care App');
  });

  it('should create a valid AnalysisChatEvent', () => {
    const event: AnalysisChatEvent = {
      type: 'all-complete',
      data: { sections: [] },
    };
    expect(event.type).toBe('all-complete');
  });

  it('should allow system role in AnalysisMessage', () => {
    const msg: AnalysisMessage = {
      id: 'sys-1',
      role: 'system',
      content: '⚠ Error occurred',
      timestamp: Date.now(),
    };
    expect(msg.role).toBe('system');
  });
});
