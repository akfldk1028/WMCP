'use client';

import React from 'react';
import type { A2UIComponent, A2UIEvent } from './types';
import { resolveValue } from './data-binding';

interface A2UIRendererProps {
  components: A2UIComponent[];
  dataModel: Record<string, unknown>;
  onEvent?: (event: A2UIEvent) => void;
  surfaceId?: string;
  componentOverrides?: Record<string, React.ComponentType<RenderedComponentProps>>;
}

export interface RenderedComponentProps {
  component: A2UIComponent;
  dataModel: Record<string, unknown>;
  renderChild: (id: string) => React.ReactNode;
  onEvent?: (event: A2UIEvent) => void;
  surfaceId: string;
}

export function A2UIRenderer({
  components,
  dataModel,
  onEvent,
  surfaceId = 'default',
  componentOverrides,
}: A2UIRendererProps) {
  const componentMap = new Map(components.map((c) => [c.id, c]));
  const childIds = new Set<string>();

  for (const comp of components) {
    if (comp.child) childIds.add(comp.child as string);
    if (comp.children) {
      for (const id of comp.children as string[]) {
        childIds.add(id);
      }
    }
  }

  const rootComponents = components.filter((c) => !childIds.has(c.id));

  function renderChild(id: string): React.ReactNode {
    const comp = componentMap.get(id);
    if (!comp) return null;
    return renderComponent(comp);
  }

  function renderComponent(comp: A2UIComponent): React.ReactNode {
    const Override = componentOverrides?.[comp.component];
    if (Override) {
      return (
        <Override
          key={comp.id}
          component={comp}
          dataModel={dataModel}
          renderChild={renderChild}
          onEvent={onEvent}
          surfaceId={surfaceId}
        />
      );
    }

    const builtIn = BUILT_IN_COMPONENTS[comp.component];
    if (!builtIn) return null;

    return (
      <React.Fragment key={comp.id}>
        {builtIn(comp, dataModel, renderChild, onEvent, surfaceId)}
      </React.Fragment>
    );
  }

  return <div data-a2ui-surface={surfaceId}>{rootComponents.map(renderComponent)}</div>;
}

type BuiltInRenderer = (
  comp: A2UIComponent,
  dataModel: Record<string, unknown>,
  renderChild: (id: string) => React.ReactNode,
  onEvent?: (event: A2UIEvent) => void,
  surfaceId?: string,
) => React.ReactNode;

const BUILT_IN_COMPONENTS: Record<string, BuiltInRenderer> = {
  Text: (comp, dataModel) => {
    const text = resolveValue(comp.text, dataModel);
    return <p data-a2ui-id={comp.id}>{String(text ?? '')}</p>;
  },

  TextField: (comp, dataModel, _renderChild, onEvent, surfaceId) => {
    const value = resolveValue(comp.value, dataModel);
    const id = `a2ui-${comp.id}`;
    return (
      <div data-a2ui-id={comp.id}>
        <label htmlFor={id}>{String(comp.label ?? '')}</label>
        {comp.multiline ? (
          <textarea
            id={id}
            placeholder={String(comp.placeholder ?? '')}
            defaultValue={String(value ?? '')}
            onChange={(e) =>
              onEvent?.({ type: 'change', surfaceId: surfaceId ?? 'default', componentId: comp.id, value: e.target.value })
            }
          />
        ) : (
          <input
            id={id}
            type="text"
            placeholder={String(comp.placeholder ?? '')}
            defaultValue={String(value ?? '')}
            onChange={(e) =>
              onEvent?.({ type: 'change', surfaceId: surfaceId ?? 'default', componentId: comp.id, value: e.target.value })
            }
          />
        )}
      </div>
    );
  },

  Select: (comp, dataModel, _renderChild, onEvent, surfaceId) => {
    const value = resolveValue(comp.value, dataModel);
    const options = (comp.options as string[]) ?? [];
    const id = `a2ui-${comp.id}`;
    return (
      <div data-a2ui-id={comp.id}>
        <label htmlFor={id}>{String(comp.label ?? '')}</label>
        <select
          id={id}
          defaultValue={String(value ?? '')}
          onChange={(e) =>
            onEvent?.({ type: 'change', surfaceId: surfaceId ?? 'default', componentId: comp.id, value: e.target.value })
          }
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  },

  Button: (comp, _dataModel, renderChild, onEvent, surfaceId) => {
    return (
      <button
        data-a2ui-id={comp.id}
        type="button"
        onClick={() => {
          const action = comp.action as { event?: { name?: string } } | undefined;
          onEvent?.({ type: 'action', surfaceId: surfaceId ?? 'default', componentId: comp.id, name: action?.event?.name });
        }}
      >
        {comp.child ? renderChild(comp.child as string) : null}
      </button>
    );
  },

  Card: (comp, _dataModel, renderChild) => {
    const childIds = (comp.children as string[]) ?? [];
    return (
      <div data-a2ui-id={comp.id} data-a2ui-card="">
        <h3>{String(comp.title ?? '')}</h3>
        <div>{childIds.map((id) => renderChild(id))}</div>
      </div>
    );
  },

  List: (comp) => {
    const items = (comp.items as string[]) ?? [];
    const Tag = comp.ordered ? 'ol' : 'ul';
    return (
      <Tag data-a2ui-id={comp.id}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    );
  },

  Divider: (comp) => {
    return <hr data-a2ui-id={comp.id} />;
  },

  Badge: (comp) => {
    return (
      <span data-a2ui-id={comp.id} data-variant={comp.variant ?? 'default'}>
        {String(comp.text ?? '')}
      </span>
    );
  },
};
