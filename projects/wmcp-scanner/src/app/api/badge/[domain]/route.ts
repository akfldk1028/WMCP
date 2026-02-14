import { NextRequest, NextResponse } from 'next/server';
import { scanUrl } from '@wmcp/scanner-engine';
import { gradeColor } from '@wmcp/core';

function generateBadgeSvg(grade: string, color: string): string {
  const labelWidth = 80;
  const valueWidth = 40;
  const totalWidth = labelWidth + valueWidth;
  const height = 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="${height}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-rendering="geometricPrecision">
    <text x="${labelWidth / 2}" y="14" fill="#010101" fill-opacity=".3">WebMCP</text>
    <text x="${labelWidth / 2}" y="13">WebMCP</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#010101" fill-opacity=".3">${grade}</text>
    <text x="${labelWidth + valueWidth / 2}" y="13">${grade}</text>
  </g>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;

  // Validate domain format (reject IPs, localhost, internal hosts)
  const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!domainPattern.test(domain)) {
    const svg = generateBadgeSvg('?', '#9ca3af');
    return new NextResponse(svg, {
      status: 400,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, s-maxage=300' },
    });
  }

  try {
    const url = `https://${domain}`;
    const result = await scanUrl(url, { timeout: 10000 });
    const grade = result.detailedScore.grade;
    const color = gradeColor(grade);
    const svg = generateBadgeSvg(grade, color);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch {
    const svg = generateBadgeSvg('?', '#9ca3af');
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  }
}
