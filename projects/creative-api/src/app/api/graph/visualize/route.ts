import { NextResponse } from 'next/server';
import { generateMockGraph, SEED_ITERATION_CHAIN } from '@/lib/mock-graph';
import type { ApiResponse } from '@/types/api';

/** GET /api/graph/visualize — 3D 렌더용 그래프 데이터 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') ?? 'mock';
  const maxNodes = parseInt(searchParams.get('maxNodes') ?? '100', 10);

  try {
    // TODO: Memgraph 연결 후 실제 데이터로 교체
    if (mode === 'seed') {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: SEED_ITERATION_CHAIN,
      });
    }

    const data = generateMockGraph(maxNodes, Math.floor(maxNodes * 1.5));
    return NextResponse.json<ApiResponse>({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>({ success: false, error: message }, { status: 500 });
  }
}
