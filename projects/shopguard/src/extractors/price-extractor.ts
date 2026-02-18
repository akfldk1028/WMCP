import * as cheerio from 'cheerio';
import type { PriceComponent } from '../core/types.js';
import { createPriceRegex, parseCurrency, parseAmountCents } from '../core/regex.js';

const PRICE_SELECTORS = [
  '[class*="price"]', '[class*="Price"]',
  '[class*="cost"]', '[class*="Cost"]',
  '[data-price]', '[itemprop="price"]',
  '[class*="가격"]', '[class*="금액"]',
  '[class*="amount"]', '[class*="total"]',
];

/** Extract price components from HTML using both structure and regex */
export function extractPriceComponents(html: string): PriceComponent[] {
  const $ = cheerio.load(html);
  const components: PriceComponent[] = [];
  const seen = new Set<string>();

  // Structured extraction from price elements
  for (const sel of PRICE_SELECTORS) {
    $(sel).each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (!text || text.length > 200) return;

      const priceRegex = createPriceRegex();
      let match: RegExpExecArray | null;
      while ((match = priceRegex.exec(text)) !== null) {
        const fullMatch = match[0];
        if (seen.has(fullMatch)) continue;
        seen.add(fullMatch);

        const currency = parseCurrency(fullMatch);
        const amountCents = parseAmountCents(match[1] ?? match[2] ?? '0', currency);
        if (amountCents === 0) continue;

        const cls = $el.attr('class') ?? '';
        const label = cls.match(/(?:price|cost|fee|total|amount|가격|금액|배송비|수수료)\S*/i)?.[0] ?? 'detected-price';
        const isHidden = $el.css('display') === 'none'
          || $el.css('visibility') === 'hidden'
          || $el.hasClass('hidden')
          || $el.hasClass('sr-only');

        components.push({
          label,
          amountCents,
          currency,
          wasVisible: !isHidden,
          addedAtCheckout: /checkout|cart|결제|장바구니/i.test(cls),
        });
      }
    });
  }

  // Fallback: regex scan the full text for any remaining prices
  const bodyText = $('body').text();
  const fallbackRegex = createPriceRegex();
  let fMatch: RegExpExecArray | null;
  while ((fMatch = fallbackRegex.exec(bodyText)) !== null) {
    const fullMatch = fMatch[0];
    if (seen.has(fullMatch)) continue;
    seen.add(fullMatch);

    const currency = parseCurrency(fullMatch);
    const amountCents = parseAmountCents(fMatch[1] ?? fMatch[2] ?? '0', currency);
    if (amountCents === 0) continue;

    components.push({
      label: 'detected-price',
      amountCents,
      currency,
      wasVisible: true,
      addedAtCheckout: false,
    });
  }

  return components;
}
