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

  // 3) Last resort: try parsing the whole trimmed input
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
