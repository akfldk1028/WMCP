import { PLAN_STAGES, type PlanStage, type PlanStageMeta, type StageData } from './types';

export const PLAN_STAGE_META: Record<PlanStage, Omit<PlanStageMeta, 'stage'>> = {
  'executive-summary': {
    label: 'Executive Summary',
    labelKo: '프로젝트 개요',
    description: 'High-level overview of the service, its objectives, and creative direction.',
    subsections: ['Project Overview', 'Objectives', 'Creative Statement'],
  },
  'conceptual-framework': {
    label: 'Conceptual Framework',
    labelKo: '컨셉 프레임워크',
    description: 'Define the theme, target personas, and user journey for the service.',
    subsections: ['Theme & Narrative', 'User Personas', 'User Journey'],
  },
  'design-content': {
    label: 'Design & Content Strategy',
    labelKo: '디자인 & 컨텐츠 전략',
    description: 'Visual direction, content plan, prototyping approach, and accessibility standards.',
    subsections: ['Visual Direction', 'Content Plan', 'Prototyping', 'Accessibility'],
  },
  'technical-arch': {
    label: 'Technical Architecture',
    labelKo: '기술 아키텍처',
    description: 'Platform choices, infrastructure design, security model, and privacy considerations.',
    subsections: ['Platform and Infrastructure', 'Security & Privacy'],
  },
  'dev-roadmap': {
    label: 'Development Roadmap',
    labelKo: '개발 로드맵',
    description: 'Milestones, budget allocation, resource planning, and risk mitigation strategies.',
    subsections: ['Milestones', 'Budget & Resource Allocation', 'Risk Management'],
  },
  'marketing': {
    label: 'Marketing & Community',
    labelKo: '마케팅 & 커뮤니티',
    description: 'Go-to-market strategy, community building, and partnership opportunities.',
    subsections: ['Marketing Strategy', 'Community Engagement', 'Partnership'],
  },
  'post-launch': {
    label: 'Post-Launch & Evolution',
    labelKo: '출시 후 & 진화',
    description: 'Ongoing maintenance, user feedback loops, and scalability planning.',
    subsections: ['Maintenance & Operations', 'Feedback Loop', 'Scalability'],
  },
  'legal-ethical': {
    label: 'Legal & Ethical',
    labelKo: '법률 & 윤리',
    description: 'Regulatory compliance requirements and ethical guidelines for the service.',
    subsections: ['Compliance', 'Ethical Guidelines'],
  },
};

export function getPlanningSystemPrompt(): string {
  return `You are a service planning expert helping users build comprehensive and actionable service plans using an 8-stage methodology.

The 8-stage service planning framework covers:
1. Executive Summary — project overview, objectives, creative statement
2. Conceptual Framework — theme & narrative, user personas, user journey
3. Design & Content Strategy — visual direction, content plan, prototyping, accessibility
4. Technical Architecture — platform & infrastructure, security & privacy
5. Development Roadmap — milestones, budget & resource allocation, risk management
6. Marketing & Community — marketing strategy, community engagement, partnerships
7. Post-Launch & Evolution — maintenance & operations, feedback loop, scalability
8. Legal & Ethical — compliance, ethical guidelines

Your role in service planning is to:
1. Guide users through each stage with targeted questions
2. Generate structured, concrete content for each subsection
3. Identify dependencies between stages (e.g., technical decisions informed by conceptual framework)
4. Flag risks, gaps, or inconsistencies across the plan
5. Keep outputs organized and actionable

Always produce outputs as structured sections with clear headings. Focus on specificity and practicality over vague generalities.`;
}

export function getStagePrompt(
  stage: PlanStage,
  existingStages?: Partial<Record<string, { sections: Record<string, unknown> }>>,
): string {
  const meta = PLAN_STAGE_META[stage];
  let prompt = `## ${meta.label} (${meta.labelKo})\n\n`;
  prompt += `${meta.description}\n\n`;
  prompt += `### Subsections to Address\n`;
  for (const sub of meta.subsections) {
    prompt += `- ${sub}\n`;
  }

  if (existingStages) {
    const contextEntries: string[] = [];
    for (const [key, data] of Object.entries(existingStages)) {
      if (data && Object.keys(data.sections).length > 0) {
        const stageMeta = PLAN_STAGE_META[key as PlanStage];
        const label = stageMeta ? stageMeta.label : key;
        const sectionValues = Object.values(data.sections)
          .filter((v) => v !== null && v !== undefined && v !== '')
          .join(', ');
        if (sectionValues) {
          contextEntries.push(`**${label}**: ${sectionValues}`);
        }
      }
    }
    if (contextEntries.length > 0) {
      prompt += `\n### Context from Existing Stages\n`;
      for (const entry of contextEntries) {
        prompt += `- ${entry}\n`;
      }
    }
  }

  prompt += `\nBased on the above, provide detailed content for each subsection of ${meta.label}.`;
  return prompt;
}
