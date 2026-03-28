import { BMC_BLOCKS, type BmcBlock, type BmcBlockData } from './types';

export const BMC_BLOCK_META: Record<BmcBlock, { label: string; labelKo: string; description: string; guideQuestions: string[] }> = {
  'customer-segments': {
    label: 'Customer Segments',
    labelKo: '고객 분류',
    description: 'Who are you creating value for? Who are your most important customers?',
    guideQuestions: [
      'Is this a Mass Market, Niche Market, Segmented, Diversified, or Multi-sided platform?',
      'Which customer groups do you serve?',
      'What are their key characteristics and behaviors?',
      'Which segments are most important to your business?',
    ],
  },
  'value-proposition': {
    label: 'Value Proposition',
    labelKo: '가치 제안',
    description: 'What value do you deliver to the customer? Which customer problems are you solving?',
    guideQuestions: [
      'What bundle of products/services do you offer to each segment?',
      'Does your value come from Newness, Performance, Customization, or Price?',
      'What customer needs are you satisfying?',
      'How do you reduce cost or risk for the customer?',
    ],
  },
  'channels': {
    label: 'Channels',
    labelKo: '채널',
    description: 'How do you reach your customer segments to deliver your value proposition?',
    guideQuestions: [
      'How do customers become aware of your offering? (Awareness)',
      'How do customers evaluate your value proposition? (Evaluation)',
      'How do customers purchase? (Purchase)',
      'How do you deliver your value proposition? (Delivery)',
      'How do you provide post-purchase support? (After Sales)',
    ],
  },
  'customer-relationships': {
    label: 'Customer Relationships',
    labelKo: '고객 관계',
    description: 'What type of relationship does each segment expect you to establish and maintain?',
    guideQuestions: [
      'Do you offer Personal Assistance or Dedicated Personal Assistance?',
      'Is it Self-Service or Automated Services?',
      'Do you build Communities around your product?',
      'Do you engage in Co-creation with customers?',
    ],
  },
  'revenue-streams': {
    label: 'Revenue Streams',
    labelKo: '수익원',
    description: 'For what value are your customers willing to pay?',
    guideQuestions: [
      'Do you use Asset Sale, Usage Fee, or Subscription Fees?',
      'Do you earn from Licensing, Brokerage Fees, or Advertising?',
      'What are customers currently paying for?',
      'How much does each revenue stream contribute to total revenues?',
    ],
  },
  'key-resources': {
    label: 'Key Resources',
    labelKo: '핵심 자원',
    description: 'What key resources does your value proposition require?',
    guideQuestions: [
      'What Physical resources do you need (facilities, machines, vehicles)?',
      'What Intellectual resources are critical (brands, patents, data)?',
      'What Human resources are essential?',
      'What Financial resources or guarantees do you need?',
    ],
  },
  'key-activities': {
    label: 'Key Activities',
    labelKo: '핵심 활동',
    description: 'What key activities does your value proposition require?',
    guideQuestions: [
      'Are your key activities focused on Production?',
      'Do you primarily engage in Problem Solving for customers?',
      'Are you managing a Platform or Network?',
      'Which activities are most important to your revenue streams?',
    ],
  },
  'key-partners': {
    label: 'Key Partners',
    labelKo: '핵심 파트너십',
    description: 'Who are your key partners and suppliers?',
    guideQuestions: [
      'Which partnerships optimize your business model or reduce costs? (Optimization)',
      'Which partnerships reduce risk and uncertainty? (Risk Reduction)',
      'Which partnerships help you acquire particular resources or activities? (Resource Acquisition)',
      'What are your motivations for partnerships?',
    ],
  },
  'cost-structure': {
    label: 'Cost Structure',
    labelKo: '비용 구조',
    description: 'What are the most important costs inherent in your business model?',
    guideQuestions: [
      'Is your business more Cost-Driven (lean cost structure) or Value-Driven (premium value)?',
      'What are your most important Fixed Costs (salaries, rent)?',
      'What are your most important Variable Costs?',
      'Do you benefit from Economies of Scale or Economies of Scope?',
    ],
  },
};

export function getBmcSystemPrompt(): string {
  return `You are a Business Model Canvas (BMC) expert assistant helping users build comprehensive and actionable business models.

The Business Model Canvas has 9 building blocks organized as follows:
- Right side (Emotion/Market): Customer Segments, Channels, Customer Relationships, Revenue Streams
- Left side (Logic/Operations): Key Resources, Key Activities, Key Partners, Cost Structure
- Center: Value Proposition (the heart of your business model)

Your role is to:
1. Ask targeted guide questions for each block
2. Suggest concrete, specific entries rather than vague statements
3. Identify connections between blocks (e.g., how customer segments inform value proposition)
4. Flag potential gaps or inconsistencies in the model
5. Keep responses structured and actionable

Always generate entries as concise bullet points (5-15 words each). Focus on specificity over generality.`;
}

export function getBmcBlockPrompt(
  block: BmcBlock,
  existingBlocks?: Partial<Record<string, { entries: string[] }>>,
): string {
  const meta = BMC_BLOCK_META[block];
  let prompt = `## ${meta.label} (${meta.labelKo})\n\n`;
  prompt += `${meta.description}\n\n`;
  prompt += `### Guide Questions\n`;
  for (const q of meta.guideQuestions) {
    prompt += `- ${q}\n`;
  }

  if (existingBlocks) {
    const contextEntries: string[] = [];
    for (const [key, data] of Object.entries(existingBlocks)) {
      if (data && data.entries.length > 0) {
        const blockMeta = BMC_BLOCK_META[key as BmcBlock];
        const label = blockMeta ? blockMeta.label : key;
        contextEntries.push(`**${label}**: ${data.entries.join(', ')}`);
      }
    }
    if (contextEntries.length > 0) {
      prompt += `\n### Context from Existing Blocks\n`;
      for (const entry of contextEntries) {
        prompt += `- ${entry}\n`;
      }
    }
  }

  prompt += `\nBased on the above, suggest 3-5 specific entries for the ${meta.label} block.`;
  return prompt;
}
