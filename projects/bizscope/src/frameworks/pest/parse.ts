import { extractJSON } from '../parse-json';
import type { PESTData, PESTFactor, FiveForceScore, PESTCategory } from '../types';

interface RawFactor {
  category?: string;
  factor?: string;
  description?: string;
  implication?: string;
  probability?: number;
  impact?: number;
  classification?: string;
  fiveForces?: Partial<FiveForceScore>;
}

interface RawPEST {
  factors?: RawFactor[];
  summary?: string;
}

const VALID_CATEGORIES: PESTCategory[] = ['political', 'economic', 'social', 'technological'];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function parseFiveForces(raw?: Partial<FiveForceScore>): FiveForceScore {
  return {
    buyerPower: clamp(raw?.buyerPower ?? 3, 1, 5),
    supplierPower: clamp(raw?.supplierPower ?? 3, 1, 5),
    newEntrants: clamp(raw?.newEntrants ?? 3, 1, 5),
    substitutes: clamp(raw?.substitutes ?? 3, 1, 5),
    rivalry: clamp(raw?.rivalry ?? 3, 1, 5),
  };
}

export function parsePESTResponse(raw: string): PESTData {
  const parsed = extractJSON<RawPEST>(raw);
  const factors: PESTFactor[] = (parsed.factors ?? []).map((f) => ({
    id: crypto.randomUUID(),
    category: VALID_CATEGORIES.includes(f.category as PESTCategory)
      ? (f.category as PESTCategory)
      : 'economic',
    factor: f.factor ?? '',
    description: f.description ?? '',
    implication: f.implication ?? '',
    probability: clamp(f.probability ?? 0.5, 0, 1),
    impact: clamp(Math.round(f.impact ?? 3), 1, 5),
    classification: f.classification === 'opportunity' ? 'opportunity' : 'threat',
    fiveForces: parseFiveForces(f.fiveForces),
  }));

  return {
    type: 'pest-analysis',
    factors,
    summary: parsed.summary ?? '',
  };
}
