import { describe, it, expect } from 'vitest';
import { DEFAULT_CATALOG } from './catalog';
import { validateComponents } from './validator';
import type { A2UIComponent } from './types';

describe('DEFAULT_CATALOG', () => {
  it('should have name and version', () => {
    expect(DEFAULT_CATALOG.name).toBe('a2ui-default');
    expect(DEFAULT_CATALOG.version).toBeTruthy();
  });

  it('should contain basic component types', () => {
    const names = DEFAULT_CATALOG.components.map((c) => c.component);
    expect(names).toContain('Text');
    expect(names).toContain('TextField');
    expect(names).toContain('Select');
    expect(names).toContain('Button');
    expect(names).toContain('Card');
    expect(names).toContain('List');
  });

  it('should validate a well-formed set of components', () => {
    const components: A2UIComponent[] = [
      { id: 'h', component: 'Text', text: 'Hello' },
      { id: 'i', component: 'TextField', label: 'Name' },
      { id: 's', component: 'Select', label: 'Type', options: ['A', 'B'] },
      { id: 'b', component: 'Button', child: 'btn-label' },
      { id: 'c', component: 'Card', title: 'My Card' },
      { id: 'l', component: 'List', items: [] },
    ];
    const result = validateComponents(components, DEFAULT_CATALOG);
    expect(result.valid).toBe(true);
  });
});
