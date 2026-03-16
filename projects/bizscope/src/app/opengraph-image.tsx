import { ImageResponse } from 'next/og';

export const alt = 'BizScope — AI 비즈니스 전략 보고서';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 40%, #7c3aed 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* BS Logo Mark */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: -10,
            marginBottom: 20,
            opacity: 0.95,
            display: 'flex',
          }}
        >
          BS
        </div>

        {/* Title */}
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2, display: 'flex' }}>
          BizScope
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 32, opacity: 0.9, marginTop: 16, display: 'flex' }}>
          AI 비즈니스 전략 보고서
        </div>

        {/* Tags */}
        <div style={{ fontSize: 20, opacity: 0.7, marginTop: 24, display: 'flex' }}>
          12 Frameworks · Consulting-Grade Analysis
        </div>
      </div>
    ),
    { ...size },
  );
}
