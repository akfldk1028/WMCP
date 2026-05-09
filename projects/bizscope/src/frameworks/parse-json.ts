/** Attempt basic JSON repair for common LLM issues */
function repairJSON(raw: string): string {
  let s = raw.trim();
  // Remove trailing text after the last } or ]
  const lastBrace = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (lastBrace > 0) s = s.slice(0, lastBrace + 1);
  // Fix trailing commas: ,} → } and ,] → ]
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Fix unescaped newlines/tabs inside strings
  s = s.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
  s = s.replace(/(?<=:\s*"[^"]*)\t(?=[^"]*")/g, '\\t');
  // Fix unescaped control characters inside strings
  s = s.replace(/[\x00-\x1f]/g, (ch) => {
    if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
    return `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
  });
  return s;
}

/** More aggressive JSON repair: try to fix truncated/malformed output */
function aggressiveRepairJSON(raw: string): string {
  let s = repairJSON(raw);
  // Close unclosed strings: find last unclosed quote
  let inString = false;
  let lastQuoteIdx = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') { i++; continue; }
    if (s[i] === '"') { inString = !inString; lastQuoteIdx = i; }
  }
  if (inString && lastQuoteIdx > 0) {
    // Truncated inside a string value — close it and close all brackets
    s = s.slice(0, lastQuoteIdx) + '"';
  }
  // Count unclosed brackets and close them
  let braces = 0;
  let brackets = 0;
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && inStr) { i++; continue; }
    if (s[i] === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (s[i] === '{') braces++;
    else if (s[i] === '}') braces--;
    else if (s[i] === '[') brackets++;
    else if (s[i] === ']') brackets--;
  }
  // Remove trailing comma before closing
  s = s.replace(/,\s*$/, '');
  for (let i = 0; i < brackets; i++) s += ']';
  for (let i = 0; i < braces; i++) s += '}';
  return s;
}

/** Extract JSON from an AI response that may contain markdown code fences. */
export function extractJSON<T>(raw: string): T {
  // Strip BOM if present
  let input = raw.replace(/^\uFEFF/, '');

  // 1) Try to find JSON inside code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = input.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // fence content wasn't valid JSON, fall through
    }
  }

  // 2) Fallback: find the first top-level { ... } or [ ... ]
  const startIdx = input.search(/[\[{]/);
  if (startIdx !== -1) {
    const opener = input[startIdx];
    const closer = opener === '{' ? '}' : ']';

    // Walk forward to find the matching closing bracket
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIdx; i < input.length; i++) {
      const ch = input[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === opener) depth++;
      else if (ch === closer) depth--;
      if (depth === 0) {
        const candidate = input.slice(startIdx, i + 1);
        try {
          return JSON.parse(candidate) as T;
        } catch {
          // matched brackets but invalid JSON, fall through
          break;
        }
      }
    }
  }

  // 3) Try with JSON repair (trailing commas, etc.)
  const slice = input.slice(startIdx !== -1 ? startIdx : 0);
  const repaired = repairJSON(slice);
  try {
    return JSON.parse(repaired) as T;
  } catch { /* fall through */ }

  // 3.5) Aggressive repair (unclosed strings/brackets)
  const aggressive = aggressiveRepairJSON(slice);
  try {
    return JSON.parse(aggressive) as T;
  } catch { /* fall through */ }

  // 4) Last resort: try parsing the whole trimmed input
  try {
    return JSON.parse(input.trim()) as T;
  } catch (err) {
    const preview = raw.slice(0, 200).replace(/\n/g, '\\n');
    throw new Error(
      `Failed to extract JSON from AI response. ` +
        `Parse error: ${err instanceof Error ? err.message : String(err)}. ` +
        `Input preview (first 200 chars): "${preview}"`,
    );
  }
}
