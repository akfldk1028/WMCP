import type { A2UICatalog, A2UIComponent } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateComponents(
  components: A2UIComponent[],
  catalog: A2UICatalog,
): ValidationResult {
  const errors: string[] = [];
  const catalogMap = new Map(catalog.components.map((c) => [c.component, c]));
  const seenIds = new Set<string>();

  for (const comp of components) {
    if (seenIds.has(comp.id)) {
      errors.push(`Duplicate component id: "${comp.id}"`);
      continue;
    }
    seenIds.add(comp.id);

    const entry = catalogMap.get(comp.component);
    if (!entry) {
      errors.push(
        `Component "${comp.component}" (id: "${comp.id}") is not in catalog "${catalog.name}"`,
      );
      continue;
    }

    for (const [propName, propDef] of Object.entries(entry.props)) {
      if (propDef.required && !(propName in comp)) {
        errors.push(
          `Component "${comp.id}" (${comp.component}) missing required prop: "${propName}"`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
