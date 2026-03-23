import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/api';

export async function GET() {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { edges: [], message: 'Memgraph not connected yet' },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json<ApiResponse>({
    success: true,
    data: { created: body, message: 'Memgraph not connected yet — edge not persisted' },
  });
}
