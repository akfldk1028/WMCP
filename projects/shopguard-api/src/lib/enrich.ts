/** Enrich dark pattern results with human-readable descriptions */

interface RawDarkPattern {
  type: string;
  evidence: string;
  context: string;
  locale?: string;
  elementType?: string;
}

interface EnrichedDarkPattern extends RawDarkPattern {
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  tip: string;
}

const CATALOG: Record<string, { risk: EnrichedDarkPattern['risk']; description: string; tip: string }> = {
  'fake-urgency': {
    risk: 'medium',
    description: 'Creates artificial scarcity or time pressure to force you into buying immediately.',
    tip: 'Check back later - these "limited stock" counters often reset. Take your time.',
  },
  'fake-social-proof': {
    risk: 'medium',
    description: 'Uses fabricated activity numbers (viewers, buyers) to make you feel like you\'ll miss out.',
    tip: 'These numbers are often generated randomly. Don\'t let them rush your decision.',
  },
  'confirm-shaming': {
    risk: 'high',
    description: 'Makes the "no thanks" option sound embarrassing to shame you into accepting.',
    tip: 'This is a manipulation tactic. You\'re not "missing out" by clicking no.',
  },
  'misdirection': {
    risk: 'medium',
    description: 'Uses visual tricks (big "Accept" button, tiny "Decline" link) to steer your choices.',
    tip: 'Look for the smaller, less visible option - it\'s usually the one that protects your privacy.',
  },
  'preselection': {
    risk: 'medium',
    description: 'Options are pre-checked to benefit the seller, not you (e.g., newsletter, premium shipping).',
    tip: 'Always review checkboxes before submitting. Uncheck anything you didn\'t actively choose.',
  },
  'forced-continuity': {
    risk: 'high',
    description: 'Free trial automatically converts to a paid subscription without clear warning.',
    tip: 'Set a calendar reminder before the trial ends. Check cancellation steps BEFORE signing up.',
  },
  'obstruction': {
    risk: 'critical',
    description: 'Cancelling or unsubscribing is made intentionally difficult (requiring phone calls, letters, etc.).',
    tip: 'This may violate consumer protection laws in many countries. Document your cancellation attempts.',
  },
  'hidden-costs': {
    risk: 'high',
    description: 'Extra fees are hidden until checkout - the price you see isn\'t the price you pay.',
    tip: 'Always check the final price at checkout before confirming. Compare with other sellers.',
  },
  'privacy-zuckering': {
    risk: 'high',
    description: 'Tricks you into sharing more personal data than intended through confusing consent flows.',
    tip: 'Read consent forms carefully. "By continuing" clauses often hide broad data sharing agreements.',
  },
};

const FALLBACK = {
  risk: 'medium' as const,
  description: 'A potentially deceptive design pattern was detected.',
  tip: 'Be cautious and review this element carefully before proceeding.',
};

export function enrichDarkPatterns(results: RawDarkPattern[]): EnrichedDarkPattern[] {
  return results.map(r => {
    const info = CATALOG[r.type] || FALLBACK;
    return {
      ...r,
      risk: info.risk,
      description: info.description,
      tip: info.tip,
    };
  });
}
