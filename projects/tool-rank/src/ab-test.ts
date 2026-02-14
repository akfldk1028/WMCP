import type { ABTest, ToolVariant, ToolMetrics } from './types.js';

/**
 * Manages A/B tests for MCP tool descriptions.
 *
 * Tracks impressions, selections, completions, and errors for each variant,
 * then uses a simplified chi-square test to determine statistical significance
 * and pick a winner.
 */
export class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private metrics: Map<string, ToolMetrics> = new Map();

  /**
   * Create a new A/B test for a tool.
   *
   * @param toolName - The name of the tool being tested
   * @param variants - Array of description variants with optional traffic weights
   * @returns The newly created ABTest
   */
  createTest(
    toolName: string,
    variants: Array<{ description: string; weight?: number }>,
  ): ABTest {
    if (variants.length < 2) {
      throw new Error('A/B test requires at least 2 variants');
    }

    const testId = crypto.randomUUID();

    // Normalize weights so they sum to 1
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight ?? 1), 0);
    const toolVariants: ToolVariant[] = variants.map((v) => {
      const variantId = crypto.randomUUID();

      // Initialize empty metrics for this variant
      this.metrics.set(variantId, {
        variantId,
        impressions: 0,
        selections: 0,
        completions: 0,
        errors: 0,
        avgResponseTime: 0,
        selectionRate: 0,
        successRate: 0,
        score: 0,
      });

      return {
        id: variantId,
        toolName,
        description: v.description,
        weight: (v.weight ?? 1) / totalWeight,
      };
    });

    const test: ABTest = {
      id: testId,
      toolName,
      variants: toolVariants,
      startedAt: new Date().toISOString(),
      status: 'running',
    };

    this.tests.set(testId, test);
    return test;
  }

  /**
   * Select a variant to show using weighted random selection.
   *
   * @returns The selected ToolVariant or null if the test does not exist / is not running
   */
  selectVariant(testId: string): ToolVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') return null;

    const rand = Math.random();
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (rand <= cumulative) {
        return variant;
      }
    }

    // Fallback to last variant (handles floating-point edge case)
    return test.variants[test.variants.length - 1];
  }

  /**
   * Record that an agent was shown this variant's description.
   */
  recordImpression(testId: string, variantId: string): void {
    this.ensureTestVariant(testId, variantId);
    const m = this.metrics.get(variantId)!;
    m.impressions++;
    this.recalculateRates(m);
  }

  /**
   * Record that the agent selected (called) the tool with this variant.
   */
  recordSelection(testId: string, variantId: string): void {
    this.ensureTestVariant(testId, variantId);
    const m = this.metrics.get(variantId)!;
    m.selections++;
    this.recalculateRates(m);
  }

  /**
   * Record a tool execution completion (success or failure).
   */
  recordCompletion(
    testId: string,
    variantId: string,
    success: boolean,
    responseTime: number,
  ): void {
    this.ensureTestVariant(testId, variantId);
    const m = this.metrics.get(variantId)!;

    if (success) {
      m.completions++;
    } else {
      m.errors++;
    }

    // Rolling average of response time across all completions + errors
    const totalCalls = m.completions + m.errors;
    m.avgResponseTime =
      (m.avgResponseTime * (totalCalls - 1) + responseTime) / totalCalls;

    this.recalculateRates(m);
  }

  /**
   * Get metrics for every variant in a test.
   */
  getMetrics(testId: string): ToolMetrics[] {
    const test = this.tests.get(testId);
    if (!test) return [];

    return test.variants
      .map((v) => this.metrics.get(v.id))
      .filter((m): m is ToolMetrics => m !== undefined);
  }

  /**
   * Determine whether the test results are statistically significant
   * using a chi-square omnibus test on selection rates.
   *
   * This is a single test (H0: all variants have equal selection rates),
   * so no multiple-comparison correction is needed.
   *
   * Dynamic minimum sample size: each variant needs enough impressions
   * so that the expected frequency per cell is >= 5 (chi-square assumption).
   * Capped at 5000 to prevent tests from never concluding with low rates.
   *
   * @param confidence - p-value threshold (default 0.05)
   */
  isSignificant(
    testId: string,
    confidence: number = 0.05,
  ): { significant: boolean; pValue: number; winner?: string } {
    const metricsArr = this.getMetrics(testId);
    if (metricsArr.length < 2) {
      return { significant: false, pValue: 1 };
    }

    const numVariants = metricsArr.length;

    // Dynamic minimum sample size: ensure expected frequency >= 5 per cell.
    // Capped at 5000 to prevent extremely low-rate tests from never concluding.
    const totalImpressions = metricsArr.reduce((s, m) => s + m.impressions, 0);
    const totalSelections = metricsArr.reduce((s, m) => s + m.selections, 0);
    const overallRate = totalImpressions > 0 ? totalSelections / totalImpressions : 0;

    const minSamplesPerVariant = overallRate > 0
      ? Math.max(30, Math.min(5000, Math.ceil(5 / overallRate)))
      : 30;

    const hasEnoughData = metricsArr.every((m) => m.impressions >= minSamplesPerVariant);
    if (!hasEnoughData) {
      return { significant: false, pValue: 1 };
    }

    // Verify expected frequencies >= 5 for all cells
    const allExpectedValid = metricsArr.every((m) => {
      const expected = m.impressions * overallRate;
      return expected >= 5;
    });
    if (!allExpectedValid) {
      return { significant: false, pValue: 1 };
    }

    // Chi-square goodness-of-fit test (single omnibus test).
    // H0: all variants have the same selection rate.
    let chiSquare = 0;
    for (const m of metricsArr) {
      const expected = m.impressions * overallRate;
      if (expected > 0) {
        chiSquare += Math.pow(m.selections - expected, 2) / expected;
      }
    }

    // Degrees of freedom = number of variants - 1
    const df = numVariants - 1;
    const pValue = 1 - chiSquareCDF(chiSquare, df);

    const significant = pValue < confidence;

    let winner: string | undefined;
    if (significant) {
      // Winner is the variant with the highest composite score
      const best = metricsArr.reduce((a, b) => (a.score > b.score ? a : b));
      winner = best.variantId;
    }

    return { significant, pValue, winner };
  }

  /**
   * Conclude a test by picking the winner variant.
   *
   * Winner is the variant with the highest composite score:
   *   score = selectionRate * 0.6 + successRate * 0.4
   */
  concludeTest(testId: string): ABTest {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test not found: ${testId}`);

    const metricsArr = this.getMetrics(testId);
    if (metricsArr.length === 0) {
      throw new Error(`No metrics available for test: ${testId}`);
    }

    const best = metricsArr.reduce((a, b) => (a.score > b.score ? a : b));

    test.status = 'completed';
    test.winnerVariantId = best.variantId;

    return test;
  }

  /**
   * Get all tests that are currently running.
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter((t) => t.status === 'running');
  }

  /**
   * Export all test data and metrics as a JSON string.
   */
  exportData(): string {
    const data = {
      tests: Array.from(this.tests.values()),
      metrics: Array.from(this.metrics.values()),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Validate that the test and variant exist */
  private ensureTestVariant(testId: string, variantId: string): void {
    const test = this.tests.get(testId);
    if (!test) throw new Error(`Test not found: ${testId}`);
    if (!test.variants.some((v) => v.id === variantId)) {
      throw new Error(`Variant ${variantId} not found in test ${testId}`);
    }
    if (!this.metrics.has(variantId)) {
      throw new Error(`Metrics not initialized for variant ${variantId}`);
    }
  }

  /** Recalculate derived rates and composite score */
  private recalculateRates(m: ToolMetrics): void {
    m.selectionRate = m.impressions > 0 ? m.selections / m.impressions : 0;
    m.successRate = m.selections > 0 ? m.completions / m.selections : 0;
    m.score = m.selectionRate * 0.6 + m.successRate * 0.4;
  }
}

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

/**
 * Approximate the chi-square CDF using the regularized lower incomplete
 * gamma function. This is a simplified implementation suitable for the
 * small degrees-of-freedom values we encounter in A/B testing (typically 1-4).
 */
function chiSquareCDF(x: number, k: number): number {
  if (x <= 0) return 0;
  return lowerIncompleteGamma(k / 2, x / 2) / gamma(k / 2);
}

/**
 * Lower incomplete gamma function via series expansion.
 * gamma(s, x) = x^s * e^(-x) * sum_{n=0}^{inf} x^n / (s*(s+1)*...*(s+n))
 */
function lowerIncompleteGamma(s: number, x: number): number {
  if (x <= 0) return 0;

  let sum = 0;
  let term = 1 / s;
  const maxIterations = 200;
  const epsilon = 1e-12;

  for (let n = 0; n < maxIterations; n++) {
    sum += term;
    term *= x / (s + n + 1);
    if (Math.abs(term) < epsilon) break;
  }

  return Math.pow(x, s) * Math.exp(-x) * sum;
}

/**
 * Lanczos approximation of the gamma function.
 */
function gamma(z: number): number {
  if (z < 0.5) {
    // Reflection formula
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }

  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];

  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }

  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
