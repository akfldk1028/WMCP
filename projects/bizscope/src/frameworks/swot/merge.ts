import type { PESTData, InternalCapabilityData, SWOTData } from '../types';

export function mergeSWOT(
  pest: PESTData,
  internal: InternalCapabilityData,
): SWOTData {
  const opportunities = pest.factors
    .filter((f) => f.classification === 'opportunity')
    .map((f) => f.factor);

  const threats = pest.factors
    .filter((f) => f.classification === 'threat')
    .map((f) => f.factor);

  const strengths = internal.overallStrengths.length > 0
    ? internal.overallStrengths
    : internal.capabilities.flatMap((c) => c.strengths).slice(0, 5);

  const weaknesses = internal.overallWeaknesses.length > 0
    ? internal.overallWeaknesses
    : internal.capabilities.flatMap((c) => c.weaknesses).slice(0, 5);

  const summary = [
    `강점 ${strengths.length}개, 약점 ${weaknesses.length}개,`,
    `기회 ${opportunities.length}개, 위협 ${threats.length}개 도출.`,
    internal.summary,
  ].join(' ');

  return {
    type: 'swot-summary',
    strengths,
    weaknesses,
    opportunities,
    threats,
    summary,
  };
}
