/**
 * Types for the Booking Pilot travel optimization agent.
 */

export interface FlightSearch {
  origin: string;       // IATA code (e.g., "ICN")
  destination: string;  // IATA code (e.g., "NRT")
  departDate: string;   // ISO date
  returnDate?: string;  // ISO date (optional for one-way)
  passengers: number;
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  flexibility: number;  // Days of flexibility (+/- N days)
}

export interface FlightResult {
  airline: string;
  flightNumber: string;
  departTime: string;
  arriveTime: string;
  duration: number;      // minutes
  stops: number;
  priceCents: number;
  currency: string;
  bookingUrl: string;
  /** Source site that provided this result */
  source: string;
  /** Whether found via WebMCP tool or scraping */
  discoveryMethod: 'webmcp' | 'api' | 'parsed';
}

export interface HotelSearch {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  minStars?: number;
  maxPriceCents?: number;
  currency?: string;
}

export interface HotelResult {
  name: string;
  stars: number;
  rating: number;         // User rating 0-10
  reviewCount: number;
  priceCentsPerNight: number;
  totalPriceCents: number;
  currency: string;
  address: string;
  amenities: string[];
  bookingUrl: string;
  source: string;
  discoveryMethod: 'webmcp' | 'api' | 'parsed';
  /** Hidden fees detected */
  hiddenFees: Array<{ label: string; amountCents: number }>;
}

/**
 * Price trend data for optimal booking timing.
 */
export interface PriceTrend {
  date: string;
  priceCents: number;
  source: string;
}

/**
 * Booking recommendation from the agent.
 */
export interface BookingRecommendation {
  type: 'flight' | 'hotel';
  /** Best option found */
  bestOption: FlightResult | HotelResult;
  /** Alternative options */
  alternatives: Array<FlightResult | HotelResult>;
  /** Price trend analysis */
  priceTrend: 'rising' | 'falling' | 'stable' | 'unknown';
  /** Should user book now or wait? */
  bookingAdvice: string;
  /** Estimated savings compared to average */
  estimatedSavingsCents: number;
  /** Confidence in recommendation 0-100 */
  confidence: number;
}

/**
 * WebMCP tool discovered on a travel site.
 */
export interface TravelWebMCPTool {
  siteName: string;
  siteUrl: string;
  toolName: string;
  toolDescription: string;
  capabilities: Array<'flight-search' | 'hotel-search' | 'price-check' | 'booking' | 'availability'>;
}

/**
 * Configuration for Booking Pilot.
 */
export interface BookingPilotConfig {
  /** Preferred currency */
  currency: string;
  /** Home airport IATA code */
  homeAirport?: string;
  /** Track prices after booking for refund opportunities */
  trackAfterBooking: boolean;
  /** Maximum number of sites to search */
  maxSources: number;
  /** Include budget airlines */
  includeBudgetAirlines: boolean;
}
