import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { query: q, results: [], message: 'Memgraph not connected yet' },
  });
}
