import type { A2UIDataRef } from './types';

export function resolvePointer(data: Record<string, unknown>, pointer: string): unknown {
  if (pointer === '') return data;
  const tokens = pointer.slice(1).split('/').map(unescapeToken);
  let current: unknown = data;
  for (const token of tokens) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[token];
  }
  return current;
}

export function setPointer<T extends Record<string, unknown>>(
  data: T,
  pointer: string,
  value: unknown,
): T {
  if (pointer === '') return value as T;
  const tokens = pointer.slice(1).split('/').map(unescapeToken);
  return setDeep(data, tokens, value) as T;
}

function setDeep(obj: unknown, tokens: string[], value: unknown): unknown {
  if (tokens.length === 0) return value;
  const [head, ...rest] = tokens;
  const current = (obj && typeof obj === 'object') ? { ...(obj as Record<string, unknown>) } : {};
  current[head] = setDeep(current[head], rest, value);
  return current;
}

export function isDataRef(value: unknown): value is A2UIDataRef {
  return (
    value !== null &&
    typeof value === 'object' &&
    '$ref' in value &&
    typeof (value as A2UIDataRef).$ref === 'string'
  );
}

export function resolveValue(value: unknown, dataModel: Record<string, unknown>): unknown {
  if (isDataRef(value)) {
    return resolvePointer(dataModel, value.$ref);
  }
  return value;
}

function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}
