import { describe, it, expect } from 'vitest';
import { BMC_CATALOG } from './catalog';
import { validateComponents } from '@/modules/a2ui/validator';
import type { A2UIComponent } from '@/modules/a2ui/types';

describe('BMC_CATALOG', () => {
  it('should have name bmc', () => {
    expect(BMC_CATALOG.name).toBe('bmc');
  });

  it('should include default components plus BMC-specific ones', () => {
    const names = BMC_CATALOG.components.map((c) => c.component);
    expect(names).toContain('Text');
    expect(names).toContain('TextField');
    expect(names).toContain('Button');
    expect(names).toContain('BmcBlock');
    expect(names).toContain('BmcGrid');
  });

  it('should validate BMC-specific components', () => {
    const components: A2UIComponent[] = [
      { id: 'cs-block', component: 'BmcBlock', block: 'customer-segments', title: 'Customer Segments', children: ['cs-entry'] },
      { id: 'cs-entry', component: 'TextField', label: 'Primary segment' },
    ];
    const result = validateComponents(components, BMC_CATALOG);
    expect(result.valid).toBe(true);
  });
});
