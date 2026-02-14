import type {
  FlightSearch,
  FlightResult,
  HotelSearch,
  HotelResult,
  BookingRecommendation,
  TravelWebMCPTool,
} from './types.js';

/**
 * Known travel sites that may expose WebMCP tools.
 * As Chrome 146 rolls out, this list will grow dynamically.
 */
const KNOWN_TRAVEL_SITES: Array<{ name: string; url: string; type: 'flight' | 'hotel' | 'both' }> = [
  { name: 'Google Flights', url: 'https://www.google.com/travel/flights', type: 'flight' },
  { name: 'Booking.com', url: 'https://www.booking.com', type: 'hotel' },
  { name: 'Expedia', url: 'https://www.expedia.com', type: 'both' },
  { name: 'Kayak', url: 'https://www.kayak.com', type: 'both' },
  { name: 'Skyscanner', url: 'https://www.skyscanner.com', type: 'flight' },
  { name: 'Agoda', url: 'https://www.agoda.com', type: 'hotel' },
  { name: 'Hotels.com', url: 'https://www.hotels.com', type: 'hotel' },
];

/**
 * Discover WebMCP tools on travel sites.
 * Uses navigator.modelContext when available (Chrome 146+).
 */
export async function discoverTravelTools(
  siteUrl: string,
): Promise<TravelWebMCPTool[]> {
  const tools: TravelWebMCPTool[] = [];

  try {
    const response = await fetch(siteUrl, {
      headers: { 'User-Agent': 'BookingPilot/0.1 WebMCP-Agent' },
    });
    const html = await response.text();

    // Look for WebMCP declarative forms related to travel
    const formRegex = /<form\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
    let match: RegExpExecArray | null;

    while ((match = formRegex.exec(html)) !== null) {
      const attrs = match[1];
      const toolnameMatch = attrs.match(/toolname\s*=\s*["']([^"']+)["']/i);
      if (!toolnameMatch) continue;

      const descMatch = attrs.match(/tooldescription\s*=\s*["']([^"']+)["']/i);
      const toolName = toolnameMatch[1];
      const description = descMatch ? descMatch[1] : '';

      const capabilities = inferCapabilities(toolName, description);

      tools.push({
        siteName: new URL(siteUrl).hostname,
        siteUrl,
        toolName,
        toolDescription: description,
        capabilities,
      });
    }
  } catch {
    // Site unreachable or parsing failed
  }

  return tools;
}

/**
 * Infer tool capabilities from name and description.
 */
function inferCapabilities(
  name: string,
  description: string,
): Array<'flight-search' | 'hotel-search' | 'price-check' | 'booking' | 'availability'> {
  const text = `${name} ${description}`.toLowerCase();
  const caps: Array<'flight-search' | 'hotel-search' | 'price-check' | 'booking' | 'availability'> = [];

  if (/flight|fly|airline|depart|arrive/.test(text)) caps.push('flight-search');
  if (/hotel|room|accommodation|stay|check.?in/.test(text)) caps.push('hotel-search');
  if (/price|cost|rate|fare/.test(text)) caps.push('price-check');
  if (/book|reserve|purchase/.test(text)) caps.push('booking');
  if (/avail|vacancy|seat/.test(text)) caps.push('availability');

  return caps;
}

/**
 * Sort and rank flight results to find the best option.
 */
export function rankFlights(
  results: FlightResult[],
  preferences: { prioritize: 'price' | 'duration' | 'stops' },
): FlightResult[] {
  return [...results].sort((a, b) => {
    switch (preferences.prioritize) {
      case 'price':
        return a.priceCents - b.priceCents;
      case 'duration':
        return a.duration - b.duration;
      case 'stops':
        return a.stops - b.stops || a.priceCents - b.priceCents;
    }
  });
}

/**
 * Sort and rank hotel results.
 */
export function rankHotels(
  results: HotelResult[],
  preferences: { prioritize: 'price' | 'rating' | 'value' },
): HotelResult[] {
  return [...results].sort((a, b) => {
    switch (preferences.prioritize) {
      case 'price':
        return a.totalPriceCents - b.totalPriceCents;
      case 'rating':
        return b.rating - a.rating;
      case 'value':
        // Value = rating per dollar
        const valueA = a.rating / (a.totalPriceCents / 100);
        const valueB = b.rating / (b.totalPriceCents / 100);
        return valueB - valueA;
    }
  });
}

/**
 * Generate booking recommendation.
 */
export function generateRecommendation(
  type: 'flight' | 'hotel',
  results: Array<FlightResult | HotelResult>,
): BookingRecommendation | null {
  if (results.length === 0) return null;

  const best = results[0];
  const alternatives = results.slice(1, 4);

  // Calculate average price for savings estimate
  const prices = results.map((r) =>
    'priceCents' in r ? r.priceCents : (r as HotelResult).totalPriceCents,
  );
  const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
  const bestPrice = prices[0];

  return {
    type,
    bestOption: best,
    alternatives,
    priceTrend: 'unknown',
    bookingAdvice: bestPrice < avgPrice * 0.85
      ? 'Good deal detected - consider booking soon'
      : 'Price is around average - you can wait for a better deal',
    estimatedSavingsCents: Math.max(0, Math.round(avgPrice - bestPrice)),
    confidence: Math.min(95, 50 + results.length * 5),
  };
}

/**
 * Get the list of known travel sites.
 */
export function getKnownTravelSites() {
  return KNOWN_TRAVEL_SITES;
}
