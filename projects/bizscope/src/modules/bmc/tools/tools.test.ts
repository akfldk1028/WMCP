import { describe, it, expect } from 'vitest';
import { bmcGenerateTool, bmcUpdateTool, bmcTools } from './index';

describe('BMC MCP Tools', () => {
  it('should export generate tool definition', () => {
    expect(bmcGenerateTool.name).toBe('bizscope-bmc-generate');
    expect(bmcGenerateTool.description).toBeTruthy();
    expect(bmcGenerateTool.inputSchema.properties).toHaveProperty('ideaName');
    expect(bmcGenerateTool.inputSchema.properties).toHaveProperty('ideaDescription');
  });

  it('should export update tool definition', () => {
    expect(bmcUpdateTool.name).toBe('bizscope-bmc-update');
    expect(bmcUpdateTool.inputSchema.properties).toHaveProperty('block');
    expect(bmcUpdateTool.inputSchema.properties).toHaveProperty('entries');
  });

  it('should export all tools as array', () => {
    expect(bmcTools).toHaveLength(2);
    expect(bmcTools.map((t) => t.name)).toEqual(['bizscope-bmc-generate', 'bizscope-bmc-update']);
  });
});
