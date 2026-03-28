import type { A2UICatalog } from '@/modules/a2ui/types';
import { DEFAULT_CATALOG } from '@/modules/a2ui/catalog';

export const BMC_CATALOG: A2UICatalog = {
  name: 'bmc',
  version: '1.0.0',
  components: [
    ...DEFAULT_CATALOG.components,
    {
      component: 'BmcBlock',
      description: 'A single BMC block container (one of 9 blocks)',
      props: {
        block: { type: 'string', required: true, description: 'Block identifier' },
        title: { type: 'string', required: true, description: 'Block display title' },
        children: { type: 'array', required: false, description: 'Child component IDs' },
      },
    },
    {
      component: 'BmcGrid',
      description: 'The full 9-block BMC canvas grid layout',
      props: {
        children: { type: 'array', required: true, description: 'BmcBlock component IDs' },
      },
    },
  ],
};
