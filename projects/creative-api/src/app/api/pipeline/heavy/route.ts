import { NextResponse } from 'next/server';
import { startHeavySession } from '@/modules/agents/clawteam-client';
import type { ApiResponse } from '@/types/api';

/** POST /api/pipeline/heavy — ClawTeam Python 서버로 heavy 세션 실행 */
export async function POST(request: Request) {
  try {
    const { topic, domain, template = 'creative-session' } = await request.json();

    if (!topic || !domain) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'topic and domain are required' },
        { status: 400 }
      );
    }

    const result = await startHeavySession(topic, domain, template);

    if (result.status === 'failed') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error ?? 'ClawTeam server unavailable' },
        { status: 502 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 });
  }
}
