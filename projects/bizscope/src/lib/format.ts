/**
 * Display formatters for AI-returned numeric values.
 *
 * AI (Qwen) sometimes returns raw numbers (e.g. 388400000000000) for fields
 * typed as string. These helpers normalize: pass through already-formatted
 * strings, and format pure numbers/numeric strings with KRW magnitude units.
 */

const HAS_UNIT_RE = /[조억백만원$€¥%]|[\d.]\s*(?:T|B|M|K)\b|\b(?:billion|million|trillion|thousand|won)\b/i;
const PURE_NUMBER_RE = /^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$|^-?\d+(?:\.\d+)?$/;

function asNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!PURE_NUMBER_RE.test(trimmed)) return null;
  const n = parseFloat(trimmed.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function isPreFormattedString(value: unknown): value is string {
  return typeof value === 'string' && HAS_UNIT_RE.test(value);
}

/** Format a currency-like value (KRW). Pass-through if already formatted. */
export function formatAmount(value: unknown): string {
  if (value == null || value === '') return '-';
  if (isPreFormattedString(value)) return value;
  const n = asNumber(value);
  if (n === null) return String(value);
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${(n / 1e12).toFixed(1)}조원`;
  if (abs >= 1e8) return `${Math.round(n / 1e8).toLocaleString()}억원`;
  if (abs >= 1e4) return `${Math.round(n / 1e4).toLocaleString()}만원`;
  return `${n.toLocaleString()}원`;
}

/** Format a percentage. Pass-through if already contains %. */
export function formatPercent(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value === 'string' && /%/.test(value)) return value;
  const n = asNumber(value);
  if (n === null) return String(value);
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${fixed}%`;
}

/** Format a count (no unit). Pass-through if already formatted. */
export function formatCount(value: unknown): string {
  if (value == null || value === '') return '-';
  if (isPreFormattedString(value)) return value;
  const n = asNumber(value);
  if (n === null) return String(value);
  return n.toLocaleString();
}

const PERCENT_METRIC_RE = /성장률|증가율|점유율|률|마진|수익률|이익률|회수율|점유|비율|rate|share|margin|ratio|growth|cagr/i;
const COUNT_METRIC_RE = /수$|수량|count|users|고객수|회원수|건수|명$/i;
const AMOUNT_METRIC_RE = /매출|이익|비용|자본|자산|부채|cost|revenue|profit|sales|income|burn|runway|valuation/i;

/** Pick formatter based on metric label semantics. Defaults to amount. */
export function formatKpiValue(metric: string, value: unknown): string {
  if (value == null || value === '') return '-';
  if (isPreFormattedString(value)) return String(value);
  if (PERCENT_METRIC_RE.test(metric)) return formatPercent(value);
  if (COUNT_METRIC_RE.test(metric)) return formatCount(value);
  if (AMOUNT_METRIC_RE.test(metric)) return formatAmount(value);
  // Unknown metric — if it's a number, show with locale separators
  const n = asNumber(value);
  if (n !== null) {
    if (Math.abs(n) >= 1e6) return formatAmount(n);
    return n.toLocaleString();
  }
  return String(value);
}