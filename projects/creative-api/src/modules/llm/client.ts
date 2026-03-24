/** LLM Client — 멀티 프로바이더 추상화
 *
 * 기본: Gemini 2.5 Flash (가장 저렴)
 * 환경변수 CREATIVE_MODEL로 오버라이드 가능
 *
 * 지원 모델:
 * - google/gemini-2.5-flash (기본, $0.15/1M input)
 * - anthropic/claude-sonnet-4-20250514 (고품질, $3/1M input)
 * - openai/gpt-4o (범용)
 * - openai/o3-mini (추론 특화)
 *
 * 환경변수:
 * - GOOGLE_GENERATIVE_AI_API_KEY (기본 프로바이더)
 * - ANTHROPIC_API_KEY (선택)
 * - OPENAI_API_KEY (선택)
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

/** 기본 모델 — 가장 저렴한 Gemini Flash */
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

/** 환경변수 기반 모델 선택 */
function getModelId(): string {
  return process.env.CREATIVE_MODEL ?? DEFAULT_MODEL;
}

/** 사용 가능한 프로바이더 목록 반환 */
export function getAvailableProviders(): { provider: string; configured: boolean }[] {
  return [
    { provider: 'google', configured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY },
    { provider: 'anthropic', configured: !!process.env.ANTHROPIC_API_KEY },
    { provider: 'openai', configured: !!process.env.OPENAI_API_KEY },
  ];
}

/** 모델 ID → AI SDK 모델 인스턴스 */
export function getModel(modelId?: string): LanguageModel {
  const id = modelId ?? getModelId();
  const [provider, ...nameParts] = id.split('/');
  const name = nameParts.join('/');

  switch (provider) {
    case 'google':
      return google(name || 'gemini-2.5-flash');
    case 'anthropic':
      return anthropic(name || 'claude-sonnet-4.6');
    case 'openai':
      return openai(name || 'gpt-4o');
    default:
      // 슬래시 없으면 Google으로 간주
      return google(id);
  }
}

/** 단순 텍스트 생성 */
export async function llmGenerate(options: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const result = await generateText({
    model: getModel(options.model),
    system: options.system,
    prompt: options.prompt,
    maxOutputTokens: options.maxTokens ?? 4096,
  });
  return result.text;
}

/** JSON 응답 생성 — 텍스트에서 JSON 추출 */
export async function llmGenerateJSON<T = unknown>(options: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  model?: string;
}): Promise<T> {
  const text = await llmGenerate(options);
  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch?.[1]?.trim() ?? text.trim();
  return JSON.parse(jsonStr) as T;
}

export { generateText } from 'ai';
