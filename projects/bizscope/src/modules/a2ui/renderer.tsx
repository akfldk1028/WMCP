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

/** Normalize children: AI may send object[] instead of string[]. Flatten inline objects into the map. */
function normalizeComponents(components: A2UIComponent[]): A2UIComponent[] {
  const result: A2UIComponent[] = [];
  for (const comp of components) {
    const normalized = { ...comp };
    if (Array.isArray(comp.children)) {
      const childIdList: string[] = [];
      for (const child of comp.children as unknown[]) {
        if (typeof child === 'string') {
          childIdList.push(child);
        } else if (child && typeof child === 'object' && 'id' in child && 'component' in child) {
          const inlineComp = child as A2UIComponent;
          childIdList.push(inlineComp.id);
          result.push(...normalizeComponents([inlineComp]));
        }
      }
      normalized.children = childIdList;
    }
    if (comp.child && typeof comp.child === 'object' && 'id' in comp.child && 'component' in comp.child) {
      const inlineChild = comp.child as unknown as A2UIComponent;
      normalized.child = inlineChild.id;
      result.push(...normalizeComponents([inlineChild]));
    }
    result.push(normalized);
  }
  return result;
}

export function A2UIRenderer({
  components,
  dataModel,
  onEvent,
  surfaceId = 'default',
  componentOverrides,
}: A2UIRendererProps) {
  const allComponents = normalizeComponents(components);
  const componentMap = new Map(allComponents.map((c) => [c.id, c]));
  const childIds = new Set<string>();

  for (const comp of allComponents) {
    if (typeof comp.child === 'string') childIds.add(comp.child);
    if (comp.children) {
      for (const id of comp.children as string[]) {
        childIds.add(id);
      }
    }
  }

  const rootComponents = allComponents.filter((c) => !childIds.has(c.id));

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

  return <div data-a2ui-surface={surfaceId} className="space-y-3">{rootComponents.map(renderComponent)}</div>;
}

type BuiltInRenderer = (
  comp: A2UIComponent,
  dataModel: Record<string, unknown>,
  renderChild: (id: string) => React.ReactNode,
  onEvent?: (event: A2UIEvent) => void,
  surfaceId?: string,
) => React.ReactNode;

const VARIANT_COLORS: Record<string, string> = {
  default: 'border-border bg-muted/50 text-foreground',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
};

const BUILT_IN_COMPONENTS: Record<string, BuiltInRenderer> = {
  Text: (comp, dataModel) => {
    const text = resolveValue(comp.text, dataModel);
    return <p data-a2ui-id={comp.id} className="text-sm leading-relaxed text-foreground">{String(text ?? '')}</p>;
  },

  TextField: (comp, dataModel, _renderChild, onEvent, surfaceId) => {
    const value = resolveValue(comp.value, dataModel);
    const id = `a2ui-${comp.id}`;
    return (
      <div data-a2ui-id={comp.id} className="space-y-1.5">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{String(comp.label ?? '')}</label>
        {comp.multiline ? (
          <textarea
            id={id}
            placeholder={String(comp.placeholder ?? '')}
            defaultValue={String(value ?? '')}
            rows={3}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
      <div data-a2ui-id={comp.id} className="space-y-1.5">
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{String(comp.label ?? '')}</label>
        <select
          id={id}
          defaultValue={String(value ?? '')}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
    const variant = (comp.variant as string) ?? 'primary';
    const cls = variant === 'ghost'
      ? 'text-sm text-muted-foreground hover:text-foreground hover:bg-muted'
      : variant === 'secondary'
        ? 'border bg-muted text-sm text-foreground hover:bg-muted/80'
        : 'bg-indigo-600 text-sm text-white hover:bg-indigo-700';
    return (
      <button
        data-a2ui-id={comp.id}
        type="button"
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition ${cls}`}
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
      <div data-a2ui-id={comp.id} className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">{String(comp.title ?? '')}</h3>
        <div className="space-y-2">{childIds.map((id) => renderChild(id))}</div>
      </div>
    );
  },

  List: (comp) => {
    const items = (comp.items as string[]) ?? [];
    const Tag = comp.ordered ? 'ol' : 'ul';
    return (
      <Tag data-a2ui-id={comp.id} className={`space-y-1 pl-5 text-sm text-foreground ${comp.ordered ? 'list-decimal' : 'list-disc'}`}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    );
  },

  Divider: (comp) => {
    return <hr data-a2ui-id={comp.id} className="border-border" />;
  },

  Badge: (comp) => {
    const v = (comp.variant as string) ?? 'default';
    const cls = VARIANT_COLORS[v] ?? VARIANT_COLORS.default;
    return (
      <span data-a2ui-id={comp.id} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
        {String(comp.text ?? '')}
      </span>
    );
  },

  // -- Domain components (BMC) --

  BmcBlock: (comp, _dataModel, renderChild) => {
    const childIds = (comp.children as string[]) ?? [];
    return (
      <div data-a2ui-id={comp.id} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
        <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
          {String(comp.title ?? '')}
        </h4>
        <div className="space-y-0.5 text-xs">{childIds.map((id) => <React.Fragment key={id}>{renderChild(id)}</React.Fragment>)}</div>
      </div>
    );
  },

  BmcGrid: (comp, _dataModel, renderChild) => {
    const childIds = (comp.children as string[]) ?? [];
    return (
      <div data-a2ui-id={comp.id} className="grid grid-cols-2 gap-1.5">
        {childIds.map((id) => <React.Fragment key={id}>{renderChild(id)}</React.Fragment>)}
      </div>
    );
  },

  // -- Domain components (Service Planning) --

  StageCard: (comp, _dataModel, renderChild) => {
    const childIds = (comp.children as string[]) ?? [];
    return (
      <div data-a2ui-id={comp.id} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          {String(comp.title ?? '')}
        </h4>
        <div className="space-y-1.5">{childIds.map((id) => <React.Fragment key={id}>{renderChild(id)}</React.Fragment>)}</div>
      </div>
    );
  },

  Timeline: (comp) => {
    const items = (comp.items as Array<{ label?: string; date?: string; description?: string } | string>) ?? [];
    return (
      <div data-a2ui-id={comp.id} className="space-y-3 border-l-2 border-border pl-4">
        {items.map((item, i) => {
          const label = typeof item === 'string' ? item : (item.label ?? item.description ?? '');
          const date = typeof item === 'string' ? undefined : item.date;
          return (
            <div key={typeof item === 'string' ? `${item}-${i}` : `${label}-${i}`} className="relative">
              <div className="absolute -left-[calc(1rem+5px)] top-1.5 size-2 rounded-full bg-indigo-500" />
              {date && <span className="text-xs text-muted-foreground">{date}</span>}
              <p className="text-sm text-foreground">{String(label)}</p>
            </div>
          );
        })}
      </div>
    );
  },

  BudgetTable: (comp) => {
    const rows = (comp.rows as Array<{ label?: string; amount?: number | string }>) ?? [];
    const total = comp.total as number | undefined;
    return (
      <table data-a2ui-id={comp.id} className="w-full text-sm">
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.label}-${i}`} className="border-b border-border/50">
              <td className="py-1.5 text-muted-foreground">{String(row.label ?? '')}</td>
              <td className="py-1.5 text-right font-mono text-foreground">{String(row.amount ?? '')}</td>
            </tr>
          ))}
          {total != null && (
            <tr className="font-semibold">
              <td className="py-1.5 text-foreground">Total</td>
              <td className="py-1.5 text-right font-mono text-foreground">{String(total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  },
};
