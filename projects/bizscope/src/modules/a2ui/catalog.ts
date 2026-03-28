import type { A2UICatalog } from './types';

export const DEFAULT_CATALOG: A2UICatalog = {
  name: 'a2ui-default',
  version: '0.9.0',
  components: [
    {
      component: 'Text',
      description: 'Display static or dynamic text',
      props: { text: { type: 'string', required: true, description: 'Text content or data ref' } },
    },
    {
      component: 'TextField',
      description: 'Single-line or multi-line text input',
      props: {
        label: { type: 'string', required: true, description: 'Input label' },
        value: { type: 'string', required: false, description: 'Current value or data ref' },
        multiline: { type: 'boolean', required: false, description: 'Multi-line mode' },
        placeholder: { type: 'string', required: false, description: 'Placeholder text' },
      },
    },
    {
      component: 'Select',
      description: 'Dropdown selection',
      props: {
        label: { type: 'string', required: true, description: 'Select label' },
        options: { type: 'array', required: true, description: 'Available options' },
        value: { type: 'string', required: false, description: 'Selected value or data ref' },
      },
    },
    {
      component: 'Button',
      description: 'Clickable action button',
      props: {
        child: { type: 'string', required: true, description: 'Child component ID for label' },
        action: { type: 'object', required: false, description: 'Action event on click' },
        variant: { type: 'string', required: false, description: 'primary | secondary | ghost' },
      },
    },
    {
      component: 'Card',
      description: 'Container card with optional title',
      props: {
        title: { type: 'string', required: true, description: 'Card title' },
        children: { type: 'array', required: false, description: 'Child component IDs' },
      },
    },
    {
      component: 'List',
      description: 'Ordered or unordered list',
      props: {
        items: { type: 'array', required: true, description: 'List item component IDs or strings' },
        ordered: { type: 'boolean', required: false, description: 'Ordered list' },
      },
    },
    {
      component: 'Divider',
      description: 'Visual separator',
      props: {},
    },
    {
      component: 'Badge',
      description: 'Status badge or label',
      props: {
        text: { type: 'string', required: true, description: 'Badge text' },
        variant: { type: 'string', required: false, description: 'default | success | warning | error' },
      },
    },
  ],
};
