import { describe, it, expect } from 'vitest';
import { validateComponents } from './validator';
import type { A2UICatalog, A2UIComponent } from './types';

const testCatalog: A2UICatalog = {
  name: 'test-catalog',
  version: '1.0',
  components: [
    {
      component: 'Text',
      description: 'Display text',
      props: { text: { type: 'string', required: true } },
    },
    {
      component: 'TextField',
      description: 'Text input',
      props: {
        label: { type: 'string', required: true },
        value: { type: 'string', required: false },
      },
    },
    {
      component: 'Button',
      description: 'Clickable button',
      props: { child: { type: 'string', required: true } },
    },
  ],
};

describe('validateComponents', () => {
  it('should accept valid components', () => {
    const components: A2UIComponent[] = [
      { id: 'title', component: 'Text', text: 'Hello' },
      { id: 'input', component: 'TextField', label: 'Name' },
    ];
    const result = validateComponents(components, testCatalog);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject components not in catalog', () => {
    const components: A2UIComponent[] = [
      { id: 'evil', component: 'ScriptInjector', code: 'alert(1)' },
    ];
    const result = validateComponents(components, testCatalog);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('ScriptInjector');
  });

  it('should reject components missing required props', () => {
    const components: A2UIComponent[] = [
      { id: 'bad-text', component: 'Text' },
    ];
    const result = validateComponents(components, testCatalog);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('text');
  });

  it('should allow components with optional props omitted', () => {
    const components: A2UIComponent[] = [
      { id: 'input', component: 'TextField', label: 'Name' },
    ];
    const result = validateComponents(components, testCatalog);
    expect(result.valid).toBe(true);
  });

  it('should reject components with duplicate ids', () => {
    const components: A2UIComponent[] = [
      { id: 'same', component: 'Text', text: 'A' },
      { id: 'same', component: 'Text', text: 'B' },
    ];
    const result = validateComponents(components, testCatalog);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('same');
  });
});
