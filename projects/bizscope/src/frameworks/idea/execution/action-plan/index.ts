import { generateSection, generateWithEnsemble } from '@/lib/claude';
import { extractJSON } from '@/frameworks/parse-json';
import type {
  ActionPlanData,
  Milestone,
  KeyMetric,
  TeamRequirement,
  YearProjection,
  Verdict,
  ScoreCard,
  ScoreDimension,
  PipelineContext,
} from '@/frameworks/types';
import { SYSTEM_PROMPT, buildUserMessage, buildWebMCPUserMessage } from './prompts';

const VALID_TEAM_PRIORITIES = ['critical', 'important', 'nice-to-have'] as const;
const VALID_RECOMMENDATIONS = ['strong-go', 'go', 'conditional', 'no-go'] as const;
const VALID_DIM_VERDICTS = ['strong', 'adequate', 'weak', 'critical'] as const;
const VALID_CONFIDENCE = ['high', 'medium', 'low'] as const;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val ?? min)));
}

function normalizeMilestones(raw: Milestone[]): Milestone[] {
  return (raw ?? []).map((m) => ({
    phase: m.phase ?? '',
    timeline: m.timeline ?? '',
    deliverables: m.deliverables ?? [],
    budget: m.budget,
  }));
}

function normalizeMetrics(raw: KeyMetric[]): KeyMetric[] {
  return (raw ?? []).map((m) => ({
    metric: m.metric ?? '',
    target: m.target ?? '',
    timeline: m.timeline ?? '',
  }));
}

function normalizeTeam(raw: TeamRequirement[]): TeamRequirement[] {
  return (raw ?? []).map((t) => ({
    role: t.role ?? '',
    count: Math.max(1, Math.round(t.count ?? 1)),
    priority: VALID_TEAM_PRIORITIES.includes(t.priority as (typeof VALID_TEAM_PRIORITIES)[number])
      ? (t.priority as TeamRequirement['priority'])
      : 'important',
  }));
}

function normalizeProjection(raw: YearProjection | undefined): YearProjection {
  return {
    revenue: raw?.revenue ?? '',
    cost: raw?.cost ?? '',
    profit: raw?.profit ?? '',
  };
}

function normalizeVerdict(raw: Verdict | undefined): Verdict {
  const recommendation = VALID_RECOMMENDATIONS.includes(
    raw?.recommendation as (typeof VALID_RECOMMENDATIONS)[number],
  )
    ? (raw!.recommendation as Verdict['recommendation'])
    : 'conditional';

  return {
    score: clamp(raw?.score ?? 5, 1, 10),
    recommendation,
    reasoning: raw?.reasoning ?? '',
  };
}

function normalizeDimension(raw: ScoreDimension): ScoreDimension {
  const verdict = VALID_DIM_VERDICTS.includes(raw?.verdict as (typeof VALID_DIM_VERDICTS)[number])
    ? (raw.verdict as ScoreDimension['verdict'])
    : 'adequate';

  return {
    dimension: raw?.dimension ?? '',
    score: clamp(raw?.score ?? 5, 1, 10),
    evidence: raw?.evidence ?? '',
    verdict,
  };
}

function normalizeScoreCard(raw: ScoreCard | undefined): ScoreCard | undefined {
  if (!raw || !Array.isArray(raw.dimensions) || raw.dimensions.length === 0) {
    return undefined;
  }

  const dimensions = raw.dimensions.map(normalizeDimension);
  const avg = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
  const totalScore = Math.round(avg * 10) / 10;

  const confidence = VALID_CONFIDENCE.includes(raw.confidence as (typeof VALID_CONFIDENCE)[number])
    ? (raw.confidence as ScoreCard['confidence'])
    : 'medium';

  return { dimensions, totalScore, confidence };
}

async function callAI(ctx: PipelineContext, systemPrompt: string, userMessage: string): Promise<string> {
  if (ctx.ensembleEnabled === true) {
    const { text } = await generateWithEnsemble(systemPrompt, userMessage);
    return text;
  }
  return generateSection(systemPrompt, userMessage);
}

export async function generate(ctx: PipelineContext): Promise<ActionPlanData> {
  const raw = await callAI(ctx, SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<ActionPlanData, 'type'>>(raw);

  const scoreCard = normalizeScoreCard(parsed.scoreCard);

  return {
    type: 'action-plan',
    milestones: normalizeMilestones(parsed.milestones),
    keyMetrics: normalizeMetrics(parsed.keyMetrics),
    teamRequirements: normalizeTeam(parsed.teamRequirements),
    financialProjection: {
      year1: normalizeProjection(parsed.financialProjection?.year1),
      year2: normalizeProjection(parsed.financialProjection?.year2),
      year3: normalizeProjection(parsed.financialProjection?.year3),
    },
    verdict: normalizeVerdict(parsed.verdict),
    ...(scoreCard && { scoreCard }),
    summary: parsed.summary ?? '',
  };
}

export async function generateWithResearch(
  ctx: PipelineContext,
  research: string,
): Promise<ActionPlanData> {
  const raw = await callAI(ctx, SYSTEM_PROMPT, buildWebMCPUserMessage(ctx, research));
  const parsed = extractJSON<Omit<ActionPlanData, 'type'>>(raw);

  const scoreCard = normalizeScoreCard(parsed.scoreCard);

  return {
    type: 'action-plan',
    milestones: normalizeMilestones(parsed.milestones),
    keyMetrics: normalizeMetrics(parsed.keyMetrics),
    teamRequirements: normalizeTeam(parsed.teamRequirements),
    financialProjection: {
      year1: normalizeProjection(parsed.financialProjection?.year1),
      year2: normalizeProjection(parsed.financialProjection?.year2),
      year3: normalizeProjection(parsed.financialProjection?.year3),
    },
    verdict: normalizeVerdict(parsed.verdict),
    ...(scoreCard && { scoreCard }),
    summary: parsed.summary ?? '',
  };
}
