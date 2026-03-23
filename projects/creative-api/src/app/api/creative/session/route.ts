import { NextResponse } from 'next/server';
import { runFourIsPipeline } from '@/modules/creativity/pipeline/four-is';
import type { CreateSessionRequest } from '@/types/session';
import type { ApiResponse } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateSessionRequest;

    if (!body.topic || !body.domain) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'topic and domain are required' },
        { status: 400 }
      );
    }

    const session = await runFourIsPipeline(body.topic, body.domain, {
      divergentCount: body.divergentCount,
    });

    return NextResponse.json<ApiResponse>({ success: true, data: session });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
