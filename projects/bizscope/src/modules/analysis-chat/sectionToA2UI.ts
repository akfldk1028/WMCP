import type { SectionType, SectionData } from '@/frameworks/types';
import type { A2UIMessage, A2UIComponent } from '@/modules/a2ui/types';

/**
 * Convert section data to A2UI summary components for chat display.
 * Extracts key fields and wraps in Card + List/Text components.
 */
export function sectionToA2UI(sectionType: SectionType, data: SectionData, title: string): A2UIMessage | null {
  const raw = data as unknown as Record<string, unknown>;
  const components: A2UIComponent[] = [];
  let childIdx = 0;

  function addText(text: string): string {
    const id = `${sectionType}-text-${childIdx++}`;
    components.push({ id, component: 'Text', text });
    return id;
  }

  function addList(items: string[], ordered = false): string {
    const id = `${sectionType}-list-${childIdx++}`;
    components.push({ id, component: 'List', items, ordered });
    return id;
  }

  function addBadge(text: string, variant = 'default'): string {
    const id = `${sectionType}-badge-${childIdx++}`;
    components.push({ id, component: 'Badge', text, variant });
    return id;
  }

  const children: string[] = [];

  // Description
  if (typeof raw.description === 'string') {
    children.push(addText(raw.description.slice(0, 200) + (raw.description.length > 200 ? '...' : '')));
  }

  // Key strengths / main products / key findings
  const listFields = ['keyStrengths', 'mainProducts', 'keyFindings', 'threats', 'opportunities', 'strengths', 'weaknesses'];
  for (const field of listFields) {
    const arr = raw[field];
    if (Array.isArray(arr) && arr.length > 0) {
      const items = arr.slice(0, 5).map((item: unknown) => typeof item === 'string' ? item : JSON.stringify(item));
      children.push(addList(items));
      break; // Only show first matching list
    }
  }

  // Score / verdict badges
  if (raw.totalScore != null) {
    children.push(addBadge(`Score: ${raw.totalScore}`, 'success'));
  }
  if (raw.verdict && typeof raw.verdict === 'object') {
    const v = raw.verdict as Record<string, unknown>;
    if (v.decision) children.push(addBadge(String(v.decision), v.decision === 'GO' ? 'success' : 'warning'));
  }

  // Revenue / market cap
  if (typeof raw.revenue === 'string' || typeof raw.revenue === 'number') {
    children.push(addText(`Revenue: ${raw.revenue}`));
  }

  if (children.length === 0) return null;

  // Wrap in Card
  const cardId = `${sectionType}-card`;
  components.push({ id: cardId, component: 'Card', title, children });

  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'analysis',
      components,
    },
  };
}
