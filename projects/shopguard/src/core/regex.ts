/** Shared price regex — single source of truth across all modules */
export const PRICE_REGEX_SOURCE =
  String.raw`(?:\$|€|£|¥|₩|USD|EUR|GBP|KRW)\s*(\d{1,3}(?:[,.]?\d{3})*(?:[.,]\d{1,2})?)|(\d{1,3}(?:[,.]?\d{3})*)\s*(?:원|円)`;

/** Create a new global RegExp instance for price matching (safe for loops) */
export function createPriceRegex(): RegExp {
  return new RegExp(PRICE_REGEX_SOURCE, 'g');
}

/** Parse currency from a matched price string */
export function parseCurrency(text: string): string {
  if (/[₩]|KRW|원/.test(text)) return 'KRW';
  if (/€|EUR/.test(text)) return 'EUR';
  if (/£|GBP/.test(text)) return 'GBP';
  if (/[¥]|円|JPY/.test(text)) return 'JPY';
  return 'USD';
}

/** Parse amount in cents from a matched price string */
export function parseAmountCents(amountStr: string, currency: string): number {
  const cleaned = amountStr.replace(/,/g, '');
  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return 0;
  return currency === 'KRW' || currency === 'JPY'
    ? Math.round(amount)
    : Math.round(amount * 100);
}
