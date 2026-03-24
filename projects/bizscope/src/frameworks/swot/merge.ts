import type { KeyEnvVariablesData, InternalCapabilityData, SWOTData } from '../types';

export function mergeSWOT(
  keyEnv: KeyEnvVariablesData,
  internal: InternalCapabilityData,
): SWOTData {
  // O/T come from keyEnvVariables with their IDs
  const opportunities = keyEnv.opportunities.map(o => `${o.id}. ${o.label}`);
  const threats = keyEnv.threats.map(t => `${t.id}. ${t.label}`);

  // S/W come from internal capability with IDs
  const strengths = internal.overallStrengths.length > 0
    ? internal.overallStrengths.map(s => `${s.id}. ${s.description}`)
    : internal.capabilities.flatMap(c => c.strengths.map(s => `${s.id}. ${s.description}`)).slice(0, 6);

  const weaknesses = internal.overallWeaknesses.length > 0
    ? internal.overallWeaknesses.map(w => `${w.id}. ${w.description}`)
    : internal.capabilities.flatMap(c => c.weaknesses.map(w => `${w.id}. ${w.description}`)).slice(0, 6);

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
