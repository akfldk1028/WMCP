import { describe, it, expect } from 'vitest';
import { planStageTools, planStatusTool, planningTools } from './index';

describe('Planning MCP Tools', () => {
  it('should export 8 stage tools', () => {
    expect(planStageTools).toHaveLength(8);
    expect(planStageTools[0].name).toBe('bizscope-plan-executive-summary');
    expect(planStageTools[7].name).toBe('bizscope-plan-legal-ethical');
  });
  it('should export status tool', () => { expect(planStatusTool.name).toBe('bizscope-plan-status'); });
  it('should export all tools (9 total)', () => { expect(planningTools).toHaveLength(9); });
});
