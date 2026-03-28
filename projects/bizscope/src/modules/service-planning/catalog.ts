import type { A2UICatalog } from '@/modules/a2ui/types';
import { DEFAULT_CATALOG } from '@/modules/a2ui/catalog';

export const PLANNING_CATALOG: A2UICatalog = {
  name: 'service-planning', version: '1.0.0',
  components: [
    ...DEFAULT_CATALOG.components,
    { component: 'StageCard', description: 'A planning stage container',
      props: { stage: { type: 'string', required: true }, title: { type: 'string', required: true }, children: { type: 'array', required: false } } },
    { component: 'Timeline', description: 'Timeline / milestone visualization',
      props: { items: { type: 'array', required: true } } },
    { component: 'BudgetTable', description: 'Budget breakdown table',
      props: { rows: { type: 'array', required: true }, total: { type: 'number', required: false } } },
  ],
};
