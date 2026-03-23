import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

// TODO: Memgraph 연결 후 실제 구현
export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { nodes: [], message: 'Memgraph not connected yet' },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { created: body, message: 'Memgraph not connected yet — node not persisted' },
  });
}
