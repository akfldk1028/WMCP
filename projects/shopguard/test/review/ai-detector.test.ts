import { describe, it, expect } from 'vitest';
import {
  detectAIGenerated,
  detectAIGeneratedBatch,
  measureBurstiness,
  measureTTR,
  measureExclamationDensity,
} from '../../src/review/ai-detector.js';

describe('measureBurstiness', () => {
  it('returns high burstiness for natural text with varied sentences', () => {
    const text =
      'Great product! I have been using it for weeks now. ' +
      'The battery lasts forever. ' +
      'However, I do think the camera could be significantly improved in low-light conditions and the software needs some optimization work to reduce lag.';
    const b = measureBurstiness(text);
    expect(b).toBeGreaterThan(0.3);
  });

  it('returns low burstiness for uniform sentences', () => {
    const text =
      'The product quality is very good. ' +
      'The delivery speed was quite fast. ' +
      'The packaging looked really nice. ' +
      'The customer service was helpful. ' +
      'The price point seems quite fair.';
    const b = measureBurstiness(text);
    expect(b).toBeLessThan(0.7);
  });

  it('handles single sentence', () => {
    const b = measureBurstiness('Just one sentence here.');
    expect(b).toBe(0.5);
  });
});

describe('measureTTR', () => {
  it('returns high TTR for diverse vocabulary', () => {
    const text =
      'The camera captures stunning photographs with remarkable clarity. ' +
      'Battery endurance surpasses expectations significantly. ' +
      'Ergonomic design facilitates comfortable extended usage sessions.';
    const ttr = measureTTR(text);
    expect(ttr).toBeGreaterThan(0.5);
  });

  it('returns lower TTR for repetitive text', () => {
    const text =
      'good product good quality good price good delivery good packaging good product good quality';
    const ttr = measureTTR(text);
    expect(ttr).toBeLessThan(0.8);
  });
});

describe('measureExclamationDensity', () => {
  it('detects exclamatory text', () => {
    const text = 'Amazing product! Best purchase ever! Love it so much! Wow!';
    const density = measureExclamationDensity(text);
    expect(density).toBeGreaterThan(0.5);
  });

  it('detects Korean emotional markers', () => {
    const text = '대박 이거 진짜 좋아요ㅋㅋㅋ 최고입니다!';
    const density = measureExclamationDensity(text);
    expect(density).toBeGreaterThan(0);
  });

  it('returns 0 for neutral text', () => {
    const text = 'The product arrived on time. It functions as described. No issues.';
    const density = measureExclamationDensity(text);
    expect(density).toBe(0);
  });
});

describe('detectAIGenerated', () => {
  it('returns low score for natural human text', () => {
    const text =
      'Honestly? Not bad! Been using it for about 2 weeks now. ' +
      'Battery is AMAZING - lasts me all day even with heavy use. ' +
      'Camera... meh. It is ok in daylight but terrible at night. ' +
      'For the price tho, can not really complain. Would buy again.';
    const result = detectAIGenerated(text);
    expect(result.score).toBeLessThan(50);
  });

  it('returns higher score for AI-like text', () => {
    const text =
      'This product delivers exceptional performance across all metrics. ' +
      'The build quality demonstrates remarkable attention to detail. ' +
      'The user interface provides an intuitive navigation experience. ' +
      'The battery performance exceeds expectations by a wide margin. ' +
      'The camera functionality captures images with impressive clarity. ' +
      'The overall value proposition represents a compelling investment.';
    const result = detectAIGenerated(text);
    expect(result.score).toBeGreaterThan(20);
  });

  it('includes detail messages', () => {
    const result = detectAIGenerated('Short text.');
    expect(result.details).toBeDefined();
    expect(result.details.length).toBeGreaterThan(0);
  });
});

describe('detectAIGeneratedBatch', () => {
  it('calculates average score across multiple texts', () => {
    const texts = [
      'Great product! Love it!',
      'The product delivers exceptional value and performance.',
      'Meh, it is ok I guess. Works fine.',
    ];
    const result = detectAIGeneratedBatch(texts);
    expect(result.individualScores).toHaveLength(3);
    expect(result.averageScore).toBeGreaterThanOrEqual(0);
    expect(result.averageScore).toBeLessThanOrEqual(100);
  });

  it('handles empty array', () => {
    const result = detectAIGeneratedBatch([]);
    expect(result.averageScore).toBe(0);
    expect(result.individualScores).toHaveLength(0);
  });
});
