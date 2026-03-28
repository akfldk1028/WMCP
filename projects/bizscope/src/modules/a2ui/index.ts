// A2UI Core Module — public API
// No BizScope dependencies. Reusable in any React project.

export type {
  A2UIComponent,
  A2UISurface,
  A2UIMessage,
  A2UIUpdateComponents,
  A2UIUpdateDataModel,
  A2UIDataRef,
  A2UICatalog,
  A2UICatalogEntry,
  A2UIEvent,
} from './types';

export { A2UIRenderer } from './renderer';
export type { RenderedComponentProps } from './renderer';

export { resolvePointer, setPointer, isDataRef, resolveValue } from './data-binding';

export { validateComponents } from './validator';
export type { ValidationResult } from './validator';

export { DEFAULT_CATALOG } from './catalog';
