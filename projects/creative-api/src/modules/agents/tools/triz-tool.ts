/** TRIZ 40 Inventive Principles Tool
 *
 * 근거:
 * - Altshuller, G. (1999). The Innovation Algorithm.
 * - TRIZ Agents (Szczepanik & Chudziak, ICAART 2025)
 * - TRIZ-GPT (Chen et al., 2024)
 * - TRIZ-RAGNER (Xu et al., 2026)
 *
 * SCAMPER는 TRIZ의 단순화 버전. TRIZ 40원리는 더 체계적이고 강력.
 * 에이전트가 문제의 "모순"을 식별 → 적절한 원리 추천.
 */

import type { AgentTool } from './registry';

/** TRIZ 40 Inventive Principles (핵심 20개, 나머지는 참조용) */
const TRIZ_PRINCIPLES: Record<number, { name: string; description: string; example: string }> = {
  1:  { name: 'Segmentation', description: 'Divide an object into independent parts', example: 'Modular furniture, microservices architecture' },
  2:  { name: 'Taking out / Extraction', description: 'Extract the disturbing part or property', example: 'Noise-cancelling headphones extract noise' },
  3:  { name: 'Local quality', description: 'Change uniform structure to non-uniform', example: 'Progressive lens glasses' },
  5:  { name: 'Merging / Consolidation', description: 'Combine identical or similar objects/operations', example: 'Swiss Army knife, all-in-one apps' },
  6:  { name: 'Universality', description: 'Make an object perform multiple functions', example: 'Smartphone replacing camera+phone+GPS' },
  7:  { name: 'Nested doll (Matryoshka)', description: 'Place one object inside another', example: 'Telescoping antenna, nested containers' },
  10: { name: 'Preliminary action', description: 'Perform required changes in advance', example: 'Pre-pasted wallpaper, pre-loaded content' },
  13: { name: 'The other way round / Inversion', description: 'Invert the action or process', example: 'Running on treadmill instead of road' },
  15: { name: 'Dynamization', description: 'Make rigid objects flexible or adaptable', example: 'Adjustable standing desk, responsive design' },
  17: { name: 'Another dimension', description: 'Move to a new dimension (1D→2D→3D)', example: 'QR codes (1D barcode→2D), 3D printing' },
  18: { name: 'Mechanical vibration', description: 'Use oscillation, resonance, or frequency', example: 'Ultrasonic cleaning, vibration alerts' },
  22: { name: 'Blessing in disguise', description: 'Use harmful factors to achieve positive effect', example: 'Vaccination uses weakened virus' },
  24: { name: 'Intermediary / Mediator', description: 'Use an intermediate object to transfer action', example: 'API gateway, middleware, translator' },
  25: { name: 'Self-service', description: 'Make the object service itself', example: 'Self-cleaning oven, auto-update software' },
  26: { name: 'Copying', description: 'Use simpler/cheaper copies', example: 'Digital twin, simulation, mockup' },
  28: { name: 'Mechanics substitution', description: 'Replace mechanical with sensory means', example: 'Touch ID replacing physical keys' },
  29: { name: 'Pneumatics and hydraulics', description: 'Use gas/liquid instead of solid parts', example: 'Air cushion packaging, cloud computing' },
  32: { name: 'Color changes', description: 'Change color or transparency', example: 'Mood ring, pH indicator, dark mode' },
  35: { name: 'Parameter changes', description: 'Change physical/chemical state', example: 'Freeze-dried food, compressed files' },
  40: { name: 'Composite materials', description: 'Replace homogeneous with composite', example: 'Carbon fiber, hybrid apps, ensemble models' },
};

export const trizTool: AgentTool = {
  name: 'triz_principle',
  description: `Apply TRIZ (Theory of Inventive Problem Solving) principles to find innovative solutions. TRIZ is more systematic than SCAMPER — it identifies contradictions in a problem and suggests specific inventive principles. Based on Altshuller (1999), TRIZ Agents (ICAART 2025), TRIZ-GPT (2024).

Use this when:
- SCAMPER feels too generic for the problem
- There's a clear CONTRADICTION (improving X worsens Y)
- You need engineering-level inventive solutions`,
  parameters: {
    problem: { type: 'string', description: 'Description of the problem or idea to improve' },
    contradiction: { type: 'string', description: 'The contradiction: "Improving X worsens Y"' },
    principle_number: { type: 'number', description: 'Specific TRIZ principle to apply (optional, agent can choose)' },
  },
  execute: async (params) => {
    const num = params.principle_number as number | undefined;

    if (num && TRIZ_PRINCIPLES[num]) {
      const p = TRIZ_PRINCIPLES[num];
      return {
        principle: { number: num, ...p },
        instruction: `Apply TRIZ Principle #${num} "${p.name}" to the problem: "${params.problem}". Contradiction: "${params.contradiction}". Example: ${p.example}. Generate a solution that resolves the contradiction using this principle.`,
      };
    }

    // 원리 미지정 → 관련 원리 3개 추천
    const recommended = [1, 5, 13, 15, 17, 24, 25, 40]
      .map((n) => ({ number: n, ...TRIZ_PRINCIPLES[n] }));

    return {
      problem: params.problem,
      contradiction: params.contradiction,
      availablePrinciples: recommended,
      instruction: `Choose the most relevant TRIZ principle for this contradiction: "${params.contradiction}". Apply it to generate an inventive solution. Save the solution with graph_add_node.`,
      reference: 'Altshuller (1999), TRIZ Agents (ICAART 2025)',
    };
  },
};
