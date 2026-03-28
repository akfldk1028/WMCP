import { describe, it, expect } from 'vitest';
import type {
  A2UIComponent,
  A2UISurface,
  A2UIUpdateComponents,
  A2UIUpdateDataModel,
  A2UIMessage,
  A2UIDataRef,
} from './types';

describe('A2UI Types', () => {
  it('should allow creating a valid text component', () => {
    const component: A2UIComponent = {
      id: 'greeting',
      component: 'Text',
      text: 'Hello',
    };
    expect(component.id).toBe('greeting');
    expect(component.component).toBe('Text');
  });

  it('should allow creating a component with data binding', () => {
    const ref: A2UIDataRef = { $ref: '/bmc/customerSegments/primary' };
    const component: A2UIComponent = {
      id: 'cs-input',
      component: 'TextField',
      label: 'Primary Segment',
      value: ref,
    };
    expect(component.value).toEqual({ $ref: '/bmc/customerSegments/primary' });
  });

  it('should allow creating an updateComponents message', () => {
    const msg: A2UIMessage = {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'bmc-canvas',
        components: [
          { id: 'title', component: 'Text', text: 'BMC' },
        ],
      },
    };
    expect(msg.version).toBe('v0.9');
    expect(msg.updateComponents?.surfaceId).toBe('bmc-canvas');
  });

  it('should allow creating an updateDataModel message', () => {
    const msg: A2UIMessage = {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'bmc-canvas',
        data: { bmc: { customerSegments: { primary: 'Startups' } } },
      },
    };
    expect(msg.updateDataModel?.data.bmc).toBeDefined();
  });

  it('should allow creating a surface with components and data', () => {
    const surface: A2UISurface = {
      surfaceId: 'bmc-canvas',
      catalog: 'bmc-catalog',
      components: new Map([
        ['title', { id: 'title', component: 'Text', text: 'BMC' }],
      ]),
      dataModel: {},
    };
    expect(surface.components.get('title')?.component).toBe('Text');
  });
});
