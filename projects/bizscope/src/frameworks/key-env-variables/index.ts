import type { KeyEnvVariablesData, EnvVariable, PipelineContext } from '../types';

export async function generate(ctx: PipelineContext): Promise<KeyEnvVariablesData> {
  if (!ctx.pest) {
    throw new Error('PEST data is required for key environment variables');
  }

  const factors = ctx.pest.factors;

  let oCount = 0;
  let tCount = 0;

  const opportunities: EnvVariable[] = factors
    .filter((f) => f.classification === 'opportunity')
    .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
    .map((f) => ({
      id: `O${++oCount}`,
      label: f.factor,
      classification: 'opportunity' as const,
      probability: f.probability,
      impact: f.impact,
      priorityScore: Math.round(f.probability * f.impact * 100) / 100,
      description: f.implication,
    }));

  const threats: EnvVariable[] = factors
    .filter((f) => f.classification === 'threat')
    .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
    .map((f) => ({
      id: `T${++tCount}`,
      label: f.factor,
      classification: 'threat' as const,
      probability: f.probability,
      impact: f.impact,
      priorityScore: Math.round(f.probability * f.impact * 100) / 100,
      description: f.implication,
    }));

  const allVars = [...opportunities, ...threats]
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const priorityRanking = allVars.map((v) => ({
    id: v.id,
    label: v.label,
    score: v.priorityScore,
  }));

  return {
    type: 'key-env-variables',
    opportunities,
    threats,
    priorityRanking,
    summary: `기회 ${opportunities.length}개(${opportunities.map((o) => o.id).join(',')}), 위협 ${threats.length}개(${threats.map((t) => t.id).join(',')}) 도출. 최우선: ${priorityRanking[0]?.id ?? '-'} ${priorityRanking[0]?.label ?? '-'}.`,
  };
}
