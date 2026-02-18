/** MCP Prompts — analysis workflow templates for AI agents */

export interface PromptEntry {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  getMessages: (args: Record<string, string>) => Array<{
    role: 'user' | 'assistant';
    content: { type: 'text'; text: string };
  }>;
}

export const ANALYZE_SHOPPING_PAGE: PromptEntry = {
  name: 'analyze-shopping-page',
  description: 'Full shopping page analysis workflow — guides the agent through the optimal sequence of ShopGuard tool calls',
  arguments: [
    { name: 'url', description: 'Page URL (optional, helps platform detection)', required: false },
  ],
  getMessages: (args) => [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Analyze this shopping page for consumer protection issues.${args.url ? ` URL: ${args.url}` : ''}

## Workflow

Follow these steps in order:

### Step 1: Page Overview
Call \`extractPageData\` with the page HTML${args.url ? ` and url="${args.url}"` : ''}.
This gives you: platform detection, price contexts, review blocks, interactive elements, and agent-readiness signals.

### Step 2: Dark Pattern Scan (always do this)
Call \`scanDarkPatterns\` with the page text content and HTML.
Look for: urgency tactics, fake social proof, confirm-shaming, preselection, obstruction.

### Step 3: Price Analysis (if prices found)
If Step 1 found price contexts, call \`extractPricing\` with the HTML.
Look for: hidden fees, subscription traps, drip pricing signals.

### Step 4: Review Analysis (if reviews found)
If Step 1 found review blocks, call \`extractReviews\` with the HTML.
Look for: date clustering, rating anomalies, phrase repetition, AI-generated content, incentive keywords.

### Step 5: Agent Readiness Check (if detected)
If Step 1 detected agent-readiness signals, call \`detectAgentReadiness\` for detailed signal inventory.

### Step 6: Synthesize
Combine all evidence into a coherent assessment:
- List each finding with its evidence
- Assess overall shopping safety
- Provide specific, actionable recommendations
- Note what you could NOT determine (e.g., dynamic pricing requires multiple visits)

## Important Notes
- DO NOT assign numeric scores or letter grades — present evidence and let the user decide
- Each tool returns structured evidence, not judgments
- Cross-reference findings (e.g., fake urgency + hidden fees = high concern)
- Consider the platform context (some fees are standard for certain platforms)
- Read the resource catalogs first if you need domain knowledge about dark patterns or pricing tactics`,
      },
    },
  ],
};

export const VERIFY_REVIEWS: PromptEntry = {
  name: 'verify-reviews',
  description: 'Deep review authenticity analysis — guides the agent through multi-signal review verification',
  arguments: [
    { name: 'locale', description: 'Language (ko or en)', required: false },
  ],
  getMessages: (args) => [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Perform a deep analysis of product reviews for authenticity.

## Workflow

### Step 1: Extract Reviews
Call \`extractReviews\` with the HTML and locale="${args.locale ?? 'ko'}".
This returns structured reviews + 7 statistical signals with evidence.

### Step 2: Analyze Signals
For each signal in the response, examine the evidence strings:
- **dateCluster**: Are reviews unnaturally clustered on specific dates?
- **ratingAnomaly**: Is the rating distribution suspicious (e.g., 95% five-star)?
- **phraseRepetition**: Do reviews share exact phrases across different authors?
- **lengthUniformity**: Are review lengths suspiciously similar?
- **incentiveKeywords**: How many reviews disclose sponsorship/incentives?
- **ratingSurge**: Are there sudden spikes of positive reviews?
- **aiGeneration**: Do reviews show statistical patterns of AI-generated text?

### Step 3: Cross-source Comparison (if available)
If reviews from multiple sources exist, call \`compareReviewSets\` to find:
- Rating differences across platforms
- Duplicate/copied reviews
- Sentiment gaps

### Step 4: Present Findings
For each flagged signal:
- Quote the specific evidence
- Explain what it means for the user
- Note the limitations (e.g., "incentive keywords don't necessarily mean the review is fake")

## Important Notes
- Present evidence, not verdicts
- Some signals are more reliable in combination (e.g., date clustering + phrase repetition = stronger signal)
- Consider sample size — signals from 3 reviews are less reliable than from 50
- Incentivized ≠ fake — disclosed sponsorship is actually a positive transparency signal`,
      },
    },
  ],
};

export const PRICE_CHECK: PromptEntry = {
  name: 'price-check',
  description: 'Price transparency analysis — guides the agent through hidden fee and pricing tactic detection',
  arguments: [],
  getMessages: () => [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Analyze this page for pricing transparency and hidden costs.

## Workflow

### Step 1: Extract Pricing
Call \`extractPricing\` with the page HTML.
This returns: price components, fee matches (with context), and trap matches.

### Step 2: Analyze Fee Matches
For each fee match:
- Check the \`context\` field (100 chars around the match) for full context
- Check \`nearbyPrice\` to see the associated amount
- Consider if the fee is standard for this type of service

### Step 3: Analyze Trap Matches
For each trap match:
- Identify the trap type (e.g., introductory-price-hike, free-trial-auto-charge)
- Check the evidence and surrounding context
- Assess how clearly the trap is disclosed to the user

### Step 4: Price Comparison (if multiple sources)
If prices from multiple stores are available, call \`comparePrices\` to find:
- Price spread across sources
- Outlier detection (unusually high/low prices)
- Fee-inclusive total comparison

### Step 5: Present Findings
- List all detected fees with amounts and context
- Highlight fees that appear hidden or are added late in checkout
- Note subscription/continuity traps
- Calculate estimated total including all fees
- Recommend what to watch for at checkout

## Important Notes
- Some fees are legitimate and standard (e.g., shipping)
- The key question is TRANSPARENCY: was the fee clearly disclosed upfront?
- Consider regional norms (e.g., 배송비 is normal in Korean e-commerce)
- Drip pricing requires comparing initial vs. checkout prices — note if you can only see one stage`,
      },
    },
  ],
};

export const ALL_PROMPTS = [ANALYZE_SHOPPING_PAGE, VERIFY_REVIEWS, PRICE_CHECK];
